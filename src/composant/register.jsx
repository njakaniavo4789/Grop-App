import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, saveTokens } from '../api/auth';

export default function AgricultureAISignup() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState([]);

  // Initialize particles
  useEffect(() => {
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.5 + 0.3,
    }));
    setParticles(newParticles);
  }, []);

  // Animate particles
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles((prev) =>
        prev.map((particle) => ({
          ...particle,
          x: (particle.x + particle.speedX + 100) % 100,
          y: (particle.y + particle.speedY + 100) % 100,
        }))
      );
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Mouse parallax
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 30;
      const y = (e.clientY / window.innerHeight - 0.5) * 30;
      setMousePosition({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (!agreedToTerms) {
      setError("Vous devez accepter les conditions d'utilisation.");
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.register({
        name,
        email,
        password,
        confirm_password: confirmPassword,
      });
      saveTokens(res.data.access, res.data.refresh);
      navigate('/');
    } catch (err) {
      if (!err.response) {
        setError("Impossible de contacter le serveur. Vérifiez que le backend est démarré.");
      } else {
        const data = err.response.data;
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          const messages = Object.entries(data).map(([field, msgs]) => {
            const list = Array.isArray(msgs) ? msgs.join(' ') : String(msgs);
            return `${field} : ${list}`;
          });
          setError(messages.join('\n'));
        } else {
          setError("Erreur lors de l'inscription. Veuillez réessayer.");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0f0d] font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Animated Gradient Background */}
      <div className="fixed inset-0 opacity-60">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1f14] via-[#0d1411] to-[#0a1520] animate-gradient-shift" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(34,197,94,0.08)_0%,transparent_50%)] animate-pulse-slow" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(22,163,74,0.06)_0%,transparent_50%)] animate-pulse-slower" />
      </div>

      {/* Noise Texture Overlay */}
      <div 
        className="fixed inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Floating Particles */}
      <div className="fixed inset-0 pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-1 h-1 rounded-full bg-green-400/40 blur-[1px]"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              opacity: particle.opacity,
              boxShadow: '0 0 10px rgba(34, 197, 94, 0.5)',
            }}
          />
        ))}
      </div>

      {/* Organic Field Pattern Background */}
      <div 
        className="fixed inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,50 Q25,30 50,50 T100,50' stroke='%2322c55e' stroke-width='0.5' fill='none'/%3E%3Cpath d='M0,60 Q25,80 50,60 T100,60' stroke='%2316a34a' stroke-width='0.5' fill='none'/%3E%3C/svg%3E")`,
          backgroundSize: '100px 100px',
        }}
      />

      {/* Main Container */}
      <div className="relative z-10 flex min-h-screen">
        {/* Left Side - Signup Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 md:p-6 relative">
          {/* Glow Effect Background */}
          <div 
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-[120px] animate-pulse-glow"
            style={{
              transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)`,
            }}
          />

          {/* Glass Card */}
          <div className="relative w-full max-w-lg">
            {/* Gradient Border Animation */}
            <div className="absolute -inset-[1px] bg-gradient-to-r from-green-500/20 via-emerald-500/20 to-green-500/20 rounded-3xl blur-sm animate-gradient-rotate" />
            
            <div className="relative bg-[#0d1612]/40 backdrop-blur-2xl border border-green-500/10 rounded-3xl p-5 md:p-7 shadow-2xl shadow-green-500/5">
              {/* Logo Section */}
              <div className="mb-3 animate-fade-in-down">
                <div className="flex items-center gap-2.5 mb-1">
                  <div className="relative w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30 animate-float-slow overflow-hidden">
                    <img src="/logo.png" alt="CropGPT" className="w-full h-full object-cover rounded-xl" />
                    <div className="absolute inset-0 bg-green-400/20 rounded-xl animate-ping-slow" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent font-['Syne',serif]">
                      CropGPT
                    </h1>
                    <p className="text-[10px] text-green-400/60 tracking-wider">SMART FARMING PLATFORM</p>
                  </div>
                </div>
              </div>

              {/* Welcome Text */}
              <div className="mb-3 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <h2 className="text-xl md:text-2xl font-bold text-white mb-1 font-['Syne',serif]">
                  Créer un Compte
                </h2>
                <p className="text-green-400/60 text-xs">
                  Rejoignez la révolution de l'agriculture intelligente
                </p>
              </div>

              {/* Error message */}
              {error && (
                <div className="mb-3 px-4 py-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs whitespace-pre-line">
                  {error}
                </div>
              )}

              {/* Signup Form */}
              <form onSubmit={handleSubmit} className="space-y-2.5 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                {/* Name Input */}
                <div className="group">
                  <label className="block text-green-400/80 text-[10px] font-semibold mb-1 tracking-wide">
                    NOM COMPLET
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jean Dupont"
                      required
                      className="w-full px-3.5 py-2.5 bg-green-950/10 border border-green-500/20 rounded-xl text-white placeholder-green-400/30 text-sm focus:outline-none focus:border-green-500/50 focus:bg-green-950/20 transition-all duration-300 backdrop-blur-sm group-hover:border-green-500/30"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/5 to-green-500/0 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
                  </div>
                </div>

                {/* Email Input */}
                <div className="group">
                  <label className="block text-green-400/80 text-[10px] font-semibold mb-1 tracking-wide">
                    ADRESSE EMAIL
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="votre@email.com"
                      required
                      className="w-full px-3.5 py-2.5 bg-green-950/10 border border-green-500/20 rounded-xl text-white placeholder-green-400/30 text-sm focus:outline-none focus:border-green-500/50 focus:bg-green-950/20 transition-all duration-300 backdrop-blur-sm group-hover:border-green-500/30"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/5 to-green-500/0 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
                  </div>
                </div>

                {/* Password Inputs in Grid */}
                <div className="grid grid-cols-2 gap-2.5">
                  {/* Password Input */}
                  <div className="group">
                    <label className="block text-green-400/80 text-[10px] font-semibold mb-1 tracking-wide">
                      MOT DE PASSE
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full px-3.5 py-2.5 pr-9 bg-green-950/10 border border-green-500/20 rounded-xl text-white placeholder-green-400/30 text-sm focus:outline-none focus:border-green-500/50 focus:bg-green-950/20 transition-all duration-300 backdrop-blur-sm group-hover:border-green-500/30"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-green-400/40 hover:text-green-400 transition-colors"
                      >
                        {showPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/5 to-green-500/0 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
                    </div>
                  </div>

                  {/* Confirm Password Input */}
                  <div className="group">
                    <label className="block text-green-400/80 text-[10px] font-semibold mb-1 tracking-wide">
                      CONFIRMER
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full px-3.5 py-2.5 pr-9 bg-green-950/10 border border-green-500/20 rounded-xl text-white placeholder-green-400/30 text-sm focus:outline-none focus:border-green-500/50 focus:bg-green-950/20 transition-all duration-300 backdrop-blur-sm group-hover:border-green-500/30"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-green-400/40 hover:text-green-400 transition-colors"
                      >
                        {showConfirmPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/5 to-green-500/0 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Terms Checkbox */}
                <div className="flex items-start gap-2.5 pt-0.5">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    required
                    className="mt-0.5 w-4 h-4 rounded border-green-500/30 bg-green-950/20 text-green-500 focus:ring-green-500/50 focus:ring-offset-0 cursor-pointer"
                  />
                  <label htmlFor="terms" className="text-[11px] text-green-400/60 leading-relaxed">
                    J'accepte les{' '}
                    <a href="#" className="text-green-400 hover:text-green-300 font-semibold transition-colors">
                      Conditions
                    </a>{' '}
                    et la{' '}
                    <a href="#" className="text-green-400 hover:text-green-300 font-semibold transition-colors">
                      Politique
                    </a>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="relative w-full py-3 mt-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl overflow-hidden group shadow-lg shadow-green-500/20 hover:shadow-green-500/40 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <span className="relative z-10 flex items-center justify-center gap-2 text-sm">
                    {loading ? 'Création du compte...' : 'Créer mon compte'}
                    {!loading && (
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    )}
                  </span>
                  <div className="absolute inset-0 border-2 border-green-400/50 rounded-xl animate-pulse-border" />
                </button>
              </form>

              {/* Login Link */}
              <p className="text-center mt-3.5 text-green-400/50 text-xs">
                Vous avez déjà un compte?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-green-400 hover:text-green-300 font-semibold transition-colors"
                >
                  Se connecter
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - 3D Illustration */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-8 relative">
          {/* Parallax Glow */}
          <div 
            className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[150px]"
            style={{
              transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
            }}
          />

          <div className="relative w-full max-w-2xl h-[500px] flex items-center justify-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            {/* Decorative Floating Elements */}
            <div className="absolute top-10 left-10 w-20 h-20 border border-green-500/20 rounded-2xl rotate-12 animate-float-slow" />
            <div className="absolute bottom-20 right-10 w-16 h-16 border border-emerald-500/20 rounded-xl -rotate-12 animate-float-slower" />
            <div className="absolute top-1/4 right-20 w-12 h-12 bg-green-500/10 rounded-full animate-pulse-slow" />

            {/* 3D Character */}
            <div className="relative z-10">
              <div className="relative w-72 h-80">
                {/* Character Container */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
                  {/* Legs */}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex gap-5">
                    <div className="w-12 h-24 bg-gradient-to-b from-orange-400 to-orange-500 rounded-full animate-float" 
                         style={{ animationDelay: '0s', boxShadow: '0 10px 30px rgba(251, 146, 60, 0.3)' }}></div>
                    <div className="w-12 h-24 bg-gradient-to-b from-orange-400 to-orange-500 rounded-full animate-float" 
                         style={{ animationDelay: '0.5s', boxShadow: '0 10px 30px rgba(251, 146, 60, 0.3)' }}></div>
                  </div>
                  
                  {/* Shoes */}
                  <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 flex gap-9">
                    <div className="w-18 h-9 bg-gradient-to-r from-pink-400 to-pink-500 rounded-full"
                         style={{ boxShadow: '0 8px 20px rgba(244, 114, 182, 0.4)' }}>
                      <div className="w-full h-2 bg-white/30 rounded-full mt-1.5"></div>
                    </div>
                    <div className="w-18 h-9 bg-gradient-to-r from-pink-400 to-pink-500 rounded-full"
                         style={{ boxShadow: '0 8px 20px rgba(244, 114, 182, 0.4)' }}>
                      <div className="w-full h-2 bg-white/30 rounded-full mt-1.5"></div>
                    </div>
                  </div>
                  
                  {/* Body/Torso */}
                  <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-gradient-to-b from-orange-400 via-orange-500 to-orange-600 rounded-3xl shadow-2xl animate-float"
                       style={{ animationDelay: '0.2s', boxShadow: '0 20px 60px rgba(251, 146, 60, 0.4)' }}>
                    {/* Left Arm */}
                    <div className="absolute top-5 -left-9 w-9 h-20 bg-gradient-to-b from-orange-400 to-orange-500 rounded-full transform rotate-20 animate-wave"
                         style={{ boxShadow: '0 8px 20px rgba(251, 146, 60, 0.3)' }}></div>
                    
                    {/* Right Arm */}
                    <div className="absolute top-5 -right-9 w-9 h-20 bg-gradient-to-b from-orange-400 to-orange-500 rounded-full transform -rotate-20"
                         style={{ boxShadow: '0 8px 20px rgba(251, 146, 60, 0.3)' }}>
                      {/* Phone in hand */}
                      <div className="absolute bottom-2 -right-4 w-7 h-11 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-lg transform rotate-12 animate-pulse-slow border-2 border-green-500/30">
                        <div className="w-full h-1 bg-green-400/50 rounded-full mt-1"></div>
                        <div className="w-3/4 h-0.5 bg-green-400/30 rounded-full mx-auto mt-1"></div>
                        <div className="w-3/4 h-0.5 bg-green-400/30 rounded-full mx-auto mt-1"></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Head */}
                  <div className="absolute bottom-56 left-1/2 transform -translate-x-1/2 w-26 h-30 bg-gradient-to-b from-amber-600 to-amber-700 rounded-full shadow-2xl animate-float" 
                       style={{ animationDelay: '0.3s', boxShadow: '0 15px 40px rgba(217, 119, 6, 0.4)' }}>
                    {/* Hair/Top of head */}
                    <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 w-22 h-18 bg-gradient-to-b from-gray-800 to-gray-900 rounded-t-full"
                         style={{ boxShadow: '0 -5px 15px rgba(0, 0, 0, 0.3)' }}></div>
                    
                    {/* Ponytail */}
                    <div className="absolute top-7 right-0 w-14 h-24 bg-gradient-to-b from-gray-800 to-gray-900 rounded-full transform rotate-45 origin-top"
                         style={{ boxShadow: '5px 5px 20px rgba(0, 0, 0, 0.3)' }}></div>
                    
                    {/* Face details */}
                    <div className="absolute top-11 left-1/2 transform -translate-x-1/2 flex gap-2.5">
                      <div className="w-1.5 h-1.5 bg-gray-800 rounded-full"></div>
                      <div className="w-1.5 h-1.5 bg-gray-800 rounded-full"></div>
                    </div>
                    <div className="absolute top-14 left-1/2 transform -translate-x-1/2 w-3 h-1.5 bg-gray-800/50 rounded-full"></div>
                  </div>
                </div>

                {/* Floating Plant/Tech Icons Around Character */}
                <div className="absolute top-20 left-4 animate-float-slow" style={{ animationDelay: '0.5s' }}>
                  <div className="w-16 h-16 bg-green-500/10 backdrop-blur-sm border border-green-500/20 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/20">
                    <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
                    </svg>
                  </div>
                </div>

                <div className="absolute top-32 right-8 animate-float-slower" style={{ animationDelay: '1s' }}>
                  <div className="w-14 h-14 bg-emerald-500/10 backdrop-blur-sm border border-emerald-500/20 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <svg className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>

                <div className="absolute bottom-32 left-0 animate-float-slow" style={{ animationDelay: '1.5s' }}>
                  <div className="w-12 h-12 bg-green-500/10 backdrop-blur-sm border border-green-500/20 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Text */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-center animate-fade-in" style={{ animationDelay: '1s' }}>
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-500/10 backdrop-blur-xl border border-green-500/20 rounded-full shadow-lg shadow-green-500/10">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-green-300 font-semibold text-sm tracking-wide">Cultivez l'avenir avec l'IA</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Syne:wght@600;700;800&display=swap');

        @keyframes gradient-shift {
          0%, 100% { filter: hue-rotate(0deg); }
          50% { filter: hue-rotate(15deg); }
        }

        @keyframes gradient-rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 0.8; }
        }

        @keyframes pulse-slower {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }

        @keyframes pulse-glow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }

        @keyframes pulse-border {
          0%, 100% { opacity: 0; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.05); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(3deg); }
        }

        @keyframes float-slow {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }

        @keyframes float-slower {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-5deg); }
        }

        @keyframes wave {
          0%, 100% { transform: rotate(20deg); }
          50% { transform: rotate(35deg); }
        }

        @keyframes fade-in-down {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 1; }
          75%, 100% { transform: scale(1.5); opacity: 0; }
        }

        .animate-gradient-shift {
          animation: gradient-shift 15s ease-in-out infinite;
        }

        .animate-gradient-rotate {
          animation: gradient-rotate 8s linear infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        .animate-pulse-slower {
          animation: pulse-slower 6s ease-in-out infinite;
        }

        .animate-pulse-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }

        .animate-pulse-border {
          animation: pulse-border 2s ease-in-out infinite;
        }

        .animate-float {
          animation: float 4s ease-in-out infinite;
        }

        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }

        .animate-float-slower {
          animation: float-slower 8s ease-in-out infinite;
        }

        .animate-wave {
          animation: wave 2s ease-in-out infinite;
        }

        .animate-fade-in-down {
          animation: fade-in-down 0.8s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }

        .animate-ping-slow {
          animation: ping-slow 3s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
}