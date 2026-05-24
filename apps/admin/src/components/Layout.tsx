import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';

const navSections = [
  {
    label: 'Principal',
    items: [
      { to: '/', label: 'Dashboard', icon: '⊞' },
      { to: '/orders', label: 'Pedidos', icon: '📋' },
      { to: '/customers', label: 'Clientes', icon: '👥' },
    ],
  },
  {
    label: 'Comunicación',
    items: [
      { to: '/whatsapp', label: 'WhatsApp', icon: '💬' },
      { to: '/campaigns', label: 'Campañas', icon: '📢' },
    ],
  },
  {
    label: 'Análisis',
    items: [
      { to: '/reports', label: 'Reportes', icon: '📊' },
    ],
  },
];

export default function Layout() {
  const { isAuth, signOut, user } = useAuth();
  const navigate = useNavigate();

  if (!isAuth) {
    return <Outlet />;
  }

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() || '??';

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 flex w-sidebar flex-col bg-stone-900 text-stone-50">
        {/* Brand */}
        <div className="flex h-topbar items-center gap-3 px-5 border-b border-white/8 flex-shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-br from-teal-600 to-teal-500 font-display text-base font-bold text-white">
            L
          </div>
          <div>
            <div className="font-display text-lg leading-tight">Lavandería</div>
            <div className="font-body text-2xs text-stone-500">Panel admin</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3">
          {navSections.map((section) => (
            <div key={section.label}>
              <div className="px-5 pt-3 pb-1 text-2xs font-bold uppercase tracking-wider text-white/30">
                {section.label}
              </div>
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? 'active' : ''}`
                  }
                >
                  <span className="flex h-5 w-5 items-center justify-center text-base flex-shrink-0">
                    {item.icon}
                  </span>
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div className="border-t border-white/8 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-gradient-to-br from-teal-600 to-teal-500 text-xs font-semibold text-white flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold leading-tight truncate">
                {user?.name || user?.email}
              </div>
              <div className="text-2xs text-white/40">{user?.role || 'Admin'}</div>
            </div>
            <button
              onClick={() => { signOut(); navigate('/login'); }}
              className="p-1 rounded-sm text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-colors"
              title="Cerrar sesión"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className="ml-sidebar flex flex-1 flex-col min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-40 flex h-topbar items-center justify-between border-b border-stone-200/50 bg-stone-50/85 backdrop-blur-md px-6">
          <div />
          <div className="flex items-center gap-3">
            <button className="flex h-[38px] w-[38px] items-center justify-center rounded-md border border-stone-300 bg-white text-stone-500 hover:border-stone-500 hover:text-stone-700 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-8 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
