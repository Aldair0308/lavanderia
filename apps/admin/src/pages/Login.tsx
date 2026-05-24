import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';

export default function Login() {
  const { signIn, isAuth } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (isAuth) {
    navigate('/', { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signIn(email, password);
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Credenciales inválidas. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 p-6"
      style={{
        backgroundImage: `
          radial-gradient(ellipse 70% 50% at 30% 20%, rgba(13,148,136,0.08) 0%, transparent 60%),
          radial-gradient(ellipse 50% 40% at 80% 70%, rgba(217,119,6,0.05) 0%, transparent 50%)
        `,
      }}
    >
      <div className="w-full max-w-[420px]">
        <div className="bg-white rounded-xl p-10 shadow-lg border border-stone-200/50 animate-slide-up">
          {/* Brand */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-md bg-gradient-to-br from-teal-600 to-teal-500 font-display text-xl font-bold text-white">
              L
            </div>
            <h1 className="font-display text-3xl text-stone-900 leading-tight mb-1">Lavandería OS</h1>
            <p className="text-base text-stone-500">Panel de administración</p>
            <span className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-teal-100 text-teal-600 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-pulse-dot" />
              Acceso restringido
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label className="label" htmlFor="email">Correo electrónico</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-filled"
                placeholder="admin@lavanderia.com"
                autoComplete="email"
              />
            </div>
            <div className="mb-5">
              <label className="label" htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-filled"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="mb-5 px-3.5 py-2.5 rounded-md bg-red-50 text-red-600 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              {loading ? 'Entrando...' : 'Iniciar sesión'}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-stone-500">
            ¿Olvidaste tu contraseña?{' '}
            <a href="#" className="text-teal-600 font-medium hover:underline">Recuperar acceso</a>
          </p>
        </div>
      </div>
    </div>
  );
}
