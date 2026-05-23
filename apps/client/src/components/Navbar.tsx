import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? 'text-teal-600 font-medium after:w-full'
      : 'text-stone-700 hover:text-stone-900 after:w-0';

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-cream/85 backdrop-blur-lg border-b border-border/50">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-5 py-3">
        <Link to="/" className="flex items-center gap-2 no-underline">
          <div className="w-9 h-9 bg-teal-600 rounded-lg flex items-center justify-center text-white font-display text-lg">
            L
          </div>
          <span className="font-display text-xl text-stone-900">Lavandería</span>
        </Link>

        <ul className="hidden md:flex gap-8 list-none m-0 p-0">
          <li>
            <NavLink to="/" className={`${linkClass} relative transition-colors after:content-[''] after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:bg-teal-600 after:transition-all`}>
              Inicio
            </NavLink>
          </li>
          <li>
            <NavLink to="/servicios" className={`${linkClass} relative transition-colors after:content-[''] after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:bg-teal-600 after:transition-all`}>
              Servicios
            </NavLink>
          </li>
          <li>
            <NavLink to="/solicitud" className={`${linkClass} relative transition-colors after:content-[''] after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:bg-teal-600 after:transition-all`}>
              Solicitar
            </NavLink>
          </li>
        </ul>

        <Link
          to="/solicitud"
          className="hidden md:inline-flex bg-teal-600 text-white px-5 py-2.5 rounded-lg font-body font-semibold text-[0.9375rem] hover:bg-teal-500 hover:-translate-y-0.5 hover:shadow-md transition-all no-underline"
        >
          Solicitar recolección
        </Link>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden w-10 h-10 flex items-center justify-center text-stone-700"
          aria-label="Menú"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? (
              <>
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="6" y1="18" x2="18" y2="6" />
              </>
            ) : (
              <>
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </>
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border/50 bg-cream px-5 pb-4 pt-2 flex flex-col gap-3">
          <NavLink to="/" className={linkClass} onClick={() => setOpen(false)}>Inicio</NavLink>
          <NavLink to="/servicios" className={linkClass} onClick={() => setOpen(false)}>Servicios</NavLink>
          <NavLink to="/solicitud" className={linkClass} onClick={() => setOpen(false)}>Solicitar</NavLink>
          <Link
            to="/solicitud"
            onClick={() => setOpen(false)}
            className="mt-2 bg-teal-600 text-white text-center px-5 py-3 rounded-lg font-semibold no-underline"
          >
            Solicitar recolección
          </Link>
        </div>
      )}
    </nav>
  );
}
