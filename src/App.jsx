/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import { Send, Home, MessageSquare, Settings, User, Users, TrendingUp, Sprout, Leaf, CloudRain, Save, Lock, Eye, EyeOff, CheckCircle, AlertCircle, Search, Shield, UserCheck } from 'lucide-react';
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from "react-router-dom";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Login from "./composant/login";
import Register from "./composant/register";
import cartographie from "./composant/cartographie";
import { getAccessToken, clearTokens, authAPI } from "./api/auth";
import { MADAGASCAR_GEOJSON } from "./data/madagascarGeoJSON";

function MarkdownMessage({ content }) {
  return (
    <div className="prose-chat">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({children}) => <h1 style={{fontSize:'1.25rem',fontWeight:700,margin:'1rem 0 0.5rem',color:'#111827',lineHeight:1.3}}>{children}</h1>,
          h2: ({children}) => <h2 style={{fontSize:'1.1rem',fontWeight:600,margin:'0.9rem 0 0.4rem',color:'#1f2937',lineHeight:1.3}}>{children}</h2>,
          h3: ({children}) => <h3 style={{fontSize:'1rem',fontWeight:600,margin:'0.75rem 0 0.35rem',color:'#374151',lineHeight:1.3}}>{children}</h3>,
          p: ({children}) => <p style={{margin:'0 0 0.75rem',color:'#374151',lineHeight:1.7,fontSize:'0.9375rem'}}>{children}</p>,
          ul: ({children}) => <ul style={{margin:'0.25rem 0 0.75rem',paddingLeft:'1.5rem',listStyleType:'disc',color:'#374151'}}>{children}</ul>,
          ol: ({children}) => <ol style={{margin:'0.25rem 0 0.75rem',paddingLeft:'1.5rem',listStyleType:'decimal',color:'#374151'}}>{children}</ol>,
          li: ({children}) => <li style={{margin:'0.25rem 0',lineHeight:1.65,fontSize:'0.9375rem'}}>{children}</li>,
          strong: ({children}) => <strong style={{fontWeight:600,color:'#111827'}}>{children}</strong>,
          em: ({children}) => <em style={{fontStyle:'italic',color:'#4b5563'}}>{children}</em>,
          code: ({className, children, ...props}) => {
            const isBlock = className?.startsWith('language-');
            if (isBlock) {
              return <code style={{display:'block',background:'#1e293b',color:'#e2e8f0',padding:'1rem',borderRadius:'0.5rem',overflowX:'auto',fontSize:'0.8125rem',fontFamily:'ui-monospace,monospace',lineHeight:1.6}} {...props}>{children}</code>;
            }
            return <code style={{background:'#f1f5f9',color:'#16a34a',padding:'0.15rem 0.35rem',borderRadius:'0.25rem',fontSize:'0.8125rem',fontFamily:'ui-monospace,monospace'}} {...props}>{children}</code>;
          },
          pre: ({children}) => <pre style={{background:'#1e293b',borderRadius:'0.5rem',overflow:'hidden',margin:'0.75rem 0'}}>{children}</pre>,
          table: ({children}) => (
            <div style={{overflowX:'auto',margin:'0.75rem 0'}}>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:'0.875rem'}}>{children}</table>
            </div>
          ),
          thead: ({children}) => <thead style={{background:'#f8fafc'}}>{children}</thead>,
          th: ({children}) => <th style={{border:'1px solid #e2e8f0',padding:'0.5rem 0.75rem',textAlign:'left',fontWeight:600,color:'#374151',fontSize:'0.8125rem'}}>{children}</th>,
          td: ({children}) => <td style={{border:'1px solid #e2e8f0',padding:'0.5rem 0.75rem',color:'#4b5563',fontSize:'0.875rem'}}>{children}</td>,
          tr: ({children}) => <tr style={{borderBottom:'1px solid #f1f5f9'}}>{children}</tr>,
          blockquote: ({children}) => <blockquote style={{borderLeft:'3px solid #16a34a',paddingLeft:'1rem',margin:'0.75rem 0',color:'#6b7280',fontStyle:'italic'}}>{children}</blockquote>,
          a: ({href, children}) => <a href={href} style={{color:'#16a34a',textDecoration:'underline'}} target="_blank" rel="noopener noreferrer">{children}</a>,
          hr: () => <hr style={{border:'none',borderTop:'1px solid #e5e7eb',margin:'1rem 0'}} />,
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
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [userInfo, setUserInfo] = useState({ name: 'Agriculteur', email: '', isAdmin: false });
  
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
    <div className="flex h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-lime-50">
      {/* Navbar */}
      <nav className="w-64 bg-white/80 backdrop-blur-sm shadow-lg flex flex-col">
        <div className="p-6">
          <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl flex items-center justify-center mb-6">
            <div className="text-white text-xl font-bold">🌾</div>
          </div>
          <h1 className="text-xl font-semibold text-gray-800">Grok App</h1>
          <p className="text-sm text-gray-500 mt-1">Agriculture Madagascar</p>
        </div>

        <div className="flex-1 px-4">
          <div className="space-y-2">
            <NavItem
              icon={<Home size={20} />}
              label="Dashboard"
              active={currentPage === 'dashboard'}
              onClick={() => setCurrentPage('dashboard')}
            />
            <NavItem
              icon={<MessageSquare size={20} />}
              label="Chat"
              active={currentPage === 'chat'}
              onClick={() => setCurrentPage('chat')}
            />
            <NavItem
              icon={<Settings size={20} />}
              label="Paramètres"
              active={currentPage === 'settings'}
              onClick={() => setCurrentPage('settings')}
            />
            {userInfo.isAdmin && (
              <NavItem
                icon={<Users size={20} />}
                label="Utilisateurs"
                active={currentPage === 'users'}
                onClick={() => setCurrentPage('users')}
              />
            )}
          </div>
        </div>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
              <User size={20} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{userInfo.name}</p>
              <p className="text-xs text-gray-500">{userInfo.isAdmin ? '⭐ Admin' : 'Connecté'}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Déconnexion"
              className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {currentPage === 'chat'
          ? <ChatPage messages={messages} inputValue={inputValue} setInputValue={setInputValue} handleSendMessage={handleSendMessage} handleStopStreaming={handleStopStreaming} />
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
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          required
          className="w-full px-4 py-3 pr-11 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-800 transition-all"
        />
        <button type="button" onClick={() => setShow(!show)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}

function SettingsAlert({ msg }) {
  if (!msg) return null;
  return (
    <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm ${
      msg.type === 'success'
        ? 'bg-green-50 border border-green-200 text-green-700'
        : 'bg-red-50 border border-red-200 text-red-700'
    }`}>
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
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm px-8 py-6 border-b border-gray-200">
        <h2 className="text-3xl font-semibold text-gray-800">Paramètres</h2>
        <p className="text-gray-500 mt-1">Gérez les informations de votre compte</p>
      </div>

      <div className="p-8 max-w-2xl space-y-8">

        {/* Section : Informations du profil */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <User size={18} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Informations du profil</h3>
              <p className="text-xs text-gray-500">Modifiez votre nom d'affichage</p>
            </div>
          </div>

          <form onSubmit={handleNameSubmit} className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse email</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-400 cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-1">L'adresse email ne peut pas être modifiée.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom complet</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                placeholder="Votre nom"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-800 transition-all"
              />
            </div>

            <SettingsAlert msg={nameMsg} />

            <button
              type="submit"
              disabled={nameLoading}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
            >
              <Save size={16} />
              {nameLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </form>
        </div>

        {/* Section : Sécurité */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <Lock size={18} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Changer le mot de passe</h3>
              <p className="text-xs text-gray-500">Minimum 8 caractères</p>
            </div>
          </div>

          <form onSubmit={handlePwdSubmit} className="px-6 py-5 space-y-4">
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
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
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
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm px-8 py-6 border-b border-gray-200">
        <h2 className="text-3xl font-semibold text-gray-800">Gestion des Utilisateurs</h2>
        <p className="text-gray-500 mt-1">{total} utilisateur{total !== 1 ? 's' : ''} inscrit{total !== 1 ? 's' : ''}</p>
      </div>

      <div className="p-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-5">
          {[
            { label: 'Total utilisateurs', value: total,  icon: <Users size={22} className="text-blue-600" />,  color: 'from-blue-400 to-indigo-500'   },
            { label: 'Administrateurs',    value: admins, icon: <Shield size={22} className="text-violet-600" />, color: 'from-violet-400 to-purple-500' },
            { label: 'Comptes actifs',     value: actifs, icon: <UserCheck size={22} className="text-emerald-600" />, color: 'from-emerald-400 to-teal-500' },
          ].map((s, i) => (
            <div key={i} className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-gray-200 flex items-center gap-4 hover:shadow-lg transition-all">
              <div className={`w-14 h-14 bg-gradient-to-br ${s.color} rounded-xl flex items-center justify-center shadow-md`}>
                {s.icon}
              </div>
              <div>
                <p className="text-sm text-gray-500">{s.label}</p>
                <p className="text-3xl font-bold text-gray-800">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Table card */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          {/* Search bar */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom ou email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              />
            </div>
            <span className="text-sm text-gray-400 ml-auto">{filtered.length} résultat{filtered.length !== 1 ? 's' : ''}</span>
          </div>

          {/* Table */}
          {loading ? (
            <div className="py-16 text-center text-gray-400">Chargement...</div>
          ) : error ? (
            <div className="py-16 text-center text-red-500">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-400">Aucun utilisateur trouvé.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Utilisateur</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rôle</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Inscrit le</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(user => (
                    <tr key={user.id} className="hover:bg-green-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar name={user.name} isAdmin={user.is_staff} />
                          <span className="font-medium text-gray-800">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                      <td className="px-6 py-4">
                        {user.is_staff ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-100 text-violet-700">
                            <Shield size={11} /> Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                            <User size={11} /> Utilisateur
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {user.is_active ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Actif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span> Inactif
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{formatDate(user.created_at)}</td>
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

function ChatPage({ messages, inputValue, setInputValue, handleSendMessage, handleStopStreaming }) {
  const suggestedPrompts = [
    { icon: "🌱", title: "Meilleures cultures pour Madagascar", subtitle: "Conseils de plantation" },
    { icon: "☁️", title: "Prévisions météo agricoles", subtitle: "Climat & Saisons" },
    { icon: "🌾", title: "Techniques de culture durable", subtitle: "Agriculture bio" }
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Chat Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm px-8 py-4 border-b border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-800">Assistant Agricole IA</h2>
        <p className="text-sm text-gray-500 mt-1">Votre guide pour l'agriculture à Madagascar</p>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {messages.length === 0 ? (
          <div className="max-w-3xl mx-auto text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-700 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <span className="text-white text-2xl">🌾</span>
            </div>
            <h1 className="text-3xl font-semibold text-gray-700 mb-3">Bonjour, Agriculteur</h1>
            <h2 className="text-2xl text-gray-600 mb-2">Comment puis-je vous aider?</h2>
            <p className="text-gray-500 mb-12">
              Prêt à vous assister dans vos activités agricoles, de la plantation<br />
              à la récolte. Commençons ensemble!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {suggestedPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => setInputValue(prompt.title)}
                  className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 text-left hover:shadow-xl hover:scale-105 transition-all border border-gray-200"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl flex items-center justify-center mb-4">
                    <span className="text-xl">{prompt.icon}</span>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-1">{prompt.title}</h3>
                  <p className="text-sm text-gray-500">{prompt.subtitle}</p>
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
                <div key={index} style={{display:'flex',alignItems:'flex-start',gap:12,padding:'16px 0',borderBottom:'1px solid #f3f4f6'}}>
                  {/* Avatar CropGPT */}
                  <div style={{
                    width:34,height:34,flexShrink:0,
                    background:'linear-gradient(135deg,#16a34a,#059669)',
                    borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',
                    fontSize:16,marginTop:2,boxShadow:'0 1px 3px rgba(0,0,0,0.15)',
                  }}>
                    🌾
                  </div>

                  {/* Contenu */}
                  <div style={{flex:1,minWidth:0}}>

                    {/* Étiquette nom */}
                    <div style={{fontSize:'0.8125rem',fontWeight:600,color:'#16a34a',marginBottom:6,letterSpacing:'0.01em'}}>
                      CropGPT
                    </div>

                    {isStreaming ? (
                      <div>
                        {/* ── Bloc thinking pipeline (style Claude) ── */}
                        {message.thinkingSteps?.length > 0 && (
                          <details open style={{marginBottom:10}}>
                            <summary style={{
                              cursor:'pointer',
                              display:'flex',alignItems:'center',gap:6,
                              fontSize:'0.8125rem',color:'#7c3aed',fontWeight:500,
                              userSelect:'none',listStyle:'none',outline:'none',
                              padding:'6px 10px',
                              background:'#f5f3ff',borderRadius:8,
                              border:'1px solid #ede9fe',
                              width:'fit-content',
                            }}>
                              {/* Spinner animé pendant la génération */}
                              <svg style={{width:14,height:14,animation:'spin 1s linear infinite',flexShrink:0}} viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="#c4b5fd" strokeWidth="3"/>
                                <path d="M12 2a10 10 0 0 1 10 10" stroke="#7c3aed" strokeWidth="3" strokeLinecap="round"/>
                              </svg>
                              Analyse en cours
                            </summary>
                            <div style={{
                              marginTop:6,padding:'10px 12px',
                              background:'#faf9ff',border:'1px solid #ede9fe',
                              borderRadius:8,display:'flex',flexDirection:'column',gap:6,
                            }}>
                              {message.thinkingSteps.map((step, i) => {
                                const isLast = i === message.thinkingSteps.length - 1;
                                return (
                                  <div key={i} style={{display:'flex',alignItems:'center',gap:8,fontSize:'0.8125rem'}}>
                                    {isLast ? (
                                      <svg style={{width:14,height:14,animation:'spin 1s linear infinite',color:'#7c3aed',flexShrink:0}} viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="12" r="10" stroke="#ddd6fe" strokeWidth="3"/>
                                        <path d="M12 2a10 10 0 0 1 10 10" stroke="#7c3aed" strokeWidth="3" strokeLinecap="round"/>
                                      </svg>
                                    ) : (
                                      <svg style={{width:14,height:14,color:'#16a34a',flexShrink:0}} viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
                                        <polyline points="20 6 9 17 4 12"/>
                                      </svg>
                                    )}
                                    <span style={{
                                      color: isLast ? '#6d28d9' : '#9ca3af',
                                      fontWeight: isLast ? 500 : 400,
                                      textDecoration: isLast ? 'none' : 'none',
                                    }}>
                                      {step}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </details>
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
                        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:8}}>
                          <span style={{fontSize:'0.75rem',color:'#d1d5db',fontFamily:'ui-monospace,monospace'}}>
                            {(message.streamingTime || 0).toFixed(1)}s
                          </span>
                          {message.isStreaming && (
                            <button
                              onClick={handleStopStreaming}
                              style={{
                                fontSize:'0.75rem',padding:'3px 10px',
                                background:'#fef2f2',color:'#dc2626',
                                border:'1px solid #fecaca',borderRadius:6,cursor:'pointer',
                              }}
                            >
                              Arrêter
                            </button>
                          )}
                        </div>
                      </div>
                    ) : message.isOffTopic ? (
                      /* ── Message hors-sujet ── */
                      <div style={{
                        display:'flex',alignItems:'flex-start',gap:10,
                        padding:'12px 14px',
                        background:'#fffbeb',border:'1px solid #fde68a',
                        borderRadius:10,color:'#92400e',fontSize:'0.9375rem',lineHeight:1.6,
                      }}>
                        <span style={{fontSize:18,flexShrink:0,marginTop:1}}>⚠️</span>
                        <span>{message.text}</span>
                      </div>
                    ) : (
                      /* ── Réponse complète ── */
                      <MarkdownMessage content={message.text || ''} />
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

      {/* Chat Input */}
      <div className="bg-white/80 backdrop-blur-sm border-t border-gray-200 px-8 py-6">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <button className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-700 rounded-full flex items-center justify-center hover:scale-110 transition-transform">
            <span className="text-white text-xl">📎</span>
          </button>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Posez votre question agricole..."
            className="flex-1 px-6 py-3 bg-white/70 backdrop-blur-sm rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800 placeholder-gray-400"
          />
          <button
            onClick={handleSendMessage}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2 font-medium"
          >
            Envoyer
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
    <div className="flex-1 overflow-y-auto">
      <div className="bg-white/80 backdrop-blur-sm shadow-sm px-8 py-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-gray-800">Tableau de Bord Agricole</h2>
            <p className="text-gray-500 mt-1">Vue d'ensemble de l'agriculture à Madagascar - Mise à jour en temps réel</p>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl">
            <div className="text-xs opacity-90">Saison Actuelle</div>
            <div className="text-lg font-bold">Été Austral 2026</div>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                  {stat.icon}
                </div>
                <span className="text-sm font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">{stat.change}</span>
              </div>
              <p className="text-gray-500 text-sm mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</p>
              <p className="text-xs text-gray-400">{stat.subtext}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
          <div className="lg:col-span-4 bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Carte de Madagascar</h3>
              <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Cliquez sur une région pour les détails</div>
            </div>
            <div
              ref={mapRef}
              className="w-full rounded-xl overflow-hidden shadow-lg border border-gray-300"
              style={{ zIndex: 1, height: '720px' }}
            ></div>
          </div>

          {/* Panel météo temps réel */}
          <div className="lg:col-span-1 bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200 overflow-hidden shadow-sm flex flex-col" style={{ minHeight: '720px' }}>
            {!selectedCity ? (
              /* Invite de sélection */
              <div className="flex-1 flex flex-col items-center justify-center text-center px-6 gap-5">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-3xl flex items-center justify-center text-4xl shadow-inner">
                  🗺️
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Météo en temps réel</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    Cliquez sur une région de la carte pour afficher sa météo en direct
                  </p>
                </div>
                <div className="w-full border-t border-gray-100 pt-4">
                  <p className="text-xs text-gray-300">Source : Open-Meteo • Sans clé API</p>
                </div>
              </div>
            ) : weatherLoading ? (
              /* Chargement */
              <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
                <p className="text-sm text-gray-400">Récupération météo…</p>
                <p className="text-xs text-gray-300">{selectedCity.name}</p>
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
                <div className="grid grid-cols-2 gap-2 p-4 border-b border-gray-100 flex-shrink-0">
                  {[
                    { icon: '🌡️', label: 'Ressenti',  value: `${Math.round(weather.current.apparent_temperature)}°C` },
                    { icon: '💧', label: 'Humidité',  value: `${weather.current.relative_humidity_2m}%`            },
                    { icon: '💨', label: 'Vent',       value: `${Math.round(weather.current.wind_speed_10m)} km/h`  },
                    { icon: '🌧️', label: 'Précip.',   value: `${weather.current.precipitation} mm`                 },
                  ].map((d, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-2.5 text-center">
                      <div className="text-xl mb-0.5">{d.icon}</div>
                      <div className="text-sm font-bold text-gray-800">{d.value}</div>
                      <div className="text-xs text-gray-400">{d.label}</div>
                    </div>
                  ))}
                </div>

                {/* Prévisions 5 jours */}
                <div className="p-4 flex-1">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Prévisions 5 jours</p>
                  <div className="space-y-1">
                    {weather.daily.time.map((date, i) => {
                      const info = wmoInfo(weather.daily.weather_code[i]);
                      const dayName = new Date(date + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'short' });
                      return (
                        <div key={i} className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-gray-50 transition-colors">
                          <span className="text-sm font-medium text-gray-600 w-10 capitalize">{dayName}</span>
                          <span className="text-xl mx-1">{info.icon}</span>
                          <span className="text-xs text-blue-500 w-10 text-center">
                            💧{weather.daily.precipitation_probability_max[i]}%
                          </span>
                          <div className="text-right">
                            <span className="text-sm font-bold text-gray-800">
                              {Math.round(weather.daily.temperature_2m_max[i])}°
                            </span>
                            <span className="text-xs text-gray-400 ml-1">
                              {Math.round(weather.daily.temperature_2m_min[i])}°
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Pied de page */}
                <div className="px-4 py-3 border-t border-gray-100 flex-shrink-0">
                  <p className="text-xs text-gray-300 text-center">
                    Open-Meteo · Mis à jour à l'instant
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center p-6 text-sm text-red-400">
                Impossible de charger la météo.
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Production par Région</h3>
            <div className="space-y-3">
              {regions.map((region, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 hover:shadow-md transition-all cursor-pointer border border-green-100"
                  onMouseEnter={() => setSelectedRegion(region.id)}
                  onMouseLeave={() => setSelectedRegion(null)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full shadow-md" style={{ backgroundColor: region.color }}></div>
                    <div>
                      <span className="font-semibold text-gray-800">{region.name}</span>
                      <p className="text-xs text-gray-500 mt-0.5">{region.crop}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{region.farmers} agriculteurs</p>
                      <p className="text-xs text-gray-400">{region.area}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-28 h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${region.production}%`, backgroundColor: region.color }}></div>
                      </div>
                      <span className="text-sm font-bold text-gray-700 w-10">{region.production}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Performance des Cultures</h3>
            <div className="space-y-4">
              {[
                { name: "Riz Paddy", yield: "4.2T/ha", status: "Excellent", trend: "+12%", icon: "🌾", color: "from-green-400 to-emerald-500" },
                { name: "Vanille", yield: "2.8kg/ha", status: "Très Bon", trend: "+18%", icon: "🌿", color: "from-emerald-400 to-lime-500" },
                { name: "Café Arabica", yield: "1.5T/ha", status: "Bon", trend: "+8%", icon: "☕", color: "from-lime-400 to-green-500" },
                { name: "Girofle", yield: "850kg/ha", status: "Excellent", trend: "+15%", icon: "🌸", color: "from-green-500 to-emerald-600" },
                { name: "Cacao", yield: "1.2T/ha", status: "Bon", trend: "+10%", icon: "🍫", color: "from-emerald-500 to-lime-600" }
              ].map((crop, index) => (
                <div key={index} className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 bg-gradient-to-br ${crop.color} rounded-xl flex items-center justify-center text-2xl shadow-md`}>
                        {crop.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">{crop.name}</h4>
                        <p className="text-xs text-gray-500">Rendement: {crop.yield}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">{crop.trend}</span>
                      <p className="text-xs text-gray-500 mt-1">{crop.status}</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className={`bg-gradient-to-r ${crop.color} h-2 rounded-full`} style={{ width: `${70 + index * 5}%` }}></div>
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
            <div className="mt-6 bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              {/* En-tête */}
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                    <Users size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Utilisateurs inscrits</h3>
                    <p className="text-xs text-gray-400">
                      {userList.length} compte{userList.length > 1 ? 's' : ''} — {userList.filter(u => u.is_staff).length} admin{userList.filter(u => u.is_staff).length > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher nom ou email…"
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                    className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white w-56"
                  />
                </div>
              </div>

              {/* Tableau */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <th className="text-left px-6 py-3">Utilisateur</th>
                      <th className="text-left px-6 py-3">Email</th>
                      <th className="text-left px-6 py-3">Rôle</th>
                      <th className="text-left px-6 py-3">Statut</th>
                      <th className="text-left px-6 py-3">Inscrit le</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filtered.length === 0
                      ? <tr><td colSpan={5} className="text-center py-10 text-gray-400 text-sm">Aucun résultat.</td></tr>
                      : filtered.map(u => (
                        <tr key={u.id} className="hover:bg-violet-50/40 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <UserAvatar name={u.name} />
                              <span className="font-semibold text-gray-800">{u.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>
                          <td className="px-6 py-4">
                            {u.is_staff
                              ? <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-100 text-violet-700"><Shield size={11} /> Admin</span>
                              : <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700"><User size={11} /> Utilisateur</span>}
                          </td>
                          <td className="px-6 py-4">
                            {u.is_active
                              ? <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> Actif</span>
                              : <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500"><span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" /> Inactif</span>}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">{fmt(u.created_at)}</td>
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