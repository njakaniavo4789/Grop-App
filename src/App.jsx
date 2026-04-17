/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Home, MessageSquare, Settings, User, Users, TrendingUp, TrendingDown, Sprout, Leaf, CloudRain, Save, Lock, Eye, EyeOff, CheckCircle, AlertCircle, Search, Shield, UserCheck, Brain, Mic, MicOff, Wifi, WifiOff, ChevronDown, ChevronRight, ChevronLeft, Copy, Check, Sparkles, FlaskConical, BookOpen, FileText, RefreshCw, PanelLeftClose, PanelLeftOpen, LogOut, Sun, Moon, MapPin, Activity, X } from 'lucide-react';
import { MADAGASCAR_GEOJSON } from './data/madagascarGeoJSON';
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from "react-router-dom";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Login from "./composant/login";
import Register from "./composant/register";
import GlobeAnalysis from "./composant/GlobeAnalysis";
import { getAccessToken, clearTokens, authAPI } from "./api/auth";
import { AgriculturalChat } from './components/chat';
import { FluidBackground } from './components/ui/FluidBackground';
import { ForecastPage } from './pages/ForecastPage';
import { ForceGraphDashboard } from './components/dashboard/ForceGraphDashboard';

function MarkdownMessage({ content }) {
  return (
    <div className="prose-chat" style={{ 
      color: '#E2E8F0', 
      lineHeight: 1.8, 
      fontSize: 15,
      fontFamily: 'var(--font-body)'
    }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({children}) => <h1 style={{
            fontSize: '1.35rem', fontWeight: 700, margin: '1.25rem 0 0.75rem',
            color: '#FFFFFF', lineHeight: 1.3, fontFamily: 'var(--font-display)'
          }}>{children}</h1>,
          h2: ({children}) => <h2 style={{
            fontSize: '1.15rem', fontWeight: 600, margin: '1rem 0 0.5rem',
            color: '#F1F5F9', lineHeight: 1.3, fontFamily: 'var(--font-display)'
          }}>{children}</h2>,
          h3: ({children}) => <h3 style={{
            fontSize: '1.05rem', fontWeight: 600, margin: '0.85rem 0 0.4rem',
            color: '#E2E8F0', lineHeight: 1.3
          }}>{children}</h3>,
          p: ({children}) => <p style={{
            margin: '0 0 0.85rem', color: '#CBD5E1', lineHeight: 1.8, fontSize: '0.95rem'
          }}>{children}</p>,
          ul: ({children}) => <ul style={{
            margin: '0.5rem 0 1rem 1.5rem', paddingLeft: '0.5rem',
            color: '#CBD5E1', listStyleType: 'disc'
          }}>{children}</ul>,
          ol: ({children}) => <ol style={{
            margin: '0.5rem 0 1rem 1.5rem', paddingLeft: '0.5rem',
            color: '#CBD5E1', listStyleType: 'decimal'
          }}>{children}</ol>,
          li: ({children, ...props}) => <li style={{
            margin: '0.4rem 0', lineHeight: 1.75, fontSize: '0.95rem',
            color: '#CBD5E1', paddingLeft: '0.25rem'
          }} {...props}>{children}</li>,
          strong: ({children}) => <strong style={{
            fontWeight: 700, color: '#FFFFFF', background: 'rgba(16,185,129,0.15)',
            padding: '0.1rem 0.4rem', borderRadius: '0.25rem'
          }}>{children}</strong>,
          em: ({children}) => <em style={{
            fontStyle: 'italic', color: '#94A3B8'
          }}>{children}</em>,
          code: ({className, children, ...props}) => {
            const isBlock = className?.startsWith('language-');
            if (isBlock) {
              return <code style={{
                display: 'block', background: '#0F0F14', color: '#22D3EE',
                padding: '1rem', borderRadius: '0.5rem', overflowX: 'auto',
                fontSize: '0.8125rem', fontFamily: 'var(--font-mono)', lineHeight: 1.6,
                border: '1px solid #1E293B', margin: '0.75rem 0'
              }} {...props}>{children}</code>;
            }
            return <code style={{
              background: 'rgba(16,185,129,0.15)', color: '#34D399',
              padding: '0.15rem 0.4rem', borderRadius: '0.25rem',
              fontSize: '0.8125rem', fontFamily: 'var(--font-mono)',
              fontWeight: 500
            }} {...props}>{children}</code>;
          },
          pre: ({children}) => <pre style={{
            background: '#0F0F14', borderRadius: '0.5rem', overflow: 'hidden',
            margin: '0.75rem 0', border: '1px solid #1E293B'
          }}>{children}</pre>,
          table: ({children}) => (
            <div style={{overflowX: 'auto', margin: '0.75rem 0', borderRadius: 8, border: '1px solid #1E293B'}}>
              <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem'}}>{children}</table>
            </div>
          ),
          thead: ({children}) => <thead style={{background: '#0F0F14'}}>{children}</thead>,
          th: ({children}) => <th style={{
            border: '1px solid #1E293B', padding: '0.65rem 0.75rem', textAlign: 'left',
            fontWeight: 600, color: '#FFFFFF', fontSize: '0.8125rem', background: '#0A0A0F'
          }}>{children}</th>,
          td: ({children}) => <td style={{
            border: '1px solid #1E293B', padding: '0.5rem 0.75rem',
            color: '#CBD5E1', fontSize: '0.875rem'
          }}>{children}</td>,
          tr: ({children}) => <tr style={{borderBottom: '1px solid #1E293B'}}>{children}</tr>,
          blockquote: ({children}) => <blockquote style={{
            borderLeft: '3px solid #8B5CF6', paddingLeft: '1rem', margin: '0.75rem 0',
            color: '#A78BFA', fontStyle: 'italic', background: 'rgba(139,92,246,0.1)',
            padding: '12px 16px', borderRadius: '0 8px 8px 0'
          }}>{children}</blockquote>,
          a: ({href, children}) => <a href={href} style={{
            color: '#22D3EE', textDecoration: 'underline', fontWeight: 500
          }} target="_blank" rel="noopener noreferrer">{children}</a>,
          hr: () => <hr style={{
            border: 'none', borderTop: '1px solid #1E293B', margin: '1.25rem 0'
          }} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

/* Animations globales injectées en JS pour éviter un fichier CSS séparé */
const _chatStyles = `
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
  @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  .prose-chat { font-size: 0.9375rem; line-height: 1.7; color: #374151; }
  .prose-chat > *:last-child { margin-bottom: 0 !important; }
`;
if (typeof document !== 'undefined' && !document.getElementById('chat-styles')) {
  const s = document.createElement('style');
  s.id = 'chat-styles';
  s.textContent = _chatStyles;
  document.head.appendChild(s);
}

function PrivateRoute({ children }) {
  return getAccessToken() ? children : <Navigate to="/login" replace />;
}

// Main layout with navbar + chat/dashboard
function MainLayout() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState('chat');
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [userInfo, setUserInfo] = useState({ name: 'Agriculteur', email: '', isAdmin: false });
  const [userMode, setUserMode] = useState('expert'); // 'expert' ou 'paysan'
  
  // Streaming state
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingTime, setStreamingTime] = useState(0);
  const [streamingProgress, setStreamingProgress] = useState(0);
  const [abortController, setAbortController] = useState(null);

useEffect(() => {
    authAPI.getProfile(getAccessToken())
      .then(res => setUserInfo({
        name: res.data.name,
        email: res.data.email,
        isAdmin: res.data.is_staff,
      }))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
    }
  }, [darkMode]);

  const handleLogout = () => {
    clearTokens();
    navigate('/login');
  };

  // Timer for streaming
  useEffect(() => {
    let interval;
    if (isStreaming) {
      interval = setInterval(() => {
        setStreamingTime(t => t + 0.1);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isStreaming]);

  const handleStopStreaming = () => {
    if (abortController) {
      abortController.abort();
      setIsStreaming(false);
      setAbortController(null);
    }
  };

  const handleSendMessage = async () => {
    const text = inputValue.trim();
    if (!text) return;

    // Afficher le message utilisateur immediatement
    setMessages(prev => [...prev, { text, sender: 'user' }]);
    setInputValue('');

    // Indicateur streaming
    setIsStreaming(true);
    setStreamingTime(0);
    setStreamingProgress(0);
    
    // Creer abort controller
    const controller = new AbortController();
    setAbortController(controller);

    // Message placeholder pour streaming
    const messageId = Date.now();
    setMessages(prev => [...prev, { 
      text: '', 
      sender: 'ai', 
      loading: true,
      messageId,
      isStreaming: true,
      streamingTime: 0,
      streamingProgress: 0,
    }]);

    try {
      const token = getAccessToken();
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

      const response = await fetch(`${API_BASE}/api/chat/stream/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ message: text }),
        signal: controller.signal,
      });

      if (!response.ok) {
        setIsStreaming(false);
        setMessages(prev => prev.map(m => 
          m.messageId === messageId ? { 
            text: `Erreur ${response.status}`, 
            sender: 'ai',
            loading: false,
          } : m
        ));
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            const parts = data.split('|');
            
            if (parts[0].startsWith('thinking:')) {
              const stepText = parts[0].replace('thinking:', '');
              setMessages(prev => prev.map(m =>
                m.messageId === messageId ? {
                  ...m,
                  thinkingSteps: [...(m.thinkingSteps || []), stepText],
                  streamingProgress: parseInt(parts[2]) || 0,
                } : m
              ));
            } else if (parts[0].startsWith('rag_score:')) {
              const scoreParts = parts[0].split(':');
              const ragScoreVal = parseInt(scoreParts[1]) || 0;
              console.log('[DEBUG] RAG Score:', ragScoreVal, 'from:', data);
              setMessages(prev => prev.map(m =>
                m.messageId === messageId ? {
                  ...m,
                  ragScore: ragScoreVal,
                } : m
              ));
            } else if (parts[0].startsWith('source:')) {
              const sourceName = parts[0].replace('source:', '');
              const sourceUrl = parts[1] || '';
              const sourceConf = parseInt(parts[2]) || 80;
              console.log('[DEBUG] Source:', sourceName, 'conf:', sourceConf, 'url:', sourceUrl);
              setMessages(prev => prev.map(m =>
                m.messageId === messageId ? {
                  ...m,
                  sources: [...(m.sources || []), { name: sourceName, url: sourceUrl, confidence: sourceConf }],
                } : m
              ));
            } else if (parts[0].startsWith('offtopic:')) {
              const rejectText = parts[0].replace('offtopic:', '');
              fullText = rejectText;
              setMessages(prev => prev.map(m =>
                m.messageId === messageId ? {
                  ...m,
                  text: rejectText,
                  isOffTopic: true,
                } : m
              ));
            } else if (parts[0].startsWith('token:')) {
              const tokenPart = parts[0].replace('token:', '');
              const time = parseFloat(parts[1]) || 0;
              const progress = parseInt(parts[2]) || 0;

              setStreamingTime(time);
              setStreamingProgress(progress);

              if (tokenPart) {
                fullText += tokenPart;
                setMessages(prev => prev.map(m =>
                  m.messageId === messageId ? {
                    ...m,
                    text: fullText,
                    streamingTime: time,
                    streamingProgress: progress,
                  } : m
                ));
              }
            } else if (parts[0] === 'end') {
              setIsStreaming(false);
              setMessages(prev => prev.map(m =>
                m.messageId === messageId ? {
                  ...m,
                  text: fullText || 'Reponse vide.',
                  sender: 'ai',
                  loading: false,
                  isStreaming: false,
                } : m
              ));
            } else if (parts[0] === 'error') {
              setIsStreaming(false);
              setMessages(prev => prev.map(m =>
                m.messageId === messageId ? {
                  text: `Erreur: ${parts[3] || parts[1]}`,
                  sender: 'ai',
                  loading: false,
                } : m
              ));
            }
          }
        }
      }

    } catch (err) {
      if (err.name === 'AbortError') {
        setMessages(prev => prev.map(m => 
          m.messageId === messageId ? { 
            text: fullText + '\n\n[Generation arretee]', 
            sender: 'ai',
            loading: false,
          } : m
        ));
      } else {
        setMessages(prev => prev.map(m => 
          m.messageId === messageId ? { 
            text: 'Erreur de connexion.', 
            sender: 'ai',
            loading: false,
          } : m
        ));
      }
      setIsStreaming(false);
    } finally {
      setAbortController(null);
    }
  };

  return (
    <div className="flex h-screen relative" style={{ background: 'var(--bg-deep)' }}>
      <FluidBackground />
      
      {/* Sidebar wrapper — overflow visible so the edge toggle button isn't clipped */}
      <div style={{ position: 'relative', zIndex: 10, flexShrink: 0 }}>
      <nav className="sidebar-glass" style={{
        width: collapsed ? 68 : 220,
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        position: 'relative',
        height: '100%',
      }}>
        {/* Logo */}
        <div style={{ padding: collapsed ? 16 : 24, display: 'flex', alignItems: 'center', gap: 12 }}>
          {messages.length === 0 && (
            <img
              src="/logo.png"
              alt="CropGPT"
              style={{ width: 40, height: 40, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }}
            />
          )}
          {!collapsed && (
            <div style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
              <h1 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                CropGPT
              </h1>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Agriculture Madagascar</p>
            </div>
          )}
        </div>

        {/* Nav Items */}
        <div style={{ flex: 1, padding: collapsed ? 8 : 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <SidebarItem icon={<Home size={20} strokeWidth={1.5} />} label="Dashboard" collapsed={collapsed} active={currentPage === 'dashboard'} onClick={() => setCurrentPage('dashboard')} />
          <SidebarItem icon={<MessageSquare size={20} strokeWidth={1.5} />} label="Chat" collapsed={collapsed} active={currentPage === 'chat'} onClick={() => setCurrentPage('chat')} />
          <SidebarItem icon={<CloudRain size={20} strokeWidth={1.5} />} label="Prévisions" collapsed={collapsed} active={currentPage === 'forecast'} onClick={() => setCurrentPage('forecast')} />
          <SidebarItem icon={<Settings size={20} strokeWidth={1.5} />} label="Paramètres" collapsed={collapsed} active={currentPage === 'settings'} onClick={() => setCurrentPage('settings')} />
          {userInfo.isAdmin && (
            <SidebarItem icon={<Users size={20} strokeWidth={1.5} />} label="Utilisateurs" collapsed={collapsed} active={currentPage === 'users'} onClick={() => setCurrentPage('users')} />
          )}
        </div>

        {/* User info */}
        <div style={{ padding: collapsed ? 8 : 16 }}>
          {/* Theme toggle */}
          {!collapsed && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 12px', marginBottom: 12, borderRadius: 12,
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Thème</span>
              <button
                onClick={() => setDarkMode(!darkMode)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 36, height: 20, borderRadius: 10, border: 'none', cursor: 'pointer',
                  background: darkMode ? 'linear-gradient(135deg, #1E293B, #0F172A)' : 'linear-gradient(135deg, #FCD34D, #F59E0B)',
                  position: 'relative', transition: 'background 0.3s',
                }}
              >
                <div style={{
                  width: 16, height: 16, borderRadius: '50%',
                  background: 'white',
                  position: 'absolute',
                  left: darkMode ? 2 : 18,
                  transition: 'left 0.3s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {darkMode ? <Moon size={10} style={{ color: '#6366F1' }} /> : <Sun size={10} style={{ color: '#F59E0B' }} />}
                </div>
              </button>
            </div>
          )}
          {collapsed && (
            <button
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? 'Mode clair' : 'Mode sombre'}
              style={{
                padding: 8, borderRadius: 8,
                background: 'transparent', border: 'none',
                color: 'var(--text-muted)', cursor: 'pointer',
                transition: 'all 0.2s', marginBottom: 8,
                display: 'flex', justifyContent: 'center', width: '100%',
              }}
            >
              {darkMode ? <Moon size={18} strokeWidth={1.5} /> : <Sun size={18} strokeWidth={1.5} />}
            </button>
          )}
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 8, marginBottom: 8, borderRadius: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'linear-gradient(135deg, #10B981, #059669)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <User size={16} style={{ color: 'white' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userInfo.name}</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{userInfo.isAdmin ? 'Admin' : 'Connecté'}</p>
              </div>
            </div>
          )}
          
          {/* Actions row */}
          <div style={{ display: 'flex', gap: 4, justifyContent: collapsed ? 'center' : 'flex-end' }}>
            <button
              onClick={handleLogout}
              title="Déconnexion"
              style={{
                padding: 8, borderRadius: 8,
                background: 'transparent', border: 'none',
                color: 'var(--text-muted)', cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <LogOut size={18} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </nav>

      {/* Toggle Button — outside nav so overflow:hidden doesn't clip it */}
      <motion.button
        onClick={() => setCollapsed(!collapsed)}
        title={collapsed ? 'Étendre' : 'Réduire'}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: 'absolute', right: -12, top: 80,
          width: 24, height: 24, borderRadius: '50%',
          background: 'var(--bg-glass)', border: '1px solid var(--border-subtle)',
          color: 'var(--text-primary)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 30, backdropFilter: 'blur(8px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(16,185,129,0.6)';
          e.currentTarget.style.boxShadow = '0 0 12px rgba(16,185,129,0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-subtle)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        }}
      >
        <motion.span
          animate={{ rotate: collapsed ? 0 : 180 }}
          transition={{ duration: 0.3 }}
          style={{ display: 'inline-flex' }}
        >
          <ChevronRight size={14} strokeWidth={1.5} />
        </motion.span>
      </motion.button>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden" style={{ position: 'relative', zIndex: 1 }}>
        {currentPage === 'chat'
          ? <AgriculturalChat />
          : currentPage === 'dashboard'
            ? <DashboardPage />
            : currentPage === 'forecast'
              ? <ForecastPage />
              : currentPage === 'settings'
                ? <SettingsPage />
                : <UsersPage />
        }
      </main>
    </div>
  );
}

// Root App: BrowserRouter wraps everything at the top level
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/cartographie" element={<GlobeAnalysis />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

// Défini en dehors de SettingsPage pour éviter la perte de focus à chaque frappe
function PwdField({ label, value, onChange, show, setShow }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          required
          style={{
            width: '100%', padding: '12px 44px 12px 16px', borderRadius: 12,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            color: 'var(--text-primary)', outline: 'none',
          }}
        />
        <button type="button" onClick={() => setShow(!show)}
          style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}

function SettingsAlert({ msg }) {
  if (!msg) return null;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderRadius: 12,
      fontSize: 13, marginBottom: 16,
      background: msg.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
      border: msg.type === 'success' ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(239,68,68,0.2)',
      color: msg.type === 'success' ? '#34D399' : '#F87171',
    }}>
      {msg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
      {msg.text}
    </div>
  );
}

function SettingsPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [nameLoading, setNameLoading] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [nameMsg, setNameMsg] = useState(null);
  const [pwdMsg, setPwdMsg] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const token = getAccessToken();
    authAPI.getProfile(token)
      .then(res => { setName(res.data.name); setEmail(res.data.email); })
      .catch(() => {});
  }, []);

  // GSAP entrance animations
  useEffect(() => {
    if (!containerRef.current) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const sections = containerRef.current.querySelectorAll('.settings-section');
    const fields = containerRef.current.querySelectorAll('.settings-field');
    const header = containerRef.current.querySelector('.settings-header');

    gsap.set([sections, fields, header], { opacity: 0, y: 24 });
    gsap.to(header, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });
    gsap.to(sections, { opacity: 1, y: 0, duration: 0.55, stagger: 0.18, ease: 'power2.out', delay: 0.15 });
    gsap.to(fields, { opacity: 1, y: 0, duration: 0.4, stagger: 0.07, ease: 'power2.out', delay: 0.3 });
  }, []);

  const handleNameSubmit = async (e) => {
    e.preventDefault();
    setNameMsg(null);
    setNameLoading(true);
    try {
      await authAPI.updateProfile({ name }, getAccessToken());
      setNameMsg({ type: 'success', text: 'Nom mis à jour avec succès.' });
    } catch (err) {
      setNameMsg({ type: 'error', text: err.response?.data?.error || 'Erreur lors de la mise à jour.' });
    } finally {
      setNameLoading(false);
    }
  };

  const handlePwdSubmit = async (e) => {
    e.preventDefault();
    setPwdMsg(null);
    if (newPwd !== confirmPwd) {
      setPwdMsg({ type: 'error', text: 'Les nouveaux mots de passe ne correspondent pas.' });
      return;
    }
    setPwdLoading(true);
    try {
      await authAPI.updateProfile({ current_password: currentPwd, new_password: newPwd }, getAccessToken());
      setPwdMsg({ type: 'success', text: 'Mot de passe mis à jour avec succès.' });
      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
    } catch (err) {
      setPwdMsg({ type: 'error', text: err.response?.data?.error || 'Erreur lors de la mise à jour.' });
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto" style={{ background: 'transparent', position: 'relative' }}>
      <FluidBackground />

      {/* Header */}
      <div className="settings-header" style={{ background: 'transparent', padding: '32px 40px 16px', position: 'relative', zIndex: 1 }}>
        <h2 style={{ fontSize: 28, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', letterSpacing: '-0.5px' }}>
          Paramètres
        </h2>
        <p style={{ color: 'var(--text-muted)', marginTop: 4, fontSize: 14 }}>
          Gérez les informations de votre compte
        </p>
      </div>

      <div style={{ padding: '0 40px 48px', maxWidth: 640, position: 'relative', zIndex: 1 }}>

        {/* ─── Section : Informations du profil ─── */}
        <div className="settings-section" style={{ marginBottom: 48 }}>
          <div style={{ marginBottom: 24, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
              Informations du profil
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
              Modifiez votre nom d'affichage
            </p>
          </div>

          <form onSubmit={handleNameSubmit}>
            <div className="settings-field" style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 8 }}>
                Adresse email
              </label>
              <input
                type="email"
                value={email}
                disabled
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: 12,
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                  color: 'var(--text-muted)', cursor: 'not-allowed', outline: 'none', boxSizing: 'border-box',
                }}
              />
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                L'adresse email ne peut pas être modifiée.
              </p>
            </div>

            <div className="settings-field" style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 8 }}>
                Nom complet
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                placeholder="Votre nom"
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: 12,
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
              />
            </div>

            <SettingsAlert msg={nameMsg} />

            <div className="settings-field">
              <button
                type="submit"
                disabled={nameLoading}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px',
                  background: 'linear-gradient(135deg, #10B981, #059669)', color: 'white',
                  fontWeight: 500, borderRadius: 12, border: 'none', cursor: 'pointer',
                  opacity: nameLoading ? 0.6 : 1, transition: 'opacity 0.2s',
                }}
              >
                <Save size={16} />
                {nameLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
            </div>
          </form>
        </div>

        {/* ─── Divider ─── */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 48 }} />

        {/* ─── Section : Sécurité ─── */}
        <div className="settings-section">
          <div style={{ marginBottom: 24, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
              Changer le mot de passe
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
              Minimum 8 caractères
            </p>
          </div>

          <form onSubmit={handlePwdSubmit}>
            <div className="settings-field">
              <PwdField label="Mot de passe actuel" value={currentPwd} onChange={setCurrentPwd} show={showCurrentPwd} setShow={setShowCurrentPwd} />
            </div>
            <div className="settings-field">
              <PwdField label="Nouveau mot de passe" value={newPwd} onChange={setNewPwd} show={showNewPwd} setShow={setShowNewPwd} />
            </div>
            <div className="settings-field">
              <PwdField label="Confirmer le nouveau mot de passe" value={confirmPwd} onChange={setConfirmPwd} show={showConfirmPwd} setShow={setShowConfirmPwd} />
            </div>

            <SettingsAlert msg={pwdMsg} />

            <div className="settings-field">
              <button
                type="submit"
                disabled={pwdLoading}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px',
                  background: 'linear-gradient(135deg, #10B981, #059669)', color: 'white',
                  fontWeight: 500, borderRadius: 12, border: 'none', cursor: 'pointer',
                  opacity: pwdLoading ? 0.6 : 1, transition: 'opacity 0.2s',
                }}
              >
                <Lock size={16} />
                {pwdLoading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        active
          ? 'bg-gradient-to-r from-gray-800 to-gray-700 text-white shadow-lg'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
}

function SidebarItem({ icon, label, collapsed, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`sidebar-item${active ? ' active' : ''}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'flex-start',
        gap: 12,
        padding: collapsed ? '12px' : '12px 16px',
        borderRadius: 12,
        cursor: 'pointer',
        background: active ? 'rgba(16,185,129,0.15)' : 'transparent',
        color: active ? '#10B981' : 'var(--text-secondary)',
        border: active ? '1px solid rgba(16,185,129,0.3)' : '1px solid transparent',
        width: '100%',
        marginBottom: 4,
        transition: 'background 0.15s ease, color 0.15s ease, border-color 0.15s ease',
      }}
    >
      <span style={{ flexShrink: 0, display: 'inline-flex' }}>{icon}</span>
      {!collapsed && (
        <span style={{ fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {label}
        </span>
      )}
    </button>
  );
}

function UserAvatar({ name, isAdmin }) {
  const initials = name
    .split(' ')
    .map(n => n[0] || '')
    .join('')
    .toUpperCase()
    .slice(0, 2);
  const palette = [
    'from-blue-500 to-indigo-600',
    'from-emerald-500 to-teal-600',
    'from-violet-500 to-purple-600',
    'from-rose-500 to-pink-600',
    'from-amber-500 to-orange-600',
    'from-cyan-500 to-sky-600',
  ];
  const color = palette[(name.charCodeAt(0) || 0) % palette.length];
  return (
    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}>
      <span className="text-white text-sm font-bold">{initials || '?'}</span>
    </div>
  );
}

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    authAPI.getUsers(getAccessToken())
      .then(res => { setUsers(res.data); setLoading(false); })
      .catch(() => { setError('Impossible de charger les utilisateurs.'); setLoading(false); });
  }, []);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const total     = users.length;
  const admins    = users.filter(u => u.is_staff).length;
  const actifs    = users.filter(u => u.is_active).length;

  const formatDate = iso => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: 'transparent', position: 'relative' }}>
      <FluidBackground />
      {/* Header */}
      <div style={{ background: 'transparent', padding: '24px 32px', position: 'relative', zIndex: 1 }}>
        <h2 style={{ fontSize: 28, fontWeight: 600, color: '#FFFFFF', fontFamily: 'var(--font-display)' }}>Gestion des Utilisateurs</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: 14 }}>{total} utilisateur{total !== 1 ? 's' : ''} inscrit{total !== 1 ? 's' : ''}</p>
      </div>

      <div style={{ padding: '0 32px 32px', position: 'relative', zIndex: 1 }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 24 }}>
          {[
            { label: 'Total utilisateurs', value: total,  icon: <Users size={22} style={{ color: 'white' }} />,  color: '#3B82F6'   },
            { label: 'Administrateurs',    value: admins, icon: <Shield size={22} style={{ color: 'white' }} />, color: '#8B5CF6' },
            { label: 'Comptes actifs',     value: actifs, icon: <UserCheck size={22} style={{ color: 'white' }} />, color: '#10B981' },
          ].map((s, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 20,
              display: 'flex', alignItems: 'center', gap: 16, transition: 'all 0.3s',
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: 14, background: s.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 4px 12px ${s.color}40`,
              }}>
                {s.icon}
              </div>
              <div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s.label}</p>
                <p style={{ fontSize: 32, fontWeight: 700, color: '#FFFFFF' }}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Table card */}
        <div style={{
          background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden',
        }}>
          {/* Search bar */}
          <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: 280 }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Rechercher par nom ou email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%', paddingLeft: 36, paddingRight: 16, paddingTop: 8, paddingBottom: 8,
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12, color: 'var(--text-primary)', fontSize: 13, outline: 'none',
                }}
              />
            </div>
            <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 'auto' }}>{filtered.length} résultat{filtered.length !== 1 ? 's' : ''}</span>
          </div>

          {/* Table */}
          {loading ? (
            <div style={{ padding: 64, textAlign: 'center', color: 'var(--text-muted)' }}>Chargement...</div>
          ) : error ? (
            <div style={{ padding: 64, textAlign: 'center', color: '#EF4444' }}>{error}</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 64, textAlign: 'center', color: 'var(--text-muted)' }}>Aucun utilisateur trouvé.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <th style={{ textAlign: 'left', padding: '12px 24px', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Utilisateur</th>
                    <th style={{ textAlign: 'left', padding: '12px 24px', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</th>
                    <th style={{ textAlign: 'left', padding: '12px 24px', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rôle</th>
                    <th style={{ textAlign: 'left', padding: '12px 24px', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Statut</th>
                    <th style={{ textAlign: 'left', padding: '12px 24px', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Inscrit le</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(user => (
                    <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s' }}>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <UserAvatar name={user.name} isAdmin={user.is_staff} />
                          <span style={{ fontWeight: 500, color: '#FFFFFF' }}>{user.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: 13, color: 'var(--text-secondary)' }}>{user.email}</td>
                      <td style={{ padding: '16px 24px' }}>
                        {user.is_staff ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: 'rgba(139,92,246,0.15)', color: '#A78BFA' }}>
                            <Shield size={11} /> Admin
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: 'rgba(16,185,129,0.15)', color: '#34D399' }}>
                            <User size={11} /> Utilisateur
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        {user.is_active ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: 'rgba(16,185,129,0.15)', color: '#34D399' }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block' }}></span> Actif
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6B7280', display: 'inline-block' }}></span> Inactif
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: 13, color: 'var(--text-muted)' }}>{formatDate(user.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ThinkingIndicator() {
  return (
    <div style={{display:'flex',alignItems:'center',gap:'6px',color:'#9ca3af',fontSize:'0.875rem'}}>
      {[0,1,2].map(i => (
        <span key={i} className="animate-bounce" style={{
          width:6,height:6,background:'#10b981',borderRadius:'50%',display:'inline-block',
          animationDelay:`${i*0.15}s`,animationDuration:'0.8s'
        }}/>
      ))}
      <span style={{marginLeft:4}}>CropGPT réfléchit...</span>
    </div>
  );
}

// ============================================
// COMPOSANTS CHAT AGRI-NEXUS
// ============================================

function RAGScoreGauge({ score, totalSources }) {
  const getScoreClass = (s) => {
    if (s >= 80) return 'high';
    if (s >= 50) return 'medium';
    return 'low';
  };
  
  return (
    <div className="score-gauge" style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#A78BFA', display: 'flex', alignItems: 'center', gap: 6 }}>
        <Brain size={14} />
        <span>RAG</span>
      </div>
      <div className="score-gauge-bar">
        <div 
          className={`score-gauge-fill ${getScoreClass(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color: getScoreClass(score) === 'high' ? '#34D399' : getScoreClass(score) === 'medium' ? '#F59E0B' : '#EF4444' }}>
        {score}%
      </span>
    </div>
  );
}

function SourcesPanel({ sources }) {
  const [expanded, setExpanded] = useState(false);
  
  const getScoreClass = (s) => {
    if (s >= 80) return 'high';
    if (s >= 50) return 'medium';
    return 'low';
  };
  
  if (!sources || sources.length === 0) return null;
  
  return (
    <div className="sources-panel" style={{ marginTop: 12 }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '8px 12px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: '#94A3B8',
          fontSize: 12,
          fontWeight: 500
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          Sources ({sources.length})
        </span>
        {expanded ? <span style={{ color: '#64748B' }}>Masquer</span> : null}
      </button>
      
      {expanded && (
        <div style={{ padding: '0 8px 8px' }}>
          {sources.map((source, i) => (
            <div key={i} className="source-item">
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#F1F5F9' }}>
                <FileText size={12} />
                {source.name}
              </span>
              <span className={`source-badge ${getScoreClass(source.confidence)}`}>
                {source.confidence}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TerminalThinking({ steps }) {
  const getStepIcon = (step, isLast) => {
    if (step.toLowerCase().includes('erreur')) {
      return <AlertCircle size={12} style={{ color: '#EF4444' }} />;
    }
    if (isLast) {
      return <div className="terminal-spinner" />;
    }
    return <CheckCircle size={12} style={{ color: '#10B981' }} />;
  };
  
  const getStepClass = (step) => {
    if (step.toLowerCase().includes('erreur')) return 'terminal-error';
    if (step.toLowerCase().includes('en cours') || step.toLowerCase().includes('loading')) return 'terminal-process';
    if (step.toLowerCase().includes('termin') || step.toLowerCase().includes('trouve')) return 'terminal-success';
    return 'terminal-command';
  };
  
  return (
    <div className="terminal-thinking" style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: '#8B5CF6', fontSize: 12, fontWeight: 600 }}>
        <FlaskConical size={14} />
        <span>ANALYSE</span>
      </div>
      {steps.map((step, i) => (
        <div key={i} className="terminal-line">
          {getStepIcon(step, i === steps.length - 1)}
          <span className={getStepClass(step)}>{step}</span>
        </div>
      ))}
    </div>
  );
}

function ModeToggle({ mode, setMode }) {
  return (
    <div className="mode-toggle">
      <button
        className={`mode-toggle-btn ${mode === 'paysan' ? 'active' : ''}`}
        onClick={() => setMode('paysan')}
      >
        <Sprout size={14} />
        Paysan
      </button>
      <button
        className={`mode-toggle-btn ${mode === 'expert' ? 'active' : ''}`}
        onClick={() => setMode('expert')}
      >
        <FlaskConical size={14} />
        Expert
      </button>
    </div>
  );
}

// ============================================
// PAGE DE CHAT PRINCIPALE
// ============================================

function ChatPage({ messages, inputValue, setInputValue, handleSendMessage, handleStopStreaming }) {
  const [userMode, setUserMode] = useState('expert');
  
  const suggestedPrompts = [
    { icon: <Sprout size={20} />, title: "Meilleures cultures pour Madagascar", subtitle: "Conseils de plantation" },
    { icon: <CloudRain size={20} />, title: "Prévisions météo agricoles", subtitle: "Climat & Saisons" },
    { icon: <Leaf size={20} />, title: "Techniques de culture durable", subtitle: "Agriculture bio" }
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'var(--bg-deep)' }}>
      {/* Chat Header */}
      <div style={{ 
        background: 'var(--bg-surface)', 
        borderBottom: '1px solid var(--border-subtle)',
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            Assistant Agricole IA
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>
            Votre guide pour l'agriculture à Madagascar
          </p>
        </div>
        <ModeToggle mode={userMode} setMode={setUserMode} />
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {messages.length === 0 ? (
          <div className="welcome-screen">
            {/* Welcome Avatar avec Glow */}
            <div style={{
              width: 80,
              height: 80,
              borderRadius: 24,
              background: 'linear-gradient(135deg, #10B981, #059669)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 24,
              position: 'relative',
              boxShadow: '0 0 40px rgba(16, 185, 129, 0.4)'
            }}>
              <Sprout size={36} style={{ color: 'white' }} />
              <div style={{
                position: 'absolute',
                inset: -3,
                borderRadius: 27,
                background: 'linear-gradient(135deg, #22D3EE, #A78BFA)',
                zIndex: -1,
                opacity: 0.6
              }} />
            </div>
            
            <h1 className="welcome-title">Bonjour, Agriculteur</h1>
            <h2 className="welcome-subtitle">Comment puis-je vous aider?</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 32, maxWidth: 400 }}>
              Prêt à vous assister dans vos activités agricoles, de la plantation
              à la récolte. Commençons ensemble!
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, maxWidth: 600, marginTop: 16 }}>
              {suggestedPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => setInputValue(prompt.title)}
                  className="suggestion-card"
                >
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, #10B981, #059669)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                    color: 'white'
                  }}>
                    {prompt.icon}
                  </div>
                  <h3 style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{prompt.title}</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{prompt.subtitle}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{maxWidth:720,margin:'0 auto',display:'flex',flexDirection:'column',gap:0}}>
            {messages.map((message, index) => {
              const isUser = message.sender === 'user';
              const isStreaming = message.loading || message.isStreaming;

              if (isUser) {
                /* ── Message utilisateur ── */
                return (
                  <div key={index} style={{display:'flex',justifyContent:'flex-end',padding:'12px 0'}}>
                    <div style={{
                      maxWidth:'70%',
                      background:'linear-gradient(135deg,#16a34a,#059669)',
                      color:'#fff',
                      borderRadius:'18px 18px 4px 18px',
                      padding:'10px 16px',
                      fontSize:'0.9375rem',
                      lineHeight:1.6,
                      boxShadow:'0 1px 3px rgba(0,0,0,0.12)',
                    }}>
                      {message.text}
                    </div>
                  </div>
                );
              }

              /* ── Message IA ── */
              return (
                <div key={index} style={{
                  display:'flex',
                  alignItems:'flex-start',
                  gap:12,
                  padding:'16px 0',
                  borderBottom: '1px solid var(--border-subtle)',
                  animation: 'fade-in-up 0.3s ease-out'
                }}>
                  {/* Avatar CropGPT avec Glow */}
                  <div style={{
                    width:40,
                    height:40,
                    flexShrink:0,
                    background: 'linear-gradient(135deg, #10B981, #059669)',
                    borderRadius: 12,
                    display:'flex',
                    alignItems:'center',
                    justifyContent:'center',
                    position: 'relative',
                    boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)'
                  }}>
                    <Sprout size={18} style={{ color: 'white' }} />
                    <div style={{
                      position: 'absolute',
                      inset: -2,
                      borderRadius: 14,
                      background: 'linear-gradient(135deg, #22D3EE, #A78BFA)',
                      zIndex: -1,
                      opacity: 0.5
                    }} />
                  </div>

                  {/* Contenu */}
                  <div style={{flex:1,minWidth:0}}>

                    {/* Header: Nom + RAG Badge */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      marginBottom: 8
                    }}>
                      <span style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: '#10B981',
                        letterSpacing: '0.01em'
                      }}>
                        CropGPT
                      </span>
                      {message.ragScore && (
                        <div className="rag-badge">
                          <Brain size={10} />
                          RAG {message.ragScore}%
                        </div>
                      )}
                    </div>

                    {isStreaming ? (
                      <div>
                        {/* ── Bloc Terminal Thinking (Nouveau Style Futuriste) ── */}
                        {message.thinkingSteps?.length > 0 && (
                          <TerminalThinking steps={message.thinkingSteps} />
                        )}

                        {/* Texte en cours de génération */}
                        {message.text ? (
                          <div>
                            <MarkdownMessage content={message.text} />
                            <span style={{
                              display:'inline-block',width:2,height:'1.1em',
                              background:'#16a34a',marginLeft:2,verticalAlign:'middle',
                              animation:'blink 1s step-end infinite',borderRadius:1,
                            }}/>
                          </div>
                        ) : !message.thinkingSteps?.length ? (
                          <ThinkingIndicator />
                        ) : null}

                        {/* Timer discret */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginTop: 12,
                          fontSize: 12,
                          color: 'var(--text-muted)',
                          fontFamily: 'var(--font-mono)'
                        }}>
                          <span>{(message.streamingTime || 0).toFixed(1)}s</span>
                          {message.isStreaming && (
                            <button
                              onClick={handleStopStreaming}
                              style={{
                                fontSize: 11,
                                padding: '4px 10px',
                                background: 'rgba(239, 68, 68, 0.1)',
                                color: '#EF4444',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                borderRadius: 6,
                                cursor: 'pointer',
                              }}
                            >
                              Arrêter
                            </button>
                          )}
                        </div>
                      </div>
                    ) : message.isOffTopic ? (
                      /* ── Message hors-sujet ── */
                      <div className="off-topic-alert" style={{
                        padding: 12,
                      }}>
                        <AlertCircle size={18} />
                        <span>{message.text}</span>
                      </div>
                    ) : (
                      /* ── Réponse complète ── */
                      <div>
                        <MarkdownMessage content={message.text || ''} />
                        
                        {/* Sources Panel */}
                        {message.sources && message.sources.length > 0 && (
                          <SourcesPanel sources={message.sources} />
                        )}
                      </div>
                    )}

                    {/* Méta-données (tokens) — discret sous la réponse */}
                    {!isStreaming && message.meta && (
                      <div style={{display:'flex',gap:12,marginTop:8,fontSize:'0.75rem',color:'#d1d5db'}}>
                        {message.meta.input_tokens > 0 && <span>{message.meta.input_tokens} tok entrée</span>}
                        {message.meta.output_tokens > 0 && <span>{message.meta.output_tokens} tok sortie</span>}
                        {message.meta.tps > 0 && <span>{message.meta.tps} tok/s</span>}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Chat Input - Style Futuriste */}
      <div style={{
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-subtle)',
        padding: '16px 32px'
      }}>
        <div className="chat-input-container" style={{ maxWidth: 720, margin: '0 auto' }}>
          <button 
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-secondary)'
            }}
          >
            <Mic size={18} />
          </button>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Posez votre question agricole..."
            className="chat-input"
          />
          <button
            onClick={handleSendMessage}
            className="chat-send-btn"
            disabled={!inputValue.trim()}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── DashboardPage uses ForceGraphDashboard ─── */

