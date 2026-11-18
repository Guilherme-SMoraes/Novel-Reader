import React, { useEffect, useState } from 'react';
import { Cloud, Loader2, Sparkles, Server } from 'lucide-react';

export const ColdStartOverlay: React.FC = () => {
  const [isWaking, setIsWaking] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;

    const handleWaking = () => {
      setIsWaking(true);
    };

    const handleReady = () => {
      setIsWaking(false);
      setElapsedSeconds(0);
    };

    window.addEventListener('server:waking', handleWaking);
    window.addEventListener('server:ready', handleReady);

    return () => {
      window.removeEventListener('server:waking', handleWaking);
      window.removeEventListener('server:ready', handleReady);
      if (timer) clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isWaking) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isWaking]);

  if (!isWaking) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(9, 13, 22, 0.88)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        animation: 'fadeIn 0.3s ease-out',
        color: '#f8fafc',
      }}
    >
      <div
        style={{
          maxWidth: '480px',
          width: '100%',
          background: 'linear-gradient(145deg, #1e293b, #0f172a)',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          borderRadius: '20px',
          padding: '36px 28px',
          textAlign: 'center',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 40px rgba(99, 102, 241, 0.2)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Glow decoration */}
        <div
          style={{
            position: 'absolute',
            top: '-50px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '200px',
            height: '100px',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Animated Icon Container */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            width: '88px',
            height: '88px',
            borderRadius: '24px',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2))',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            marginBottom: '20px',
          }}
        >
          <Server size={38} color="#818cf8" />
          <Cloud
            size={22}
            color="#c084fc"
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              animation: 'bounce 2s infinite ease-in-out',
            }}
          />
          <Sparkles
            size={18}
            color="#38bdf8"
            style={{
              position: 'absolute',
              bottom: '12px',
              left: '12px',
            }}
          />
        </div>

        <h2
          style={{
            fontSize: '1.4rem',
            fontWeight: 700,
            marginBottom: '10px',
            background: 'linear-gradient(to right, #ffffff, #cbd5e1)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Acordando o servidor na nuvem...
        </h2>

        <p
          style={{
            fontSize: '0.9rem',
            lineHeight: 1.55,
            color: '#94a3b8',
            marginBottom: '24px',
          }}
        >
          O backend estava em repouso e está inicializando no Render. Isso leva cerca de <strong>30 a 50 segundos</strong> no plano gratuito. Por favor, aguarde um instante!
        </p>

        {/* Animated Pulse / Progress Bar */}
        <div
          style={{
            width: '100%',
            height: '6px',
            background: 'rgba(51, 65, 85, 0.7)',
            borderRadius: '999px',
            overflow: 'hidden',
            marginBottom: '18px',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              width: `${Math.min(95, (elapsedSeconds / 45) * 100)}%`,
              background: 'linear-gradient(90deg, #6366f1, #a855f7, #38bdf8)',
              borderRadius: '999px',
              transition: 'width 1s linear',
              boxShadow: '0 0 12px rgba(168, 85, 247, 0.6)',
            }}
          />
        </div>

        {/* Status Pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '999px',
            background: 'rgba(30, 41, 59, 0.8)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            fontSize: '0.8rem',
            color: '#cbd5e1',
            marginBottom: '20px',
          }}
        >
          <Loader2 size={14} className="animate-spin" color="#818cf8" />
          <span>Conectando... {elapsedSeconds > 0 && `(${elapsedSeconds}s)`}</span>
        </div>

        {/* Helpful Tip */}
        <div
          style={{
            padding: '10px 14px',
            borderRadius: '10px',
            background: 'rgba(99, 102, 241, 0.08)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            fontSize: '0.78rem',
            color: '#a5b4fc',
            lineHeight: 1.4,
          }}
        >
          💡 <strong>Fique tranquilo:</strong> Enquanto você estiver com esta página aberta, o sistema manterá o backend acordado e ele não congelará mais.
        </div>
      </div>
    </div>
  );
};
