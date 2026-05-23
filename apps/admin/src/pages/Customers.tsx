import { useCustomers } from '../hooks/useCustomers';

export default function Customers() {
  const { isLoading, error, inactive } = useCustomers();

  if (isLoading) return <p>Cargando clientes...</p>;
  if (error) return <p className="text-red-600">Error al cargar clientes</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Clientes</h1>
      <h2 className="text-xl font-semibold mb-4">Inactivos (&gt;30 d&#237;as)</h2>
      {inactive.length === 0 ? (
        <p className="text-gray-600">No hay clientes inactivos.</p>
      ) : (
        <ul className="space-y-2">
          {inactive.map((c: any) => (
            <li key={c.id} className="p-3 bg-white rounded shadow">
              <p><strong>{c.name}</strong> ({c.phone_whatsapp})</p>
              <p className="text-sm text-gray-500">Último pedido: {c.last_order_at ? new Date(c.last_order_at).toLocaleDateString() : 'N/A'}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
