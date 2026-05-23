import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';

const navItems = [
  { name: 'Dashboard', path: '/' },
  { name: 'Pedidos', path: '/orders' },
  { name: 'Clientes', path: '/customers' },
  { name: 'WhatsApp', path: '/whatsapp' },
  { name: 'Campañas', path: '/campaigns' },
  { name: 'Reportes', path: '/reports' },
];

export default function Layout() {
  const session = useSession();
  const supabase = useSupabaseClient();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!session) {
      navigate('/login');
    }
  }, [session, navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-md p-4">
        <h2 className="text-xl font-bold mb-6">Lavandería Admin</h2>
        <nav className="flex flex-col space-y-2">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-500'
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={handleLogout}
          className="mt-8 w-full py-2 bg-red-500 text-white rounded"
        >
          Cerrar sesión
        </button>
      </aside>
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
