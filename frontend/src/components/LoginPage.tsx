import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { BookOpen, ShieldCheck, KeyRound, ShieldAlert } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { loginWithGoogle } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const isGoogleConfigured = !!googleClientId && googleClientId !== 'your_google_oauth_client_id_here.apps.googleusercontent.com';

  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) {
      showToast('Credencial do Google não recebida.', 'error');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    try {
      await loginWithGoogle(credentialResponse.credential);
      showToast('Login realizado com sucesso! Bem-vindo de volta.', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao autenticar com o Google.';
      setErrorMessage(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    showToast('Falha no popup de login da Google. Tente novamente.', 'error');
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
        padding: '20px',
        color: '#f8fafc',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          background: 'rgba(30, 41, 59, 0.75)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '36px 32px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px auto',
            boxShadow: '0 10px 20px -5px rgba(99, 102, 241, 0.5)',
          }}
        >
          <BookOpen size={32} color="#ffffff" />
        </div>

        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '8px', letterSpacing: '-0.025em' }}>
          NovelReader
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.92rem', marginBottom: '28px', lineHeight: 1.5 }}>
          Seu diário e gerenciador pessoal de leitura de Novels, Manhwas, Mangás e Animes.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
          {errorMessage && (
            <div
              style={{
                width: '100%',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '10px',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                color: '#fca5a5',
                fontSize: '0.85rem',
                textAlign: 'left',
                lineHeight: 1.45,
              }}
            >
              <ShieldAlert size={20} style={{ flexShrink: 0, marginTop: 1, color: '#ef4444' }} />
              <div>{errorMessage}</div>
            </div>
          )}

          {isGoogleConfigured ? (
            <div style={{ minHeight: '44px', display: 'flex', justifyContent: 'center', width: '100%' }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap
                theme="filled_blue"
                size="large"
                shape="pill"
                text="signin_with"
                width="320"
              />
            </div>
          ) : (
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.85)',
                border: '1px dashed #6366f1',
                borderRadius: '12px',
                padding: '18px',
                textAlign: 'left',
                width: '100%',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: '#a5b4fc', fontWeight: 700, fontSize: '0.9rem' }}>
                <KeyRound size={18} />
                <span>Google Client ID Pendente</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.5, margin: '0 0 12px 0' }}>
                O login seguro com a Google está pronto! Para ativá-lo, crie um OAuth Client ID no Google Cloud e adicione a chave no arquivo <code>.env</code>:
              </p>
              <div style={{ background: '#090d16', padding: '8px 10px', borderRadius: 6, fontSize: '0.78rem', color: '#38bdf8', fontFamily: 'monospace', marginBottom: 12, wordBreak: 'break-all' }}>
                GOOGLE_CLIENT_ID=seu_client_id.apps.googleusercontent.com
              </div>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>
                Origem autorizada em desenvolvimento: <code>http://localhost:5173</code>
              </p>
            </div>
          )}

          {loading && (
            <p style={{ color: '#38bdf8', fontSize: '0.85rem', marginTop: 10 }}>
              Autenticando e carregando sua biblioteca...
            </p>
          )}
        </div>

        <div
          style={{
            marginTop: '32px',
            paddingTop: '20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            color: '#64748b',
            fontSize: '0.78rem',
          }}
        >
          <ShieldCheck size={16} color="#10b981" />
          <span>Isolamento seguro de dados: cada usuário acessa apenas suas próprias obras.</span>
        </div>
      </div>
    </div>
  );
};
