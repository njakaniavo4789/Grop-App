import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, saveTokens } from '../api/auth';
import { ImageMarquee } from '../components/ui/ImageMarquee';
import { TextScramble } from '../components/ui/TextScramble';

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
  const [scrambleKey, setScrambleKey] = useState(0);

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

  useEffect(() => {
    const interval = setInterval(() => {
      setParticles((prev) =>
        prev.map((p) => ({
          ...p,
          x: (p.x + p.speedX + 100) % 100,
          y: (p.y + p.speedY + 100) % 100,
        }))
      );
    }, 50);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 30,
        y: (e.clientY / window.innerHeight - 0.5) * 30,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setScrambleKey(k => k + 1), 15000);
    return () => clearInterval(interval);
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
      const res = await authAPI.register({ name, email, password, confirm_password: confirmPassword });
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

  const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
  const EyeOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-black font-['Plus_Jakarta_Sans',sans-serif]">

      {/* Layer 0: Marquee background */}
      <div className="fixed inset-0" style={{ zIndex: 0 }}>
        <ImageMarquee speed={30} tileSize={280} />
      </div>

      {/* Layer 2: Green ambient */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 2, opacity: 0.35 }}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(34,197,94,0.12)_0%,transparent_50%)] animate-pulse-slow" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(22,163,74,0.08)_0%,transparent_50%)] animate-pulse-slower" />
      </div>

      {/* Layer 3: Noise */}
      <div className="fixed inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none" style={{ zIndex: 3,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }} />

      {/* Layer 4: Field pattern */}
      <div className="fixed inset-0 opacity-5 pointer-events-none" style={{ zIndex: 4,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,50 Q25,30 50,50 T100,50' stroke='%2322c55e' stroke-width='0.5' fill='none'/%3E%3Cpath d='M0,60 Q25,80 50,60 T100,60' stroke='%2316a34a' stroke-width='0.5' fill='none'/%3E%3C/svg%3E")`,
        backgroundSize: '100px 100px',
      }} />

      {/* Layer 5: Particles */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 5 }}>
        {particles.map((p) => (
          <div key={p.id} className="absolute w-1 h-1 rounded-full bg-green-400/40 blur-[1px]"
            style={{ left: `${p.x}%`, top: `${p.y}%`, opacity: p.opacity, boxShadow: '0 0 10px rgba(34,197,94,0.5)' }} />
        ))}
      </div>

      {/* Main */}
      <div className="relative flex min-h-screen" style={{ zIndex: 10 }}>
        {/* Left panel */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-[120px] animate-pulse-glow"
            style={{ transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)` }} />

          <div className="relative w-full max-w-md">
            <div className="relative bg-[#0d1612]/40 backdrop-blur-2xl border border-green-500/10 rounded-3xl p-8 md:p-12 py-16 md:py-20 shadow-2xl shadow-green-500/5">

              {/* Logo */}
              <div className="mb-8 animate-fade-in-down">
                <div className="flex items-center gap-3 mb-2">
                  <div className="relative w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/30 animate-float-slow overflow-hidden">
                    <img src="/logo.png" alt="CropGPT" className="w-full h-full object-cover rounded-2xl" />
                    <div className="absolute inset-0 bg-green-400/20 rounded-2xl animate-ping-slow" />
                  </div>
                  <div>
                    <TextScramble key={`cropgpt-${scrambleKey}`} as="h1"
                      className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent font-['Syne',serif]"
                      duration={0.9} speed={0.04}>
                      CropGPT
                    </TextScramble>
                    <TextScramble key={`platform-${scrambleKey}`} as="p"
                      className="text-xs text-green-400/60 tracking-wider"
                      duration={1.4} speed={0.04} characterSet="ABCDEFGHIJKLMNOPQRSTUVWXYZ ">
                      PLATEFORME AGRICOLE IA
                    </TextScramble>
                  </div>
                </div>
              </div>

              {/* Welcome */}
              <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <TextScramble key={`title-${scrambleKey}`} as="h2"
                  className="text-3xl md:text-4xl font-bold text-white mb-2 font-['Syne',serif]"
                  duration={1.1} speed={0.045}>
                  Créer un Compte
                </TextScramble>
                <p className="text-green-400/60 text-sm">Rejoignez la révolution de l'agriculture intelligente</p>
              </div>

              {error && (
                <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm whitespace-pre-line">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                {/* Name */}
                <div className="group">
                  <label className="block text-green-400/80 text-xs font-semibold mb-2 tracking-wide">NOM COMPLET</label>
                  <div className="relative">
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jean Dupont" required
                      className="w-full px-4 py-4 bg-green-950/10 border border-green-500/20 rounded-xl text-white placeholder-green-400/30 text-sm focus:outline-none focus:border-green-500/50 focus:bg-green-950/20 transition-all duration-300 backdrop-blur-sm group-hover:border-green-500/30" />
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/5 to-green-500/0 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
                  </div>
                </div>

                {/* Email */}
                <div className="group">
                  <label className="block text-green-400/80 text-xs font-semibold mb-2 tracking-wide">ADRESSE EMAIL</label>
                  <div className="relative">
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre@email.com" required
                      className="w-full px-4 py-4 bg-green-950/10 border border-green-500/20 rounded-xl text-white placeholder-green-400/30 text-sm focus:outline-none focus:border-green-500/50 focus:bg-green-950/20 transition-all duration-300 backdrop-blur-sm group-hover:border-green-500/30" />
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/5 to-green-500/0 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
                  </div>
                </div>

                {/* Password */}
                <div className="group">
                  <label className="block text-green-400/80 text-xs font-semibold mb-2 tracking-wide">MOT DE PASSE</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••••" required
                      className="w-full px-4 py-4 pr-12 bg-green-950/10 border border-green-500/20 rounded-xl text-white placeholder-green-400/30 text-sm focus:outline-none focus:border-green-500/50 focus:bg-green-950/20 transition-all duration-300 backdrop-blur-sm group-hover:border-green-500/30" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-green-400/40 hover:text-green-400 transition-colors">
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="group">
                  <label className="block text-green-400/80 text-xs font-semibold mb-2 tracking-wide">CONFIRMER LE MOT DE PASSE</label>
                  <div className="relative">
                    <input type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••••" required
                      className="w-full px-4 py-4 pr-12 bg-green-950/10 border border-green-500/20 rounded-xl text-white placeholder-green-400/30 text-sm focus:outline-none focus:border-green-500/50 focus:bg-green-950/20 transition-all duration-300 backdrop-blur-sm group-hover:border-green-500/30" />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-green-400/40 hover:text-green-400 transition-colors">
                      {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>

                {/* Terms */}
                <div className="flex items-start gap-3 pt-1">
                  <input type="checkbox" id="terms" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} required
                    className="mt-0.5 w-4 h-4 rounded border-green-500/30 bg-green-950/20 text-green-500 focus:ring-green-500/50 focus:ring-offset-0 cursor-pointer" />
                  <label htmlFor="terms" className="text-xs text-green-400/60 leading-relaxed">
                    J'accepte les{' '}
                    <a href="#" className="text-green-400 hover:text-green-300 font-semibold transition-colors">Conditions</a>{' '}
                    et la{' '}
                    <a href="#" className="text-green-400 hover:text-green-300 font-semibold transition-colors">Politique de confidentialité</a>
                  </label>
                </div>

                {/* Submit */}
                <button type="submit" disabled={loading}
                  className="relative w-full py-4 mt-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl overflow-hidden group shadow-lg shadow-green-500/20 hover:shadow-green-500/40 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? "Création du compte..." : "Créer mon compte"}
                    {!loading && (
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    )}
                  </span>
                  <div className="absolute inset-0 border-2 border-green-400/50 rounded-xl animate-pulse-border" />
                </button>
              </form>

              <p className="text-center mt-8 text-green-400/50 text-sm">
                Vous avez déjà un compte?{' '}
                <button type="button" onClick={() => navigate('/login')} className="text-green-400 hover:text-green-300 font-semibold transition-colors">
                  Se connecter
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Right half — marquee is the global fixed background */}
        <div className="hidden lg:block lg:w-1/2" />
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Syne:wght@600;700;800&display=swap');
        @keyframes pulse-slow { 0%,100%{opacity:.6} 50%{opacity:.8} }
        @keyframes pulse-slower { 0%,100%{opacity:.4} 50%{opacity:.7} }
        @keyframes pulse-glow { 0%,100%{opacity:.5;transform:scale(1)} 50%{opacity:.8;transform:scale(1.1)} }
        @keyframes pulse-border { 0%,100%{opacity:0;transform:scale(1)} 50%{opacity:.3;transform:scale(1.05)} }
        @keyframes float-slow { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-10px) rotate(5deg)} }
        @keyframes fade-in-down { from{opacity:0;transform:translateY(-20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fade-in-up { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes ping-slow { 0%{transform:scale(1);opacity:1} 75%,100%{transform:scale(1.5);opacity:0} }
        .animate-pulse-slow{animation:pulse-slow 4s ease-in-out infinite}
        .animate-pulse-slower{animation:pulse-slower 6s ease-in-out infinite}
        .animate-pulse-glow{animation:pulse-glow 3s ease-in-out infinite}
        .animate-pulse-border{animation:pulse-border 2s ease-in-out infinite}
        .animate-float-slow{animation:float-slow 6s ease-in-out infinite}
        .animate-fade-in-down{animation:fade-in-down 0.8s ease-out}
        .animate-fade-in-up{animation:fade-in-up 0.8s ease-out}
        .animate-ping-slow{animation:ping-slow 3s cubic-bezier(0,0,.2,1) infinite}
      `}</style>
    </div>
  );
}
