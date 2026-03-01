import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, saveTokens } from '../api/auth';

export default function FuturisticAgriLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState([]);

  // Initialize particles
  useEffect(() => {
    const newParticles = Array.from({ length: 40 }, (_, i) => ({
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

  // Testimonial rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % 3);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authAPI.login({ email, password });
      saveTokens(res.data.access, res.data.refresh);
      navigate('/');
    } catch (err) {
      if (!err.response) {
        setError("Impossible de contacter le serveur. Vérifiez que le backend est démarré.");
      } else {
        const data = err.response.data;
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          const messages = Object.values(data).flat().map(String).join(' ');
          setError(messages || 'Email ou mot de passe incorrect.');
        } else {
          setError('Email ou mot de passe incorrect.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const testimonials = [
    {
      text: "Les prévisions de cultures basées sur l'IA ont augmenté notre rendement de 47% tout en réduisant la consommation d'eau de 35%. Cette plateforme est l'avenir de l'agriculture.",
      name: "Dr. Elena Martinez",
      role: "Agronome en chef • TerraVerde Farms",
      initial: "EM",
      metric: "+47% Rendement"
    },
    {
      text: "La surveillance par satellite et l'analyse des sols en temps réel ont transformé notre exploitation. Nous prenons maintenant des décisions basées sur les données instantanément.",
      name: "Marcus Chen",
      role: "Directeur des opérations • GreenHorizon",
      initial: "MC",
      metric: "2K Hectares"
    },
    {
      text: "Les analyses prédictives nous ont sauvés d'une mauvaise récolte lors de conditions météo imprévisibles. L'agriculture intelligente n'est plus une option, c'est une nécessité.",
      name: "Amara Okafor",
      role: "Responsable Agriculture Durable • BioFields",
      initial: "AO",
      metric: "98% Précision"
    }
  ];

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
        {/* Left Panel - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative">
          {/* Glow Effect Background */}
          <div 
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-[120px] animate-pulse-glow"
            style={{
              transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)`,
            }}
          />

          {/* Glass Card */}
          <div className="relative w-full max-w-md">
            {/* Gradient Border Animation */}
            <div className="absolute -inset-[1px] bg-gradient-to-r from-green-500/20 via-emerald-500/20 to-green-500/20 rounded-3xl blur-sm animate-gradient-rotate" />
            
            <div className="relative bg-[#0d1612]/40 backdrop-blur-2xl border border-green-500/10 rounded-3xl p-8 md:p-10 shadow-2xl shadow-green-500/5">
              {/* Logo Section */}
              <div className="mb-8 animate-fade-in-down">
                <div className="flex items-center gap-3 mb-2">
                  <div className="relative w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/30 animate-float-slow">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <div className="absolute inset-0 bg-green-400/20 rounded-2xl animate-ping-slow" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent font-['Syne',serif]">
                      Grok App
                    </h1>
                    <p className="text-xs text-green-400/60 tracking-wider">PLATEFORME AGRICOLE IA</p>
                  </div>
                </div>
              </div>

              {/* Texte de bienvenue */}
              <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 font-['Syne',serif]">
                  Bon Retour
                </h2>
                <p className="text-green-400/60 text-sm">
                  Accédez à votre tableau de bord agricole intelligent
                </p>
              </div>

              {/* Error message */}
              {error && (
                <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                {/* Email Input */}
                <div className="group">
                  <label className="block text-green-400/80 text-xs font-semibold mb-2 tracking-wide">
                    ADRESSE EMAIL
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="votre@email.com"
                      required
                      className="w-full px-4 py-4 bg-green-950/10 border border-green-500/20 rounded-xl text-white placeholder-green-400/30 text-sm focus:outline-none focus:border-green-500/50 focus:bg-green-950/20 transition-all duration-300 backdrop-blur-sm group-hover:border-green-500/30"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/5 to-green-500/0 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
                  </div>
                </div>

                {/* Password Input */}
                <div className="group">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-green-400/80 text-xs font-semibold tracking-wide">
                      MOT DE PASSE
                    </label>
                    <button
                      type="button"
                      className="text-green-400/60 hover:text-green-400 text-xs font-medium transition-colors"
                    >
                      Oublié ?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••"
                      required
                      className="w-full px-4 py-4 pr-12 bg-green-950/10 border border-green-500/20 rounded-xl text-white placeholder-green-400/30 text-sm focus:outline-none focus:border-green-500/50 focus:bg-green-950/20 transition-all duration-300 backdrop-blur-sm group-hover:border-green-500/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-green-400/40 hover:text-green-400 transition-colors"
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/5 to-green-500/0 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="relative w-full py-4 mt-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl overflow-hidden group shadow-lg shadow-green-500/20 hover:shadow-green-500/40 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? 'Connexion...' : 'Accéder au Dashboard'}
                    {!loading && (
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    )}
                  </span>
                  <div className="absolute inset-0 border-2 border-green-400/50 rounded-xl animate-pulse-border" />
                </button>

              </form>

              {/* Lien inscription */}
              <p className="text-center mt-8 text-green-400/50 text-sm">
                Nouveau sur Grop App?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="text-green-400 hover:text-green-300 font-semibold transition-colors"
                >
                  Créer un compte
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel - Showcase */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative">
          {/* Parallax Glow */}
          <div 
            className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[150px]"
            style={{
              transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
            }}
          />

          <div className="relative w-full max-w-xl animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { label: 'Fermes Actives', value: '2 847', icon: '🌾', trend: '+23%' },
                { label: 'Rendement', value: '+47%', icon: '📈', trend: 'An/An' },
                { label: 'Précision IA', value: '98,4%', icon: '🎯', trend: 'Temps réel' },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="bg-green-950/20 backdrop-blur-xl border border-green-500/10 rounded-2xl p-4 hover:border-green-500/30 transition-all duration-300 group"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{stat.icon}</div>
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-xs text-green-400/60">{stat.label}</div>
                  <div className="text-xs text-emerald-400 mt-1">{stat.trend}</div>
                </div>
              ))}
            </div>

            {/* Main Testimonial Card */}
            <div className="relative">
              <div className="absolute -inset-[1px] bg-gradient-to-br from-green-500/30 via-emerald-500/30 to-green-500/30 rounded-3xl blur-md" />
              <div className="relative bg-[#0d1612]/60 backdrop-blur-2xl border border-green-500/20 rounded-3xl p-8 shadow-2xl">
                {/* Decorative Corner */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-transparent rounded-3xl blur-2xl" />
                
                {/* Metric Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full mb-6">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-green-400 text-xs font-bold tracking-wider">
                    {testimonials[currentTestimonial].metric}
                  </span>
                </div>

                <p className="text-lg leading-relaxed text-green-50/90 mb-8 font-light">
                  "{testimonials[currentTestimonial].text}"
                </p>

                <div className="flex items-center gap-4">
                  <div className="relative w-14 h-14">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl animate-pulse-slow" />
                    <div className="relative w-full h-full bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-green-500/30">
                      {testimonials[currentTestimonial].initial}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">
                      {testimonials[currentTestimonial].name}
                    </h4>
                    <p className="text-green-400/70 text-sm">
                      {testimonials[currentTestimonial].role}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Dots */}
            <div className="flex justify-center gap-2 mt-8">
              {[0, 1, 2].map((i) => (
                <button
                  key={i}
                  onClick={() => setCurrentTestimonial(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    currentTestimonial === i
                      ? 'w-8 bg-gradient-to-r from-green-500 to-emerald-500'
                      : 'w-1.5 bg-green-500/20 hover:bg-green-500/40'
                  }`}
                />
              ))}
            </div>

            {/* Floating Tech Elements */}
            <div className="absolute -top-10 -right-10 w-20 h-20 border border-green-500/20 rounded-2xl rotate-12 animate-float-slow" />
            <div className="absolute -bottom-10 -left-10 w-16 h-16 border border-emerald-500/20 rounded-xl -rotate-12 animate-float-slower" />
          </div>
        </div>
      </div>

      <style jsx>{`
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

        @keyframes float-slow {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }

        @keyframes float-slower {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-5deg); }
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

        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }

        .animate-float-slower {
          animation: float-slower 8s ease-in-out infinite;
        }

        .animate-fade-in-down {
          animation: fade-in-down 0.8s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }

        .animate-fade-in {
          animation: fade-in 0.4s ease-out;
        }

        .animate-ping-slow {
          animation: ping-slow 3s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
}