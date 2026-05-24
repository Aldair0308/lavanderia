import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';

const navItems = [
  { name: 'Dashboard', path: '/' },
  { name: 'Pedidos', path: '/orders' },
  { name: 'Clientes', path: '/customers' },
  { name: 'WhatsApp', path: '/whatsapp' },
  { name: 'Campañas', path: '/campaigns' },
  { name: 'Reportes', path: '/reports' },
];

export default function Layout() {
  const { isAuth, signOut, user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isAuth) {
      navigate('/login');
    }
  }, [isAuth, navigate]);

  if (!isAuth) return null;

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-md p-4">
        <h2 className="text-xl font-bold mb-6">Lavandería Admin</h2>
        {user && <p className="text-sm text-gray-500 mb-4">{user.email}</p>}
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
          onClick={() => { signOut(); navigate('/login'); }}
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
