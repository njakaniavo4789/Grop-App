/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import { Send, Home, MessageSquare, Settings, User, Users, TrendingUp, Sprout, Leaf, CloudRain, Save, Lock, Eye, EyeOff, CheckCircle, AlertCircle, Search, Shield, UserCheck, Brain, Mic, MicOff, Wifi, WifiOff, ChevronDown, ChevronRight, Copy, Check, Sparkles, FlaskConical, BookOpen, FileText, RefreshCw, PanelLeftClose, PanelLeftOpen, LogOut, Sun, Moon } from 'lucide-react';
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from "react-router-dom";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Login from "./composant/login";
import Register from "./composant/register";
import cartographie from "./composant/cartographie";
import { getAccessToken, clearTokens, authAPI } from "./api/auth";
import { AgriculturalChat } from './components/chat';
import { FluidBackground } from './components/ui/FluidBackground';

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
      
      {/* Sidebar Glassmorphism */}
      <nav className="sidebar-glass" style={{
        width: collapsed ? 68 : 220,
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 10,
        flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ padding: collapsed ? 16 : 24, display: 'flex', alignItems: 'center', gap: 12 }}>
          <img 
            src="/logo.png" 
            alt="CropGPT" 
            style={{ width: 40, height: 40, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} 
          />
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
            <button
              onClick={() => setCollapsed(!collapsed)}
              title={collapsed ? 'Étendre' : 'Réduire'}
              style={{
                padding: 8, borderRadius: 8,
                background: 'transparent', border: 'none',
                color: 'var(--text-muted)', cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {collapsed ? <PanelLeftOpen size={18} strokeWidth={1.5} /> : <PanelLeftClose size={18} strokeWidth={1.5} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden" style={{ position: 'relative', zIndex: 1 }}>
        {currentPage === 'chat'
          ? <AgriculturalChat />
          : currentPage === 'dashboard'
            ? <DashboardPage />
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
        <Route path="/cartographie" element={<cartographie />} />
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
  const [nameMsg, setNameMsg] = useState(null); // { type: 'success'|'error', text }
  const [pwdMsg, setPwdMsg] = useState(null);

  useEffect(() => {
    const token = getAccessToken();
    authAPI.getProfile(token)
      .then(res => { setName(res.data.name); setEmail(res.data.email); })
      .catch(() => {});
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
    <div className="flex-1 overflow-y-auto" style={{ background: 'transparent', position: 'relative' }}>
      <FluidBackground />
      {/* Header */}
      <div style={{ background: 'transparent', padding: '24px 32px', position: 'relative', zIndex: 1 }}>
        <h2 style={{ fontSize: 28, fontWeight: 600, color: '#FFFFFF', fontFamily: 'var(--font-display)' }}>Paramètres</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: 14 }}>Gérez les informations de votre compte</p>
      </div>

      <div style={{ padding: '0 32px 32px', maxWidth: 720, position: 'relative', zIndex: 1 }}>

        {/* Section : Informations du profil */}
        <div style={{
          background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden', marginBottom: 24,
        }}>
          <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #10B981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={18} style={{ color: 'white' }} />
            </div>
            <div>
              <h3 style={{ fontWeight: 600, color: '#FFFFFF' }}>Informations du profil</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Modifiez votre nom d'affichage</p>
            </div>
          </div>

          <form onSubmit={handleNameSubmit} style={{ padding: '0 24px 24px' }}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>Adresse email</label>
              <input
                type="email"
                value={email}
                disabled
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: 12,
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                  color: 'var(--text-muted)', cursor: 'not-allowed', outline: 'none',
                }}
              />
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>L'adresse email ne peut pas être modifiée.</p>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>Nom complet</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                placeholder="Votre nom"
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: 12,
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'var(--text-primary)', outline: 'none',
                }}
              />
            </div>

            <SettingsAlert msg={nameMsg} />

            <button
              type="submit"
              disabled={nameLoading}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px',
                background: 'linear-gradient(135deg, #10B981, #059669)', color: 'white',
                fontWeight: 500, borderRadius: 12, border: 'none', cursor: 'pointer',
                opacity: nameLoading ? 0.6 : 1,
              }}
            >
              <Save size={16} />
              {nameLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </form>
        </div>

        {/* Section : Sécurité */}
        <div style={{
          background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden',
        }}>
          <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #10B981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Lock size={18} style={{ color: 'white' }} />
            </div>
            <div>
              <h3 style={{ fontWeight: 600, color: '#FFFFFF' }}>Changer le mot de passe</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Minimum 8 caractères</p>
            </div>
          </div>

          <form onSubmit={handlePwdSubmit} style={{ padding: '0 24px 24px' }}>
            <PwdField
              label="Mot de passe actuel"
              value={currentPwd}
              onChange={setCurrentPwd}
              show={showCurrentPwd}
              setShow={setShowCurrentPwd}
            />
            <PwdField
              label="Nouveau mot de passe"
              value={newPwd}
              onChange={setNewPwd}
              show={showNewPwd}
              setShow={setShowNewPwd}
            />
            <PwdField
              label="Confirmer le nouveau mot de passe"
              value={confirmPwd}
              onChange={setConfirmPwd}
              show={showConfirmPwd}
              setShow={setShowConfirmPwd}
            />

            <SettingsAlert msg={pwdMsg} />

            <button
              type="submit"
              disabled={pwdLoading}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px',
                background: 'linear-gradient(135deg, #10B981, #059669)', color: 'white',
                fontWeight: 500, borderRadius: 12, border: 'none', cursor: 'pointer',
                opacity: pwdLoading ? 0.6 : 1,
              }}
            >
              <Lock size={16} />
              {pwdLoading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
            </button>
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
      className={`sidebar-item ${active ? 'active' : ''}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'flex-start',
        gap: 12,
        padding: collapsed ? '12px' : '12px 16px',
        borderRadius: 12,
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        background: active ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
        color: active ? '#10B981' : 'var(--text-secondary)',
        border: active ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid transparent',
        width: '100%',
        marginBottom: 4,
      }}
    >
      <span style={{ flexShrink: 0 }}>{icon}</span>
      {!collapsed && (
        <span style={{
          fontSize: 14,
          fontWeight: 500,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
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

// Convertit le code WMO Open-Meteo → icône + libellé + gradient
function wmoInfo(code) {
  if (code === 0)  return { icon: '☀️',  label: 'Ciel dégagé',    bg: 'from-amber-400 to-orange-500'  };
  if (code <= 2)   return { icon: '🌤️',  label: 'Peu nuageux',    bg: 'from-yellow-300 to-sky-400'    };
  if (code <= 3)   return { icon: '☁️',  label: 'Couvert',        bg: 'from-slate-400 to-slate-500'   };
  if (code <= 48)  return { icon: '🌫️',  label: 'Brouillard',     bg: 'from-gray-300 to-gray-400'     };
  if (code <= 55)  return { icon: '🌦️',  label: 'Bruine',         bg: 'from-blue-300 to-cyan-400'     };
  if (code <= 65)  return { icon: '🌧️',  label: 'Pluie',          bg: 'from-blue-500 to-indigo-600'   };
  if (code <= 75)  return { icon: '❄️',  label: 'Neige',          bg: 'from-blue-100 to-sky-200'      };
  if (code <= 82)  return { icon: '🌧️',  label: 'Averses',        bg: 'from-blue-400 to-indigo-500'   };
  if (code <= 86)  return { icon: '🌨️',  label: 'Averses neige',  bg: 'from-sky-200 to-blue-300'      };
  return             { icon: '⛈️',  label: 'Orage',          bg: 'from-gray-600 to-gray-800'     };
}

function DashboardPage() { 
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [userList, setUserList] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState(null);   // { name, lat, lon, regionName, color }
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const mapRef = React.useRef(null);
  const mapInstanceRef = React.useRef(null);

  // Chargement des utilisateurs — visible uniquement si le compte est admin (sinon 403 silencieux)
  useEffect(() => {
    authAPI.getUsers(getAccessToken())
      .then(res => setUserList(res.data))
      .catch(() => {});
  }, []);

  // Météo temps réel via Open-Meteo (sans clé API) — déclenché au clic sur une région
  useEffect(() => {
    if (!selectedCity) return;
    setWeatherLoading(true);
    setWeather(null);
    fetch(
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${selectedCity.lat}&longitude=${selectedCity.lon}` +
      `&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,precipitation,weather_code` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
      `&wind_speed_unit=kmh&timezone=Indian%2FAntananarivo&forecast_days=5`
    )
      .then(r => r.json())
      .then(data => { setWeather(data); setWeatherLoading(false); })
      .catch(() => setWeatherLoading(false));
  }, [selectedCity]);

  React.useEffect(() => {
    const loadLeaflet = async () => {
      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      if (!window.L) {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.async = true;
        document.head.appendChild(script);

        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }

      if (mapRef.current && !mapInstanceRef.current && window.L) {
        initializeMap();
      }
    };

    const initializeMap = async () => {
      try {
        // Limites de Madagascar
        const madagascarBounds = window.L.latLngBounds(
          [-26.0, 42.8],
          [-11.5, 51.0]
        );

        const map = window.L.map(mapRef.current, {
          zoomControl: true,
          scrollWheelZoom: true,
          maxBounds: madagascarBounds,
          maxBoundsViscosity: 1.0,
          minZoom: 5,
          maxZoom: 10,
        }).fitBounds(madagascarBounds);

        // Tuile CartoDB Positron — carte réelle et épurée
        window.L.tileLayer(
          'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
          { attribution: '© OpenStreetMap © CARTO', subdomains: 'abcd', maxZoom: 10 }
        ).addTo(map);

        // Ville principale de chaque région (pour l'API météo)
        const regionCities = {
          'Diana':             { name: 'Antsiranana',       lat: -12.2787, lon: 49.2917 },
          'Sava':              { name: 'Sambava',            lat: -14.2667, lon: 50.1667 },
          'Analanjirofo':      { name: 'Fenoarivo Atsinanana', lat: -17.3833, lon: 49.4167 },
          'Sofia':             { name: 'Antsohihy',          lat: -14.8833, lon: 47.9833 },
          'Boeny':             { name: 'Mahajanga',           lat: -15.7167, lon: 46.3167 },
          'Betsiboka':         { name: 'Maevatanana',         lat: -16.9333, lon: 46.8333 },
          'Melaky':            { name: 'Maintirano',           lat: -18.0500, lon: 44.0167 },
          'Bongolava':         { name: 'Tsiroanomandidy',     lat: -18.7667, lon: 46.0500 },
          'Itasy':             { name: 'Miarinarivo',          lat: -19.0000, lon: 46.7333 },
          'Analamanga':        { name: 'Antananarivo',         lat: -18.9137, lon: 47.5361 },
          'Alaotra-Mangoro':   { name: 'Ambatondrazaka',       lat: -17.8333, lon: 48.4167 },
          'Atsinanana':        { name: 'Toamasina',            lat: -18.1443, lon: 49.4122 },
          'Vakinankaratra':    { name: 'Antsirabe',            lat: -19.8667, lon: 47.0333 },
          "Amoron'i Mania":    { name: 'Ambositra',            lat: -20.5333, lon: 47.2500 },
          'Menabe':            { name: 'Morondava',            lat: -20.2833, lon: 44.2833 },
          'Haute Matsiatra':   { name: 'Fianarantsoa',         lat: -21.4533, lon: 47.0858 },
          'Vatovavy-Fitovinany': { name: 'Manakara',             lat: -22.1500, lon: 48.0167 },
          'Ihorombe':          { name: 'Ihosy',                lat: -22.4000, lon: 46.1167 },
          'Atsimo-Atsinanana': { name: 'Vangaindrano',         lat: -23.3500, lon: 47.6000 },
          'Atsimo-Andrefana':  { name: 'Toliara',              lat: -23.3500, lon: 43.6667 },
          'Androy':            { name: 'Ambovombe',             lat: -25.1667, lon: 46.0833 },
          'Anosy':             { name: 'Tôlanaro',             lat: -25.0333, lon: 46.9833 },
        };

        // ── Données par région (nom exact du GeoJSON → couleur + infos) ──
        // Couleurs vives par région — inspirées de la carte multicolore de référence
        const regionData = {
          'Diana':              { color: '#e53935', data: { production: 88, crop: 'Cacao, Vanille',       farmers: '45 230',  area: '13 124 km²' } },
          'Sava':               { color: '#8e24aa', data: { production: 96, crop: 'Vanille, Girofle',     farmers: '67 890',  area: '25 518 km²' } },
          'Analanjirofo':       { color: '#f4511e', data: { production: 82, crop: 'Girofle, Litchi',      farmers: '55 000',  area: '21 930 km²' } },
          'Atsinanana':         { color: '#0b8043', data: { production: 80, crop: 'Girofle, Café',        farmers: '68 000',  area: '19 922 km²' } },
          'Vatovavy-Fitovinany':{ color: '#039be5', data: { production: 74, crop: 'Girofle, Café, Riz',  farmers: '80 000',  area: '19 605 km²' } },
          'Atsimo-Atsinanana':  { color: '#e67c73', data: { production: 70, crop: 'Riz, Girofle',        farmers: '35 000',  area: '18 993 km²' } },
          'Anosy':              { color: '#c0392b', data: { production: 68, crop: 'Sisal, Maïs',         farmers: '30 000',  area: '25 731 km²' } },
          'Androy':             { color: '#d4e157', data: { production: 60, crop: 'Manioc, Maïs',        farmers: '35 000',  area: '19 317 km²' } },
          'Atsimo-Andrefana':   { color: '#43a047', data: { production: 72, crop: 'Maïs, Haricot',       farmers: '54 320',  area: '66 236 km²' } },
          'Menabe':             { color: '#fb8c00', data: { production: 76, crop: 'Riz, Coton',          farmers: '40 000',  area: '46 121 km²' } },
          'Melaky':             { color: '#00acc1', data: { production: 65, crop: 'Maïs, Manioc',        farmers: '22 000',  area: '38 852 km²' } },
          'Boeny':              { color: '#7b1fa2', data: { production: 75, crop: 'Riz, Canne à sucre',  farmers: '38 000',  area: '31 046 km²' } },
          'Sofia':              { color: '#f6bf26', data: { production: 78, crop: 'Riz, Coton',          farmers: '48 000',  area: '53 239 km²' } },
          'Betsiboka':          { color: '#ef6c00', data: { production: 70, crop: 'Riz, Maïs',           farmers: '28 000',  area: '30 025 km²' } },
          'Analamanga':         { color: '#1e88e5', data: { production: 91, crop: 'Riz, Légumes',        farmers: '123 450', area: '16 911 km²' } },
          'Itasy':              { color: '#00897b', data: { production: 82, crop: 'Riz, Légumes',        farmers: '30 000',  area: '6 993 km²'  } },
          'Bongolava':          { color: '#6d4c41', data: { production: 73, crop: 'Riz, Arachide',       farmers: '32 000',  area: '18 599 km²' } },
          'Vakinankaratra':     { color: '#3949ab', data: { production: 89, crop: 'Riz, Pomme de terre', farmers: '98 760',  area: '16 993 km²' } },
          "Amoron'i Mania":     { color: '#e91e63', data: { production: 78, crop: 'Café, Riz',           farmers: '40 000',  area: '16 141 km²' } },
          'Haute Matsiatra':    { color: '#9c27b0', data: { production: 85, crop: 'Riz, Maïs, Manioc',  farmers: '87 650',  area: '21 080 km²' } },
          'Ihorombe':           { color: '#558b2f', data: { production: 65, crop: 'Maïs, Élevage',       farmers: '20 000',  area: '26 318 km²' } },
          'Alaotra-Mangoro':    { color: '#00838f', data: { production: 87, crop: 'Riz, Café',           farmers: '60 000',  area: '31 948 km²' } },
        };

        // Le GeoJSON utilise des latitudes positives (convention D3).
        // Leaflet attend des latitudes négatives pour l'hémisphère sud → on inverse.
        const leafletGeoJSON = {
          ...MADAGASCAR_GEOJSON,
          features: MADAGASCAR_GEOJSON.features.map(f => ({
            ...f,
            geometry: {
              ...f.geometry,
              coordinates: f.geometry.coordinates.map(ring =>
                ring.map(([lon, lat]) => [lon, -lat])
              )
            }
          }))
        };

        // ── Rendu GeoJSON — style via option `style` (méthode correcte Leaflet) ──
        const geojsonLayer = window.L.geoJSON(leafletGeoJSON, {
          style: (feature) => {
            const rd = regionData[feature.properties.name] || { color: '#94a3b8' };
            return {
              fillColor: rd.color,
              color: '#ffffff',       // bordure blanche entre régions
              weight: 1.5,
              fillOpacity: 0.82,
              opacity: 1,
            };
          },
          onEachFeature: (feature, layer) => {
            const name  = feature.properties.name || '—';
            const rd    = regionData[name] || { color: '#94a3b8', data: { crop: '—', area: '—', farmers: '—', production: 0 } };
            const color = rd.color;
            const d     = rd.data;

            layer.bindPopup(`
              <div style="font-family:system-ui;padding:10px;min-width:210px;">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
                  <div style="width:14px;height:14px;border-radius:3px;background:${color};flex-shrink:0;"></div>
                  <h3 style="margin:0;font-size:15px;font-weight:700;color:#1f2937;">${name}</h3>
                </div>
                <p style="margin:3px 0;font-size:12px;color:#374151;"><strong>🌾</strong> ${d.crop}</p>
                <p style="margin:3px 0;font-size:12px;color:#374151;"><strong>📍</strong> ${d.area}</p>
                <p style="margin:3px 0;font-size:12px;color:#374151;"><strong>👨‍🌾</strong> ${d.farmers} agriculteurs</p>
                <div style="margin-top:8px;padding-top:8px;border-top:1px solid #e5e7eb;">
                  <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                    <span style="font-size:11px;color:#6b7280;">Production</span>
                    <span style="font-size:13px;font-weight:700;color:${color};">${d.production}%</span>
                  </div>
                  <div style="background:#e5e7eb;border-radius:9999px;height:6px;overflow:hidden;">
                    <div style="background:${color};height:100%;width:${d.production}%;border-radius:9999px;"></div>
                  </div>
                </div>
              </div>
            `);
            layer.on('mouseover', function () {
              this.setStyle({ fillOpacity: 1, weight: 3, color: '#333' });
              this.bringToFront();
            });
            layer.on('mouseout', function () {
              geojsonLayer.resetStyle(this);
            });
            const city = regionCities[name];
            if (city) layer.on('click', () => setSelectedCity({ ...city, regionName: name, color }));
          },
        }).addTo(map);

        // Villes principales
        const cities = [
          { name: 'Antananarivo', coords: [-18.8792, 47.5079], capital: true },
          { name: 'Toamasina',    coords: [-18.1443, 49.4122] },
          { name: 'Antsirabe',    coords: [-19.8667, 47.0333] },
          { name: 'Fianarantsoa', coords: [-21.4533, 47.0858] },
          { name: 'Toliara',      coords: [-23.3500, 43.6667] },
          { name: 'Antsiranana',  coords: [-12.2787, 49.2917] },
          { name: 'Mahajanga',    coords: [-15.7167, 46.3167] },
        ];
        cities.forEach(city => {
          const marker = window.L.circleMarker(city.coords, {
            radius: city.capital ? 7 : 4,
            fillColor: '#1e293b',
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 1,
          }).addTo(map);
          marker.bindPopup(`<strong>${city.name}</strong>${city.capital ? '<br/><em>Capitale</em>' : ''}`);
        });

        // Légende intégrée à la carte (overlay Leaflet)
        const legendCtrl = window.L.control({ position: 'bottomleft' });
        legendCtrl.onAdd = () => {
          const div = window.L.DomUtil.create('div');
          div.style.cssText = [
            'background:rgba(255,255,255,0.93)',
            'padding:8px 10px',
            'border-radius:10px',
            'box-shadow:0 2px 10px rgba(0,0,0,0.18)',
            'font-family:system-ui',
            'max-height:210px',
            'overflow-y:auto',
            'min-width:160px',
            'line-height:1',
          ].join(';');
          div.innerHTML = `
            <div style="font-size:11px;font-weight:700;color:#374151;margin-bottom:5px;padding-bottom:4px;border-bottom:1px solid #e5e7eb;">Régions</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:3px 8px;">
              ${Object.entries(regionData).map(([name, r]) => `
                <div style="display:flex;align-items:center;gap:4px;">
                  <div style="width:9px;height:9px;flex-shrink:0;border-radius:2px;background:${r.color};opacity:0.85;"></div>
                  <span style="font-size:9.5px;color:#4b5563;white-space:nowrap;">${name}</span>
                </div>
              `).join('')}
            </div>
            <div style="display:flex;align-items:center;gap:4px;margin-top:5px;padding-top:4px;border-top:1px solid #e5e7eb;">
              <div style="width:9px;height:9px;border-radius:50%;background:#1e293b;border:1.5px solid white;box-shadow:0 0 0 1px #64748b;flex-shrink:0;"></div>
              <span style="font-size:9.5px;color:#4b5563;">Villes principales</span>
            </div>
          `;
          window.L.DomEvent.disableClickPropagation(div);
          window.L.DomEvent.disableScrollPropagation(div);
          return div;
        };
        legendCtrl.addTo(map);

        mapInstanceRef.current = map;
        setTimeout(() => { map.invalidateSize(); }, 100);
      } catch (error) {
        console.error('Erreur initialisation carte:', error);
      }
    };

    loadLeaflet();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const stats = [
    { icon: <Sprout className="text-green-600" />, label: "Parcelles Actives", value: "2,847", change: "+18.5%", color: "from-green-400 to-emerald-500", subtext: "hectares" },
    { icon: <Leaf className="text-emerald-600" />, label: "Production Totale", value: "12.5T", change: "+12.8%", color: "from-emerald-400 to-lime-500", subtext: "cette saison" },
    { icon: <CloudRain className="text-blue-600" />, label: "Pluviométrie", value: "1,234mm", change: "+8.2%", color: "from-blue-400 to-cyan-500", subtext: "cette année" },
    { icon: <TrendingUp className="text-lime-600" />, label: "Taux de Réussite", value: "94.7%", change: "+6.3%", color: "from-lime-400 to-green-500", subtext: "des cultures" }
  ];

  const regions = [
    { id: 1,  name: "Diana",             production: 88, crop: "Cacao, Vanille",        color: "#3b82f6", area: "19 266 km²",  farmers: "45 230"  },
    { id: 2,  name: "SAVA",              production: 96, crop: "Vanille, Girofle",       color: "#ef4444", area: "25 518 km²",  farmers: "67 890"  },
    { id: 3,  name: "Analamanga",        production: 91, crop: "Riz, Légumes",           color: "#10b981", area: "16 911 km²",  farmers: "123 450" },
    { id: 4,  name: "Vakinankaratra",    production: 89, crop: "Riz, Pomme de terre",   color: "#14b8a6", area: "16 599 km²",  farmers: "98 760"  },
    { id: 5,  name: "Haute Matsiatra",   production: 85, crop: "Riz, Maïs, Manioc",    color: "#7c3aed", area: "21 080 km²",  farmers: "87 650"  },
    { id: 6,  name: "Alaotra-Mangoro",   production: 87, crop: "Riz, Café",             color: "#eab308", area: "31 948 km²",  farmers: "60 000"  },
    { id: 7,  name: "Boeny",             production: 75, crop: "Riz, Canne à sucre",    color: "#8b5cf6", area: "31 046 km²",  farmers: "38 000"  },
    { id: 8,  name: "Sofia",             production: 78, crop: "Riz, Coton",            color: "#f97316", area: "50 875 km²",  farmers: "48 000"  },
    { id: 9,  name: "Analanjirofo",      production: 82, crop: "Girofle, Litchi",        color: "#f43f5e", area: "21 930 km²",  farmers: "55 000"  },
    { id: 10, name: "Atsinanana",        production: 80, crop: "Girofle, Café",          color: "#6366f1", area: "21 934 km²",  farmers: "68 000"  },
    { id: 11, name: "Atsimo-Andrefana",  production: 72, crop: "Maïs, Haricot",         color: "#65a30d", area: "66 236 km²",  farmers: "54 320"  },
    { id: 12, name: "Androy",            production: 60, crop: "Manioc, Maïs",           color: "#f59e0b", area: "19 317 km²",  farmers: "35 000"  },
  ];


  return (
    <div className="flex-1 overflow-y-auto" style={{ background: 'transparent', position: 'relative' }}>
      <FluidBackground />
      {/* Header */}
      <div style={{ 
        background: 'transparent',
        padding: '24px 32px',
        position: 'relative', zIndex: 1
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ 
              fontSize: 28, 
              fontWeight: 600, 
              color: '#FFFFFF',
              fontFamily: 'var(--font-display)' 
            }}>Tableau de Bord Agricole</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: 14 }}>
              Vue d'ensemble de l'agriculture à Madagascar
            </p>
          </div>
          <div style={{ 
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'white', 
            padding: '12px 20px', 
            borderRadius: 16,
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.15)'
          }}>
            <div style={{ fontSize: 11, opacity: 0.7 }}>Saison Actuelle</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>Été Austral 2026</div>
          </div>
        </div>
      </div>

      <div style={{ padding: 32, position: 'relative', zIndex: 1 }}>
        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 32 }}>
          {stats.map((stat, index) => (
            <div key={index} style={{
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16,
              padding: 20,
              transition: 'all 0.3s',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: 14,
                  background: stat.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}>
                  {stat.icon}
                </div>
                <span style={{ 
                  fontSize: 13, 
                  fontWeight: 600, 
                  color: '#10B981', 
                  background: 'rgba(16,185,129,0.15)', 
                  padding: '4px 12px', 
                  borderRadius: 20 
                }}>{stat.change}</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 4 }}>{stat.label}</p>
              <p style={{ color: '#FFFFFF', fontSize: 32, fontWeight: 700, marginBottom: 4 }}>{stat.value}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: 11 }}>{stat.subtext}</p>
            </div>
          ))}
        </div>

        {/* Map Section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 20, marginBottom: 24 }}>
          <div style={{ gridColumn: 'span 4', background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: '#FFFFFF', fontFamily: 'var(--font-display)' }}>Carte de Madagascar</h3>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: 20 }}>
                Cliquez sur une région
              </span>
            </div>
            <div
              ref={mapRef}
              style={{ 
                width: '100%', 
                borderRadius: 12, 
                overflow: 'hidden', 
                height: 600,
                border: '1px solid rgba(255,255,255,0.05)'
              }}
            ></div>
          </div>

          {/* Panel météo temps réel */}
          <div style={{ 
            background: 'rgba(255,255,255,0.03)', 
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.08)', 
            borderRadius: 16, 
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 600
          }}>
            {!selectedCity ? (
              /* Invite de sélection */
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: 24,
                gap: 20
              }}>
                <div style={{
                  width: 80,
                  height: 80,
                  borderRadius: 24,
                  background: 'linear-gradient(135deg, #3B82F6, #06B6D4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(6, 182, 212, 0.3)'
                }}>
                  <CloudRain size={36} style={{ color: 'white' }} />
                </div>
                <div>
                  <h3 style={{ fontWeight: 600, color: '#FFFFFF', marginBottom: 8 }}>Météo en temps réel</h3>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    Cliquez sur une région de la carte pour afficher sa météo en direct
                  </p>
                </div>
                <div style={{ width: '100%', paddingTop: 16 }}>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Source : Open-Meteo • Sans clé API</p>
                </div>
              </div>
            ) : weatherLoading ? (
              /* Chargement */
              <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Récupération météo…</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{selectedCity.name}</p>
              </div>
            ) : weather && weather.current ? (
              /* Données météo */
              <div className="flex flex-col h-full overflow-y-auto">
                {/* En-tête dégradé */}
                <div className={`px-5 py-5 bg-gradient-to-br ${wmoInfo(weather.current.weather_code).bg} text-white flex-shrink-0`}>
                  <p className="text-xs opacity-75 mb-0.5 uppercase tracking-wider">{selectedCity.regionName}</p>
                  <h3 className="text-xl font-bold mb-3">{selectedCity.name}</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-5xl leading-none">{wmoInfo(weather.current.weather_code).icon}</span>
                    <div>
                      <p className="text-4xl font-bold leading-none">{Math.round(weather.current.temperature_2m)}°C</p>
                      <p className="text-sm opacity-90 mt-1">{wmoInfo(weather.current.weather_code).label}</p>
                    </div>
                  </div>
                </div>

                {/* 4 métriques courantes */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: 16 }}>
                  {[
                    { icon: '🌡️', label: 'Ressenti',  value: `${Math.round(weather.current.apparent_temperature)}°C` },
                    { icon: '💧', label: 'Humidité',  value: `${weather.current.relative_humidity_2m}%`            },
                    { icon: '💨', label: 'Vent',       value: `${Math.round(weather.current.wind_speed_10m)} km/h`  },
                    { icon: '🌧️', label: 'Précip.',   value: `${weather.current.precipitation} mm`                 },
                  ].map((d, i) => (
                    <div key={i} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 10, textAlign: 'center' }}>
                      <div style={{ fontSize: 18, marginBottom: 2 }}>{d.icon}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF' }}>{d.value}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{d.label}</div>
                    </div>
                  ))}
                </div>

                {/* Prévisions 5 jours */}
                <div style={{ padding: 16, flex: 1 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Prévisions 5 jours</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {weather.daily.time.map((date, i) => {
                      const info = wmoInfo(weather.daily.weather_code[i]);
                      const dayName = new Date(date + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'short' });
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 12, transition: 'background 0.2s' }}>
                          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', width: 40, textTransform: 'capitalize' }}>{dayName}</span>
                          <span style={{ fontSize: 20 }}>{info.icon}</span>
                          <span style={{ fontSize: 12, color: '#3B82F6', width: 40, textAlign: 'center' }}>
                            💧{weather.daily.precipitation_probability_max[i]}%
                          </span>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF' }}>
                              {Math.round(weather.daily.temperature_2m_max[i])}°
                            </span>
                            <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 4 }}>
                              {Math.round(weather.daily.temperature_2m_min[i])}°
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Pied de page */}
                <div style={{ padding: '12px 16px' }}>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>
                    Open-Meteo · Mis à jour à l'instant
                  </p>
                </div>
              </div>
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontSize: 14, color: '#EF4444' }}>
                Impossible de charger la météo.
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24, marginBottom: 24 }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: '#FFFFFF', marginBottom: 16, fontFamily: 'var(--font-display)' }}>Production par Région</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {regions.map((region, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 16,
                    borderRadius: 12,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={() => setSelectedRegion(region.id)}
                  onMouseLeave={() => setSelectedRegion(null)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 14, height: 14, borderRadius: '50%', background: region.color, boxShadow: `0 0 8px ${region.color}40` }}></div>
                    <div>
                      <span style={{ fontWeight: 600, color: '#FFFFFF', fontSize: 14 }}>{region.name}</span>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{region.crop}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{region.farmers} agriculteurs</p>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{region.area}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 80, height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 20, overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: 20, width: `${region.production}%`, background: region.color, transition: 'width 0.3s' }}></div>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF', width: 36 }}>{region.production}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: '#FFFFFF', marginBottom: 16, fontFamily: 'var(--font-display)' }}>Performance des Cultures</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { name: "Riz Paddy", yield: "4.2T/ha", status: "Excellent", trend: "+12%", icon: "🌾", color: "from-green-400 to-emerald-500" },
                { name: "Vanille", yield: "2.8kg/ha", status: "Très Bon", trend: "+18%", icon: "🌿", color: "from-emerald-400 to-lime-500" },
                { name: "Café Arabica", yield: "1.5T/ha", status: "Bon", trend: "+8%", icon: "☕", color: "from-lime-400 to-green-500" },
                { name: "Girofle", yield: "850kg/ha", status: "Excellent", trend: "+15%", icon: "🌸", color: "from-green-500 to-emerald-600" },
                { name: "Cacao", yield: "1.2T/ha", status: "Bon", trend: "+10%", icon: "🍫", color: "from-emerald-500 to-lime-600" }
              ].map((crop, index) => (
                <div key={index} style={{
                  padding: 16,
                  borderRadius: 12,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  transition: 'all 0.2s',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 12,
                        background: `linear-gradient(135deg, ${crop.color.includes('green-400') ? '#4ade80' : crop.color.includes('emerald-400') ? '#34d399' : crop.color.includes('lime-400') ? '#a3e635' : crop.color.includes('green-500') ? '#22c55e' : '#10b981'}, ${crop.color.includes('lime') ? '#84cc16' : '#059669'})`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 22,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                      }}>
                        {crop.icon}
                      </div>
                      <div>
                        <h4 style={{ fontWeight: 600, color: '#FFFFFF', fontSize: 14 }}>{crop.name}</h4>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Rendement: {crop.yield}</p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#10B981', background: 'rgba(16,185,129,0.15)', padding: '4px 10px', borderRadius: 20 }}>{crop.trend}</span>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{crop.status}</p>
                    </div>
                  </div>
                  <div style={{ width: '100%', background: 'rgba(255,255,255,0.1)', borderRadius: 20, height: 6, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 20,
                      background: 'linear-gradient(135deg, #10B981, #06B6D4)',
                      width: `${70 + index * 5}%`,
                      transition: 'width 0.3s',
                    }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Liste des utilisateurs (admin uniquement) ── */}
        {userList.length > 0 && (() => {
          const fmt = iso => iso
            ? new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
            : '—';
          const filtered = userList.filter(u =>
            u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
            u.email.toLowerCase().includes(userSearch.toLowerCase())
          );
          return (
            <div style={{ marginTop: 24, background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden' }}>
              {/* En-tête */}
              <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={20} style={{ color: 'white' }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 600, color: '#FFFFFF' }}>Utilisateurs inscrits</h3>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {userList.length} compte{userList.length > 1 ? 's' : ''} — {userList.filter(u => u.is_staff).length} admin{userList.filter(u => u.is_staff).length > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div style={{ position: 'relative' }}>
                  <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Rechercher nom ou email…"
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                    style={{
                      paddingLeft: 36, paddingRight: 16, paddingTop: 8, paddingBottom: 8, fontSize: 13,
                      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 12, color: 'var(--text-primary)', outline: 'none', width: 224,
                    }}
                  />
                </div>
              </div>

              {/* Tableau */}
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
                    {filtered.length === 0
                      ? <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 14 }}>Aucun résultat.</td></tr>
                      : filtered.map(u => (
                        <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s' }}>
                          <td style={{ padding: '16px 24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <UserAvatar name={u.name} />
                              <span style={{ fontWeight: 600, color: '#FFFFFF' }}>{u.name}</span>
                            </div>
                          </td>
                          <td style={{ padding: '16px 24px', fontSize: 13, color: 'var(--text-secondary)' }}>{u.email}</td>
                          <td style={{ padding: '16px 24px' }}>
                            {u.is_staff
                              ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: 'rgba(139,92,246,0.15)', color: '#A78BFA' }}><Shield size={11} /> Admin</span>
                              : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: 'rgba(16,185,129,0.15)', color: '#34D399' }}><User size={11} /> Utilisateur</span>}
                          </td>
                          <td style={{ padding: '16px 24px' }}>
                            {u.is_active
                              ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: 'rgba(16,185,129,0.15)', color: '#34D399' }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} /> Actif</span>
                              : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6B7280', display: 'inline-block' }} /> Inactif</span>}
                          </td>
                          <td style={{ padding: '16px 24px', fontSize: 13, color: 'var(--text-muted)' }}>{fmt(u.created_at)}</td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>
            </div>
          );
        })()}

      </div>
    </div>
  );
}