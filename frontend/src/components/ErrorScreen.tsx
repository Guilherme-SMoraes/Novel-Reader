import { useState, type ErrorInfo, type FC } from 'react';
import { AlertTriangle, RefreshCw, RotateCcw, Home, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';

interface ErrorScreenProps {
  error?: Error | null;
  errorInfo?: ErrorInfo | null;
  onRetry?: () => void;
}

export const ErrorScreen: FC<ErrorScreenProps> = ({ error, errorInfo, onRetry }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  const errorMessage = error?.message || 'Um erro inesperado interrompeu a aplicação.';
  const componentStack = errorInfo?.componentStack || '';

  const handleCopy = async () => {
    const fullLog = `Error: ${errorMessage}\n\nStack:\n${error?.stack || ''}\n\nComponent Stack:\n${componentStack}`;
    try {
      await navigator.clipboard.writeText(fullLog);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard write failed
    }
  };

  const handleReload = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div
      style={{
        minHeight: '100dvh',
        width: '100vw',
        background: 'linear-gradient(135deg, #090d16 0%, #0f172a 50%, #1e1b4b 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        color: '#f8fafc',
      }}
    >
      <div
        style={{
          maxWidth: '560px',
          width: '100%',
          background: 'linear-gradient(145deg, #1e293b, #0f172a)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          borderRadius: '24px',
          padding: '40px 32px',
          textAlign: 'center',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 40px rgba(239, 68, 68, 0.15)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Glow */}
        <div
          style={{
            position: 'absolute',
            top: '-60px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '240px',
            height: '120px',
            background: 'radial-gradient(circle, rgba(239, 68, 68, 0.3) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Icon */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '80px',
            height: '80px',
            borderRadius: '22px',
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(245, 158, 11, 0.15))',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            marginBottom: '20px',
          }}
        >
          <AlertTriangle size={38} color="#f87171" />
        </div>

        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            marginBottom: '10px',
            background: 'linear-gradient(to right, #ffffff, #fca5a5)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Ops! Algo deu errado
        </h1>

        <p
          style={{
            fontSize: '0.92rem',
            lineHeight: 1.6,
            color: '#94a3b8',
            marginBottom: '28px',
          }}
        >
          Ocorreu uma falha inesperada ao renderizar a interface. Não se preocupe, seus dados estão seguros na nuvem.
        </p>

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: '24px',
          }}
        >
          {onRetry && (
            <button
              onClick={onRetry}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.88rem',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)',
                transition: 'all 0.2s',
              }}
            >
              <RotateCcw size={16} />
              Tentar Novamente
            </button>
          )}

          <button
            onClick={handleReload}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '12px',
              background: 'rgba(51, 65, 85, 0.7)',
              color: '#f8fafc',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <RefreshCw size={16} />
            Recarregar Página
          </button>

          <button
            onClick={handleGoHome}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '12px',
              background: 'transparent',
              color: '#94a3b8',
              border: '1px solid rgba(148, 163, 184, 0.15)',
              fontWeight: 500,
              fontSize: '0.88rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <Home size={16} />
            Início
          </button>
        </div>

        {/* Collapsible Details */}
        <div style={{ textAlign: 'left', marginTop: '16px' }}>
          <button
            onClick={() => setShowDetails(prev => !prev)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              padding: '8px 12px',
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(148, 163, 184, 0.1)',
              borderRadius: '8px',
              color: '#94a3b8',
              fontSize: '0.78rem',
              cursor: 'pointer',
            }}
          >
            <span>Detalhes técnicos</span>
            {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showDetails && (
            <div
              style={{
                marginTop: '8px',
                padding: '12px',
                background: 'rgba(9, 13, 22, 0.85)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontFamily: 'monospace',
                color: '#fca5a5',
                maxHeight: '160px',
                overflowY: 'auto',
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '6px' }}>
                <button
                  onClick={handleCopy}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    background: 'rgba(51, 65, 85, 0.6)',
                    color: '#e2e8f0',
                    border: 'none',
                    fontSize: '0.7rem',
                    cursor: 'pointer',
                  }}
                >
                  {copied ? <Check size={12} color="#4ade80" /> : <Copy size={12} />}
                  {copied ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
              <div style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                {errorMessage}
                {componentStack && `\n\nComponent Stack:\n${componentStack}`}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
