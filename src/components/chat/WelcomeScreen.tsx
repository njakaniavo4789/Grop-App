import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';

interface WelcomeScreenProps {
  suggestions: Array<{ label: string; subtitle: string; icon?: React.ReactNode }>;
  onSelect: (text: string) => void;
}

const typingText = "Comment puis-je vous aider ?";

export function WelcomeScreen({ suggestions, onSelect }: WelcomeScreenProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const counterRef = useRef({ value: 0 });
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setDisplayedText(typingText);
      return;
    }

    const typeIn = () =>
      gsap.to(counterRef.current, {
        value: typingText.length,
        duration: typingText.length * 0.055,
        ease: 'none',
        onUpdate() {
          setDisplayedText(typingText.slice(0, Math.round(counterRef.current.value)));
        },
      });

    const typeOut = () =>
      gsap.to(counterRef.current, {
        value: 0,
        duration: typingText.length * 0.03,
        ease: 'none',
        onUpdate() {
          setDisplayedText(typingText.slice(0, Math.round(counterRef.current.value)));
        },
      });

    const tl = gsap.timeline({ repeat: -1 });
    tlRef.current = tl;

    tl.add(typeIn())
      .to({}, { duration: 30 })   // hold 30 s
      .add(typeOut())
      .to({}, { duration: 1.2 }); // brief pause before restart

    // Cursor blink — independent interval
    const cursorInterval = setInterval(() => setShowCursor(p => !p), 530);

    return () => {
      tl.kill();
      clearInterval(cursorInterval);
    };
  }, []);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', textAlign: 'center', padding: '64px 32px',
    }}>
      <h1 style={{
        fontSize: 32, fontWeight: 600, fontFamily: 'var(--font-display)',
        background: 'linear-gradient(135deg, white, var(--cyan-400))',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        marginBottom: 8,
        animation: 'fade-in-up 0.6s ease-out',
      }}>
        Bonjour, Agriculteur
      </h1>

      <h2 style={{
        fontSize: 18,
        color: 'var(--text-secondary)',
        marginBottom: 16,
        minHeight: 28,
        fontFamily: 'var(--font-display)',
      }}>
        {displayedText}
        <span style={{
          color: 'var(--cyan-400)',
          opacity: showCursor ? 1 : 0,
          transition: 'opacity 0.1s',
          marginLeft: 1,
        }}>
          |
        </span>
      </h2>

      <p style={{ color: 'var(--text-muted)', maxWidth: 400, lineHeight: 1.6, marginBottom: 48 }}>
        Prêt à vous assister dans vos activités agricoles, de la plantation à la récolte.
      </p>

      {/* Suggestion Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 16,
        maxWidth: 680,
        width: '100%',
      }}>
        {suggestions.map((s, i) => (
          <button
            key={i}
            onClick={() => onSelect(s.label)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: 8,
              textAlign: 'left',
              cursor: 'pointer',
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              borderRadius: 16,
              padding: 20,
              color: 'var(--text-secondary)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              animation: `fade-in-up 0.4s ease-out ${i * 0.1}s both`,
            }}
          >
            <p style={{
              fontSize: 14, fontWeight: 500, color: 'var(--text-primary)',
              lineHeight: 1.4,
            }}>
              {s.label}
            </p>
            {s.subtitle && (
              <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                {s.subtitle}
              </p>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
