import React, { useState, useRef, useCallback, useEffect } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { AnimatePresence } from 'framer-motion';
import { GRAPH_DATA } from '../../data/madagascarGraphData';
import { FluidBackground } from '../ui/FluidBackground';
import { RegionSidebar } from './RegionSidebar';

const NODE_COLOR = (node) => {
  if (node.type === 'region') return node.accent ?? '#22d3ee';
  if (node.type === 'stat')   return '#a855f7';
  return '#22c55e';
};

export function ForceGraphDashboard() {
  const graphRef     = useRef(null);
  const containerRef = useRef(null);   // inner div inside card
  const graphDimsRef = useRef({ w: 0, h: 0 });

  const [dimensions,   setDimensions]   = useState({ width: 0, height: 0 });
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode,  setHoveredNode]  = useState(null);
  const [focusedNode,  setFocusedNode]  = useState(null);

  // Mutable refs for canvas callbacks (avoid stale closures)
  const selectedRef  = useRef(null);
  const hoveredRef   = useRef(null);
  const focusedRef   = useRef(null);
  const connectedRef = useRef(null);
  selectedRef.current = selectedNode;
  hoveredRef.current  = hoveredNode;

  // Update focus + connected-node set whenever focusedNode changes
  useEffect(() => {
    focusedRef.current = focusedNode;
    if (!focusedNode) { connectedRef.current = null; return; }
    const ids = new Set([focusedNode.id]);
    GRAPH_DATA.links.forEach(link => {
      const s = typeof link.source === 'object' ? link.source.id : link.source;
      const t = typeof link.target === 'object' ? link.target.id : link.target;
      if (s === focusedNode.id) ids.add(t);
      if (t === focusedNode.id) ids.add(s);
    });
    connectedRef.current = ids;
  }, [focusedNode]);

  // ResizeObserver on inner card container
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setDimensions({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Keep dims ref in sync for boundary force (no re-render needed there)
  const sidebarW = selectedNode ? 370 : 0;
  const graphW   = dimensions.width  > 0 ? dimensions.width  - sidebarW : 0;
  const graphH   = dimensions.height > 0 ? dimensions.height            : 0;
  useEffect(() => { graphDimsRef.current = { w: graphW, h: graphH }; }, [graphW, graphH]);

  // Forces + boundary bounce (mounted once; reads dims from ref)
  useEffect(() => {
    const g = graphRef.current;
    if (!g) return;
    const id = setTimeout(() => {
      g.d3Force('link')?.distance(l => {
        const tt = typeof l.target === 'object' ? l.target?.type : null;
        if (tt === 'stat') return 52;
        if (tt === 'note') return 68;
        return 90;
      });
      g.d3Force('charge')?.strength(-160);
      g.d3Force('center')?.strength(0.06);

      // ── Boundary bounce ──────────────────────────────────────────
      g.d3Force('boundary', () => {
        const { w, h } = graphDimsRef.current;
        if (!w || !h) return;
        const pad  = 28;
        const halfW = w / 2 - pad;
        const halfH = h / 2 - pad;
        GRAPH_DATA.nodes.forEach(node => {
          if (node.fx != null) return; // skip dragged / pinned
          if (node.x < -halfW) { node.x = -halfW; if (node.vx < 0) node.vx = Math.abs(node.vx ?? 0) * 0.8; }
          if (node.x >  halfW) { node.x =  halfW; if (node.vx > 0) node.vx = -Math.abs(node.vx ?? 0) * 0.8; }
          if (node.y < -halfH) { node.y = -halfH; if (node.vy < 0) node.vy = Math.abs(node.vy ?? 0) * 0.8; }
          if (node.y >  halfH) { node.y =  halfH; if (node.vy > 0) node.vy = -Math.abs(node.vy ?? 0) * 0.8; }
        });
      });

      g.d3ReheatSimulation?.();
    }, 160);
    return () => clearTimeout(id);
  }, []);

  // Re-heat whenever the visible graph area changes (sidebar open/close)
  useEffect(() => {
    if (graphW > 0 && graphH > 0) graphRef.current?.d3ReheatSimulation?.();
  }, [graphW, graphH]);

  // ── Canvas node painter ─────────────────────────────────────────────────
  const paintNode = useCallback((node, ctx, globalScale) => {
    const sel       = selectedRef.current;
    const hov       = hoveredRef.current;
    const foc       = focusedRef.current;
    const connected = connectedRef.current;

    const inFocusMode = foc !== null;
    const isConnected = !connected || connected.has(node.id);
    const isFocused   = foc?.id === node.id;
    const isSelected  = sel?.id === node.id;
    const isHovered   = hov?.id === node.id;

    const r     = Math.sqrt(node.val ?? 4) * 4;
    const color = NODE_COLOR(node);

    ctx.save();

    if (inFocusMode && !isConnected) ctx.globalAlpha = 0.06;

    ctx.shadowColor = color;
    ctx.shadowBlur  = isFocused ? 44 : isSelected ? 34 : isHovered ? 22 : node.type === 'region' ? 13 : 7;

    ctx.beginPath();
    ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
    ctx.fillStyle = (isFocused || isSelected) ? color : `${color}${node.type === 'region' ? 'dd' : '88'}`;
    ctx.fill();

    if (node.type === 'region') {
      ctx.strokeStyle = (isFocused || isSelected) ? '#ffffff' : `${color}50`;
      ctx.lineWidth   = ((isFocused || isSelected) ? 2 : 1.1) / globalScale;
      ctx.stroke();
    }

    ctx.shadowBlur = 0;
    ctx.restore();

    const showLabel = node.type === 'region' || (globalScale >= 0.55 && (!inFocusMode || isConnected));
    if (!showLabel) return;

    const fs = node.type === 'region'
      ? Math.max(11 / globalScale, 2.5)
      : Math.max(7.5 / globalScale, 1.8);

    ctx.save();
    if (inFocusMode && !isConnected) ctx.globalAlpha = 0.06;
    ctx.font            = `${node.type === 'region' ? '700' : '400'} ${fs}px system-ui, sans-serif`;
    ctx.textAlign       = 'center';
    ctx.textBaseline    = 'middle';
    ctx.shadowColor     = 'rgba(0,0,0,0.95)';
    ctx.shadowBlur      = 6;
    ctx.fillStyle       = isFocused || isSelected
      ? '#fff'
      : node.type === 'region'
        ? 'rgba(255,255,255,0.9)'
        : 'rgba(255,255,255,0.48)';
    const raw   = node.label.replace(/\[\[|\]\]/g, '');
    const maxCh = node.type === 'note' ? 20 : 50;
    ctx.fillText(raw.length > maxCh ? raw.slice(0, maxCh - 1) + '…' : raw, node.x, node.y + r + fs * 0.95);
    ctx.restore();
  }, []);

  const nodePointerArea = useCallback((node, _c, ctx) => {
    ctx.beginPath();
    ctx.arc(node.x, node.y, Math.sqrt(node.val ?? 4) * 4 + 6, 0, 2 * Math.PI);
  }, []);

  // ── Click: focus + optional sidebar ────────────────────────────────────
  const handleNodeClick = useCallback((node) => {
    const isSame = focusedRef.current?.id === node.id;
    if (isSame) {
      setFocusedNode(null);
      setSelectedNode(null);
      graphRef.current?.zoom(1.4, 600);
      return;
    }
    setFocusedNode(node);
    const region = node.type === 'region'
      ? node
      : GRAPH_DATA.nodes.find(n => n.type === 'region' && n.label === node.regionId);
    if (region) {
      setSelectedNode(region);
      graphRef.current?.centerAt(region.x, region.y, 700);
      graphRef.current?.zoom(3.0, 700);
    } else {
      graphRef.current?.centerAt(node.x, node.y, 700);
      graphRef.current?.zoom(2.5, 700);
    }
  }, []);

  // ── Link styling ────────────────────────────────────────────────────────
  const getLinkColor = useCallback((link) => {
    const foc = focusedRef.current;
    const sel = selectedRef.current;
    const s   = typeof link.source === 'object' ? link.source.id : link.source;
    const t   = typeof link.target === 'object' ? link.target.id : link.target;
    if (foc) {
      if (s === foc.id || t === foc.id) return `${foc.accent || '#22d3ee'}aa`;
      return 'rgba(255,255,255,0.01)';
    }
    if (sel) {
      if (s === sel.id || t === sel.id) return `${sel.accent}55`;
      return 'rgba(255,255,255,0.03)';
    }
    return 'rgba(255,255,255,0.045)';
  }, []);

  const getLinkWidth = useCallback((link) => {
    const foc = focusedRef.current;
    const sel = selectedRef.current;
    const s   = typeof link.source === 'object' ? link.source.id : link.source;
    const t   = typeof link.target === 'object' ? link.target.id : link.target;
    if (foc) return (s === foc.id || t === foc.id) ? 1.4 : 0.2;
    if (sel) return (s === sel.id || t === sel.id) ? 1.1 : 0.25;
    return 0.35;
  }, []);

  const getParticles = useCallback((link) => {
    const foc = focusedRef.current;
    const sel = selectedRef.current;
    const s   = typeof link.source === 'object' ? link.source.id : link.source;
    const t   = typeof link.target === 'object' ? link.target.id : link.target;
    if (foc) return (s === foc.id || t === foc.id) ? 8 : 0;
    if (sel && (s === sel.id || t === sel.id)) return 6;
    return 1;
  }, []);

  const getParticleWidth = useCallback((link) => {
    const foc = focusedRef.current;
    const s   = typeof link.source === 'object' ? link.source.id : link.source;
    const t   = typeof link.target === 'object' ? link.target.id : link.target;
    return (foc && (s === foc.id || t === foc.id)) ? 3 : 1.2;
  }, []);

  const getParticleColor = useCallback((link) => {
    const tgt = typeof link.target === 'object' ? link.target : null;
    if (tgt?.type === 'stat') return '#a855f7';
    if (tgt?.type === 'note') return '#22c55e';
    return '#22d3ee';
  }, []);

  // Focused node label (cleaned)
  const focusLabel = focusedNode?.label.replace(/\[\[|\]\]/g, '');

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <FluidBackground />

      {/* Background darkener */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'rgba(0,0,0,0.58)', pointerEvents: 'none' }} />

      {/* ── Graph card ── */}
      <div style={{
        position: 'absolute',
        inset: 18,
        zIndex: 2,
        background: 'rgba(4,4,12,0.88)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 20,
        overflow: 'hidden',
        boxShadow: '0 0 0 1px rgba(0,0,0,0.6), 0 12px 80px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.04)',
      }}>
        {/* Neon top border accent */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 1, zIndex: 8,
          background: 'linear-gradient(90deg, transparent 5%, rgba(34,211,238,0.3) 30%, rgba(168,85,247,0.3) 60%, rgba(34,197,94,0.22) 80%, transparent 95%)',
          pointerEvents: 'none',
        }} />

        {/* Inner layout: graph + sidebar */}
        <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%' }}>

          {/* Graph canvas */}
          <div style={{
            position: 'absolute', top: 0, left: 0,
            width: graphW > 0 ? graphW : '100%',
            height: '100%',
            transition: 'width 0.32s cubic-bezier(0.4,0,0.2,1)',
          }}>
            {graphW > 0 && (
              <ForceGraph2D
                ref={graphRef}
                graphData={GRAPH_DATA}
                width={graphW}
                height={graphH}
                backgroundColor="rgba(0,0,0,0)"
                nodeCanvasObject={paintNode}
                nodeCanvasObjectMode={() => 'replace'}
                nodePointerAreaPaint={nodePointerArea}
                nodeLabel={() => ''}
                linkColor={getLinkColor}
                linkWidth={getLinkWidth}
                linkDirectionalParticles={getParticles}
                linkDirectionalParticleWidth={getParticleWidth}
                linkDirectionalParticleSpeed={0.005}
                linkDirectionalParticleColor={getParticleColor}
                d3AlphaDecay={0.011}
                d3VelocityDecay={0.32}
                cooldownTicks={320}
                onNodeClick={handleNodeClick}
                onNodeHover={n => setHoveredNode(n ?? null)}
                onBackgroundClick={() => {
                  setFocusedNode(null);
                  setSelectedNode(null);
                  graphRef.current?.zoom(1.3, 700);
                }}
                enableNodeDrag
                enableZoomInteraction
                minZoom={0.18}
                maxZoom={10}
              />
            )}
          </div>

          {/* ── Status chip — bottom-left ── */}
          <div style={{
            position: 'absolute', bottom: 14, left: 14, zIndex: 10,
            background: 'rgba(0,0,0,0.72)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 10, padding: '6px 12px',
            display: 'flex', alignItems: 'center', gap: 7,
            pointerEvents: 'none',
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
              background: focusedNode ? (focusedNode.accent || '#22c55e') : '#22c55e',
              boxShadow: `0 0 8px ${focusedNode ? (focusedNode.accent || '#22c55e') : '#22c55e'}`,
              display: 'inline-block',
            }} />
            <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.42)', fontWeight: 500 }}>
              {focusedNode
                ? `${focusLabel} · ${connectedRef.current ? connectedRef.current.size - 1 : 0} relations`
                : selectedNode ? selectedNode.label
                : '22 régions · graphe vivant'}
            </span>
          </div>

          {/* ── Legend — bottom-right ── */}
          <div style={{
            position: 'absolute', bottom: 14, right: sidebarW + 14, zIndex: 10,
            background: 'rgba(0,0,0,0.72)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 10, padding: '6px 12px',
            display: 'flex', alignItems: 'center', gap: 11,
            pointerEvents: 'none',
            transition: 'right 0.32s cubic-bezier(0.4,0,0.2,1)',
          }}>
            {[
              { color: '#22d3ee', label: 'Région' },
              { color: '#a855f7', label: 'PIB / Pop' },
              { color: '#22c55e', label: 'Notes' },
            ].map(({ color, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}`, display: 'inline-block', flexShrink: 0 }} />
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.32)', fontWeight: 500 }}>{label}</span>
              </div>
            ))}
          </div>

          {/* ── Hint — top-left (disappears once user interacts) ── */}
          {!focusedNode && !selectedNode && (
            <div style={{
              position: 'absolute', top: 14, left: 14, zIndex: 10,
              fontSize: 10, color: 'rgba(255,255,255,0.18)', fontStyle: 'italic',
              pointerEvents: 'none',
            }}>
              Cliquer un nœud → relations · Glisser → déplacer
            </div>
          )}

          {/* ── Focus mode escape hint ── */}
          {focusedNode && (
            <div style={{
              position: 'absolute', top: 14, left: 14, zIndex: 10,
              display: 'flex', alignItems: 'center', gap: 7,
              background: 'rgba(0,0,0,0.72)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 10, padding: '5px 11px',
              cursor: 'pointer',
            }}
              onClick={() => { setFocusedNode(null); setSelectedNode(null); graphRef.current?.zoom(1.3, 700); }}
            >
              <span style={{ fontSize: 11, color: focusedNode.accent || '#22d3ee', fontWeight: 600 }}>
                {focusLabel}
              </span>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>· cliquer pour quitter le focus</span>
            </div>
          )}

          {/* ── Sidebar ── */}
          <AnimatePresence>
            {selectedNode && (
              <RegionSidebar
                key={selectedNode.id}
                node={selectedNode}
                onClose={() => {
                  setFocusedNode(null);
                  setSelectedNode(null);
                  graphRef.current?.zoom(1.3, 700);
                }}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
