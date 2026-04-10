import React, { useState, useEffect, useRef } from 'react';
import { Send, Home, MessageSquare, Settings, User, Users, TrendingUp, Sprout, Leaf, CloudRain, Save, Lock, Eye, EyeOff, CheckCircle, AlertCircle, Search, Shield, UserCheck } from 'lucide-react';
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from "react-router-dom";
import Login from "./composant/login";
import Register from "./composant/register";
import cartographie from "./composant/cartographie";
import { getAccessToken, clearTokens, authAPI } from "./api/auth";

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

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      setMessages([...messages, { text: inputValue, sender: 'user' }]);
      setInputValue('');

      setTimeout(() => {
        setMessages(prev => [...prev, {
          text: "Merci pour votre message! Comment puis-je vous aider avec vos activités agricoles aujourd'hui?",
          sender: 'ai'
        }]);
      }, 1000);
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
          ? <ChatPage messages={messages} inputValue={inputValue} setInputValue={setInputValue} handleSendMessage={handleSendMessage} />
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

function ChatPage({ messages, inputValue, setInputValue, handleSendMessage }) {
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
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-lg px-6 py-3 rounded-2xl ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                      : 'bg-white/70 backdrop-blur-sm text-gray-800 border border-gray-200'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
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
          'SAVA':              { name: 'Sambava',            lat: -14.2667, lon: 50.1667 },
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
          'Vatovavy':          { name: 'Manakara',             lat: -22.1500, lon: 48.0167 },
          'Fitovinany':        { name: 'Farafangana',           lat: -22.8167, lon: 47.8333 },
          'Ihorombe':          { name: 'Ihosy',                lat: -22.4000, lon: 46.1167 },
          'Atsimo-Atsinanana': { name: 'Vangaindrano',         lat: -23.3500, lon: 47.6000 },
          'Atsimo-Andrefana':  { name: 'Toliara',              lat: -23.3500, lon: 43.6667 },
          'Androy':            { name: 'Ambovombe',             lat: -25.1667, lon: 46.0833 },
          'Anosy':             { name: 'Tôlanaro',             lat: -25.0333, lon: 46.9833 },
        };

        // 22 régions de Madagascar avec couleurs distinctes
        const regions = [
          { name: 'Diana',              color: '#3b82f6', data: { production: 88, crop: 'Cacao, Vanille',          farmers: '45 230',  area: '19 266 km²' },
            coords: [[-11.95, 48.85], [-12.00, 50.48], [-13.50, 50.48], [-13.88, 49.77], [-13.50, 49.05], [-12.50, 48.85]] },
          { name: 'SAVA',               color: '#ef4444', data: { production: 96, crop: 'Vanille, Girofle',        farmers: '67 890',  area: '25 518 km²' },
            coords: [[-13.50, 49.05], [-13.88, 49.77], [-15.32, 50.48], [-15.72, 50.00], [-15.50, 49.50], [-14.50, 49.20]] },
          { name: 'Analanjirofo',        color: '#f43f5e', data: { production: 82, crop: 'Girofle, Litchi',         farmers: '55 000',  area: '21 930 km²' },
            coords: [[-15.32, 49.20], [-15.72, 50.00], [-17.00, 49.80], [-17.50, 49.30], [-16.50, 48.50]] },
          { name: 'Sofia',               color: '#f97316', data: { production: 78, crop: 'Riz, Coton',              farmers: '48 000',  area: '50 875 km²' },
            coords: [[-13.50, 47.00], [-13.50, 48.85], [-14.50, 49.20], [-15.50, 48.50], [-15.80, 47.50], [-15.00, 46.50]] },
          { name: 'Boeny',               color: '#8b5cf6', data: { production: 75, crop: 'Riz, Canne à sucre',      farmers: '38 000',  area: '31 046 km²' },
            coords: [[-15.00, 44.80], [-15.00, 47.00], [-16.50, 47.00], [-17.20, 46.00], [-16.50, 44.50]] },
          { name: 'Betsiboka',           color: '#06b6d4', data: { production: 70, crop: 'Riz, Maïs',               farmers: '28 000',  area: '29 945 km²' },
            coords: [[-15.00, 46.50], [-15.00, 48.50], [-16.50, 47.00]] },
          { name: 'Melaky',              color: '#ec4899', data: { production: 65, crop: 'Maïs, Manioc',            farmers: '22 000',  area: '38 852 km²' },
            coords: [[-16.50, 43.50], [-16.50, 45.00], [-18.00, 45.50], [-18.50, 44.20], [-17.50, 43.20]] },
          { name: 'Bongolava',           color: '#84cc16', data: { production: 73, crop: 'Riz, Arachide',           farmers: '32 000',  area: '16 688 km²' },
            coords: [[-16.50, 46.00], [-17.00, 47.50], [-18.50, 47.50], [-18.50, 46.00], [-17.50, 45.50]] },
          { name: 'Itasy',               color: '#b45309', data: { production: 82, crop: 'Riz, Légumes',            farmers: '30 000',  area: '6 658 km²'  },
            coords: [[-18.80, 45.80], [-18.80, 46.70], [-19.20, 46.70], [-19.20, 45.80]] },
          { name: 'Analamanga',          color: '#10b981', data: { production: 91, crop: 'Riz, Légumes',            farmers: '123 450', area: '16 911 km²' },
            coords: [[-18.20, 46.70], [-18.20, 48.00], [-19.50, 48.00], [-19.50, 46.70], [-18.80, 46.20]] },
          { name: 'Alaotra-Mangoro',     color: '#eab308', data: { production: 87, crop: 'Riz, Café',               farmers: '60 000',  area: '31 948 km²' },
            coords: [[-16.80, 47.80], [-17.00, 49.30], [-19.00, 49.00], [-19.20, 47.90], [-17.00, 47.50]] },
          { name: 'Atsinanana',          color: '#6366f1', data: { production: 80, crop: 'Girofle, Café',           farmers: '68 000',  area: '21 934 km²' },
            coords: [[-17.00, 48.80], [-17.50, 49.80], [-19.00, 49.00], [-19.00, 48.50], [-18.00, 48.00]] },
          { name: 'Vakinankaratra',      color: '#14b8a6', data: { production: 89, crop: 'Riz, Pomme de terre',     farmers: '98 760',  area: '16 599 km²' },
            coords: [[-19.20, 46.50], [-19.30, 47.80], [-20.80, 47.80], [-21.00, 47.00], [-20.50, 46.00]] },
          { name: "Amoron'i Mania",      color: '#2563eb', data: { production: 78, crop: 'Café, Riz',               farmers: '40 000',  area: '16 548 km²' },
            coords: [[-20.50, 46.50], [-20.50, 47.80], [-21.50, 47.30], [-21.50, 46.50], [-21.00, 46.00]] },
          { name: 'Menabe',              color: '#d97706', data: { production: 76, crop: 'Riz, Coton',              farmers: '40 000',  area: '46 121 km²' },
            coords: [[-18.50, 43.80], [-18.50, 45.50], [-21.00, 45.20], [-21.00, 43.80]] },
          { name: 'Haute Matsiatra',     color: '#7c3aed', data: { production: 85, crop: 'Riz, Maïs, Manioc',      farmers: '87 650',  area: '21 080 km²' },
            coords: [[-20.30, 46.50], [-20.50, 47.80], [-21.80, 47.30], [-22.00, 46.50], [-21.30, 46.20]] },
          { name: 'Vatovavy',            color: '#0d9488', data: { production: 77, crop: 'Girofle, Café',           farmers: '45 000',  area: '19 605 km²' },
            coords: [[-20.50, 47.80], [-21.50, 49.00], [-22.50, 48.00], [-22.50, 47.00], [-21.50, 47.30]] },
          { name: 'Fitovinany',          color: '#dc2626', data: { production: 72, crop: 'Riz, Girofle',            farmers: '35 000',  area: '18 198 km²' },
            coords: [[-22.50, 47.00], [-23.00, 48.00], [-24.00, 47.50], [-24.00, 47.00], [-23.50, 46.50]] },
          { name: 'Ihorombe',            color: '#059669', data: { production: 65, crop: 'Maïs, Élevage',           farmers: '20 000',  area: '26 418 km²' },
            coords: [[-21.80, 44.80], [-21.80, 46.50], [-23.50, 46.50], [-23.50, 44.50], [-22.50, 44.00]] },
          { name: 'Atsimo-Atsinanana',   color: '#0891b2', data: { production: 70, crop: 'Riz, Girofle',            farmers: '35 000',  area: '18 198 km²' },
            coords: [[-22.50, 47.00], [-23.50, 47.50], [-24.00, 47.00], [-23.50, 46.50]] },
          { name: 'Atsimo-Andrefana',    color: '#65a30d', data: { production: 72, crop: 'Maïs, Haricot',           farmers: '54 320',  area: '66 236 km²' },
            coords: [[-22.00, 43.50], [-22.50, 45.50], [-24.00, 45.50], [-24.50, 43.50], [-23.50, 43.00]] },
          { name: 'Androy',              color: '#f59e0b', data: { production: 60, crop: 'Manioc, Maïs',            farmers: '35 000',  area: '19 317 km²' },
            coords: [[-24.00, 45.00], [-24.50, 46.50], [-25.60, 46.50], [-25.60, 44.50], [-25.00, 43.50]] },
          { name: 'Anosy',               color: '#a21caf', data: { production: 68, crop: 'Sisal, Maïs',             farmers: '30 000',  area: '25 731 km²' },
            coords: [[-23.50, 46.50], [-24.00, 47.50], [-25.00, 47.50], [-25.50, 46.50], [-24.50, 45.80]] },
        ];

        // ── Frontières officielles via geoBoundaries (GitHub raw, CORS activé) ──
        const norm = s => (s || '')
          .toLowerCase()
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
          .replace(/['\u2019\u2018\-]/g, '')
          .replace(/\s+/g, ' ').trim();

        // Index rapide : nom normalisé → données région
        const regionByNorm = {};
        regions.forEach(r => { regionByNorm[norm(r.name)] = r; });

        const renderLayer = (geoJson) => {
          const onEach = (feature, layer) => {
            const key   = norm(feature.properties.shapeName || '');
            const region = regionByNorm[key] || {
              name: feature.properties.shapeName || '—',
              color: '#94a3b8',
              data: { crop: '—', area: '—', farmers: '—', production: 0 },
            };
            const color = region.color;

            layer.bindPopup(`
              <div style="font-family:system-ui;padding:10px;min-width:210px;">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
                  <div style="width:12px;height:12px;border-radius:50%;background:${color};flex-shrink:0;"></div>
                  <h3 style="margin:0;font-size:15px;font-weight:700;color:#1f2937;">${region.name}</h3>
                </div>
                <p style="margin:3px 0;font-size:12px;color:#374151;"><strong>🌾</strong> ${region.data.crop}</p>
                <p style="margin:3px 0;font-size:12px;color:#374151;"><strong>📍</strong> ${region.data.area}</p>
                <p style="margin:3px 0;font-size:12px;color:#374151;"><strong>👨‍🌾</strong> ${region.data.farmers} agriculteurs</p>
                <div style="margin-top:8px;padding-top:8px;border-top:1px solid #e5e7eb;">
                  <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                    <span style="font-size:11px;color:#6b7280;">Production</span>
                    <span style="font-size:13px;font-weight:700;color:${color};">${region.data.production}%</span>
                  </div>
                  <div style="background:#e5e7eb;border-radius:9999px;height:6px;overflow:hidden;">
                    <div style="background:${color};height:100%;width:${region.data.production}%;border-radius:9999px;"></div>
                  </div>
                </div>
              </div>
            `);
            layer.on('mouseover', function () { this.setStyle({ fillOpacity: 0.5, weight: 2.5 }); });
            layer.on('mouseout',  function () { this.setStyle({ fillOpacity: 0.22, weight: 1.2 }); });
            const city = regionCities[region.name];
            if (city) {
              layer.on('click', () =>
                setSelectedCity({ ...city, regionName: region.name, color })
              );
            }
          };

          if (geoJson) {
            // ✅ Vraies frontières officielles
            window.L.geoJSON(geoJson, {
              style: feature => {
                const r = regionByNorm[norm(feature.properties.shapeName || '')] || {};
                const c = r.color || '#94a3b8';
                return { color: c, fillColor: c, fillOpacity: 0.22, weight: 1.2 };
              },
              onEachFeature: onEach,
            }).addTo(map);
          } else {
            // ⚠️ Secours : polygones approchés si le fetch échoue
            regions.forEach(region => {
              const layer = window.L.polygon(
                region.coords.map(([lat, lng]) => [lat, lng]),
                { color: region.color, fillColor: region.color, fillOpacity: 0.22, weight: 1.2 }
              ).addTo(map);
              onEach({ properties: { shapeName: region.name } }, layer);
            });
          }
        };

        // Tentative de chargement des frontières réelles
        try {
          const resp = await fetch(
            'https://raw.githubusercontent.com/wmgeolab/geoBoundaries/main/releaseData/gbOpen/MDG/ADM1/geoBoundaries-MDG-ADM1.geojson'
          );
          if (!resp.ok) throw new Error('HTTP ' + resp.status);
          renderLayer(await resp.json());
        } catch (e) {
          console.warn('geoBoundaries fetch échoué, polygones de secours.', e.message);
          renderLayer(null);
        }

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
              ${regions.map(r => `
                <div style="display:flex;align-items:center;gap:4px;">
                  <div style="width:9px;height:9px;flex-shrink:0;border-radius:2px;background:${r.color};opacity:0.85;"></div>
                  <span style="font-size:9.5px;color:#4b5563;white-space:nowrap;">${r.name}</span>
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