/* ═══════════════════════════════════════════════════════════════════
   DASHBOARD — force graph (data lives in madagascarGraphData.js)
═══════════════════════════════════════════════════════════════════ */
const REGIONS_STATS_UNUSED = {
  "Diana":               { capital:"Antsiranana",           pop:"696 K",   growth:"+3.8%", positive:true,  surface:"13 124 km²", sparkline:[38,40,42,44,43,46,48], note:"Porte d'entrée nord. Tourisme balnéaire et zone franche industrielle en développement rapide.", crops:"Cacao · Vanille · Café", accent:"#3b82f6" },
  "Sava":                { capital:"Sambava",                pop:"1.1 M",   growth:"+4.5%", positive:true,  surface:"25 518 km²", sparkline:[50,52,55,53,58,60,63], note:"Capital mondial de la vanille. Exportations en forte croissance depuis 2022.", crops:"Vanille · Girofle · Letchi", accent:"#8e24aa" },
  "Analanjirofo":        { capital:"Fenoarivo-Atsinanana",  pop:"1.0 M",   growth:"+3.2%", positive:true,  surface:"21 930 km²", sparkline:[42,44,43,46,45,48,50], note:"Région côtière est, biodiversité exceptionnelle. Pêche artisanale en expansion.", crops:"Girofle · Café · Letchi", accent:"#f4511e" },
  "Sofia":               { capital:"Antsohihy",              pop:"1.3 M",   growth:"+2.9%", positive:true,  surface:"50 875 km²", sparkline:[35,36,38,37,40,39,42], note:"Seconde plus grande région. Agriculture vivrière dominante, fort potentiel rizicole.", crops:"Riz · Coton · Maïs", accent:"#00897b" },
  "Boeny":               { capital:"Mahajanga",              pop:"873 K",   growth:"+3.1%", positive:true,  surface:"31 046 km²", sparkline:[40,41,43,42,45,44,47], note:"Deuxième port de Madagascar. Hub commercial et touristique de la côte nord-ouest.", crops:"Riz · Canne à sucre · Arachide", accent:"#8b5cf6" },
  "Betsiboka":           { capital:"Maevatanana",            pop:"364 K",   growth:"+1.8%", positive:true,  surface:"29 993 km²", sparkline:[20,21,22,21,23,22,24], note:"Région enclavée, bassin versant du fleuve Betsiboka. Projets d'irrigation en cours.", crops:"Riz · Maïs · Manioc", accent:"#06b6d4" },
  "Melaky":              { capital:"Maintirano",             pop:"296 K",   growth:"+1.5%", positive:true,  surface:"66 236 km²", sparkline:[18,19,19,20,20,21,22], note:"Région la plus grande, très peu dense. Réserves pétrolières explorées depuis 2010.", crops:"Maïs · Manioc · Coton", accent:"#84cc16" },
  "Bongolava":           { capital:"Tsiroanomandidy",        pop:"456 K",   growth:"+2.3%", positive:true,  surface:"16 688 km²", sparkline:[25,26,27,26,28,28,30], note:"Hauts plateaux centraux. Élevage bovin extensif et cultures de contre-saison.", crops:"Riz · Maïs · Élevage bovin", accent:"#a78bfa" },
  "Itasy":               { capital:"Miarinarivo",            pop:"703 K",   growth:"+2.7%", positive:true,  surface:"6 658 km²",  sparkline:[38,39,40,42,41,43,45], note:"Région la plus petite et la plus densément peuplée des hauts plateaux. Artisanat.", crops:"Riz · Pomme de terre · Légumes", accent:"#34d399" },
  "Analamanga":          { capital:"Antananarivo",           pop:"3.6 M",   growth:"+4.2%", positive:true,  surface:"16 911 km²", sparkline:[70,73,76,75,79,82,86], note:"Centre économique et politique. Hub technologique, secteur tertiaire en pleine expansion.", crops:"Riz · Légumes · Fruits", accent:"#10b981" },
  "Alaotra-Mangoro":     { capital:"Ambatondrazaka",         pop:"1.1 M",   growth:"+3.4%", positive:true,  surface:"31 948 km²", sparkline:[48,50,52,51,54,56,58], note:"Grenier à riz de Madagascar. Lac Alaotra, plus grande zone rizicole du pays.", crops:"Riz · Café · Élevage", accent:"#eab308" },
  "Atsinanana":          { capital:"Toamasina",              pop:"1.3 M",   growth:"+3.6%", positive:true,  surface:"21 934 km²", sparkline:[52,54,56,55,58,60,63], note:"Premier port de Madagascar. Corridor économique vers Antananarivo, hub logistique.", crops:"Girofle · Café · Cacao", accent:"#6366f1" },
  "Vakinankaratra":      { capital:"Antsirabe",              pop:"1.8 M",   growth:"+3.0%", positive:true,  surface:"16 599 km²", sparkline:[56,58,60,59,62,64,67], note:"Deuxième ville, capitale industrielle. Brasseries, textile et tourisme thermal.", crops:"Riz · Pomme de terre · Blé", accent:"#14b8a6" },
  "Amoron'i Mania":      { capital:"Ambositra",              pop:"730 K",   growth:"+2.1%", positive:true,  surface:"16 141 km²", sparkline:[33,34,35,34,36,36,38], note:"Capitale de l'artisanat malgache, notamment la marqueterie en bois précieux.", crops:"Riz · Maïs · Patate douce", accent:"#f59e0b" },
  "Menabe":              { capital:"Morondava",              pop:"620 K",   growth:"+2.4%", positive:true,  surface:"46 121 km²", sparkline:[28,29,30,30,32,31,33], note:"Allée des baobabs, site touristique majeur. Pêche artisanale et production de sel.", crops:"Maïs · Manioc · Coton", accent:"#22d3ee" },
  "Haute Matsiatra":     { capital:"Fianarantsoa",           pop:"1.2 M",   growth:"+2.8%", positive:true,  surface:"21 080 km²", sparkline:[45,46,48,47,50,50,52], note:"Capitale culturelle du Sud. Vignobles, enseignement supérieur et patrimoine colonial.", crops:"Riz · Maïs · Vigne", accent:"#7c3aed" },
  "Vatovavy-Fitovinany": { capital:"Manakara",               pop:"1.2 M",   growth:"+1.9%", positive:true,  surface:"19 136 km²", sparkline:[38,39,40,39,41,41,43], note:"Côte est, canal des Pangalanes. Café Robusta et girofle de qualité premium.", crops:"Café · Girofle · Riz", accent:"#e879f9" },
  "Ihorombe":            { capital:"Ihosy",                  pop:"304 K",   growth:"+1.6%", positive:true,  surface:"26 391 km²", sparkline:[16,17,17,18,18,19,20], note:"Porte du sud. Élevage zébu intensif et mines de chromite prometteuses.", crops:"Maïs · Manioc · Élevage", accent:"#fb7185" },
  "Atsimo-Atsinanana":   { capital:"Vangaindrano",           pop:"830 K",   growth:"-0.2%", positive:false, surface:"18 863 km²", sparkline:[30,29,30,28,29,28,29], note:"Côte sud-est isolée. Accès difficile, déforestation critique, aide humanitaire active.", crops:"Riz · Manioc · Patate douce", accent:"#fbbf24" },
  "Atsimo-Andrefana":    { capital:"Toliara",                pop:"1.9 M",   growth:"+2.1%", positive:true,  surface:"66 236 km²", sparkline:[35,36,37,36,38,38,40], note:"Potentiel touristique (barrière de corail) et minier (ilménite, saphir) élevé.", crops:"Maïs · Manioc · Haricot", accent:"#65a30d" },
  "Androy":              { capital:"Ambovombe",              pop:"740 K",   growth:"-0.8%", positive:false, surface:"19 317 km²", sparkline:[22,21,22,20,21,20,20], note:"Région la plus aride, régulièrement touchée par la sécheresse. Programme KERE actif.", crops:"Manioc · Maïs · Élevage", accent:"#f97316" },
  "Anosy":               { capital:"Tôlanaro",               pop:"604 K",   growth:"+2.6%", positive:true,  surface:"25 695 km²", sparkline:[28,29,30,30,32,33,34], note:"Fort Dauphin, port minéralier QMM. Biodiversité unique : forêts épineuses endémiques.", crops:"Manioc · Riz · Maïs", accent:"#2dd4bf" },
};

/* ─── Sparkline ─── */
function Sparkline({ data, color = "#00e676", height = 52 }) {
  if (!data || data.length < 2) return null;
  const W = 200, H = height;
  const max = Math.max(...data), min = Math.min(...data), range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((v - min) / range) * (H - 8) - 4;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const [fx] = pts.split(' ')[0].split(',');
  const [lx] = pts.split(' ').slice(-1)[0].split(',');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id={`sg${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`${fx},${H} ${pts} ${lx},${H}`} fill={`url(#sg${color.replace('#','')})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── Animated counter span ─── */
function AnimVal({ v }) {
  return (
    <motion.span key={v} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
      transition={{ type:'spring', stiffness:280, damping:22 }}>
      {v}
    </motion.span>
  );
}

function DashboardPage() {
  return null;
}
