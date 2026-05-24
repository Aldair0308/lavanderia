import { useState } from 'react';
import { useCampaigns } from '../hooks/useCampaigns';

const SEGMENTS = ['Inactivos 30+d', 'Frecuentes', 'Nuevos', 'Todos'];

export default function Campaigns() {
  const { data, isLoading, error, createCampaign } = useCampaigns();
  const [form, setForm] = useState({ name: '', message_template: '', target_segment: 'Inactivos 30+d', status: 'draft', scheduled_at: '' });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-stone-500">Cargando campañas...</div>;
  }
  if (error) {
    return <div className="card p-6 text-red-600">Error al cargar campañas</div>;
  }

  const campaigns: any[] = (data as any[]) || [];
  const activeCount = campaigns.filter((c) => c.status === 'active' || c.status === 'enviada').length;
  const scheduledCount = campaigns.filter((c) => c.status === 'scheduled' || c.status === 'programada').length;
  const completedCount = campaigns.filter((c) => c.status === 'completed' || c.status === 'completada').length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createCampaign.mutateAsync({
      ...form,
      scheduled_at: form.scheduled_at || null,
    });
    setForm({ name: '', message_template: '', target_segment: 'Inactivos 30+d', status: 'draft', scheduled_at: '' });
  };

  const statusBadge = (status: string) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('activ') || s.includes('enviada')) return 'badge-teal';
    if (s.includes('program') || s.includes('scheduled')) return 'badge-amber';
    if (s.includes('complet')) return 'badge-emerald';
    return 'badge-gray';
  };

  const statusLabel = (status: string) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('activ')) return 'Activa';
    if (s.includes('enviada')) return 'Enviada';
    if (s.includes('program') || s.includes('scheduled')) return 'Programada';
    if (s.includes('complet')) return 'Completada';
    if (s.includes('draft') || s.includes('borrador')) return 'Borrador';
    return status || '—';
  };

  return (
    <div>
      <h1 className="font-display text-2xl text-stone-900 mb-6">Campañas</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card p-5">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Activas</div>
          <div className="font-mono text-2xl font-bold text-stone-900">{activeCount}</div>
          <div className="text-xs text-stone-500 mt-1">En ejecución</div>
        </div>
        <div className="card p-5">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Programadas</div>
          <div className="font-mono text-2xl font-bold text-stone-900">{scheduledCount}</div>
          <div className="text-xs text-stone-500 mt-1">Pendientes de envío</div>
        </div>
        <div className="card p-5">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Completadas</div>
          <div className="font-mono text-2xl font-bold text-stone-900">{completedCount}</div>
          <div className="text-xs text-stone-500 mt-1">Finalizadas</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,380px] gap-5">
        {/* Campaign list */}
        <div className="card">
          <div className="card-header">
            <h2 className="font-display text-xl text-stone-900">Todas las campañas</h2>
          </div>
          <div className="p-0">
            {campaigns.length === 0 ? (
              <div className="px-6 py-12 text-center text-stone-500">No hay campañas aún</div>
            ) : (
              campaigns.map((c) => (
                <div key={c.id} className="flex gap-4 px-6 py-4 border-b border-stone-100 last:border-b-0">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-md flex-shrink-0 text-lg ${statusBadge(c.status) === 'badge-teal' ? 'bg-teal-100 text-teal-600' : statusBadge(c.status) === 'badge-amber' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    {statusBadge(c.status) === 'badge-teal' ? '📢' : statusBadge(c.status) === 'badge-amber' ? '⏰' : '✓'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-lg text-stone-900 leading-tight">{c.name}</div>
                    <div className="text-sm text-stone-500 mt-0.5 truncate">{c.message_template}</div>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <span className={`badge ${statusBadge(c.status)}`}>{statusLabel(c.status)}</span>
                      {c.target_segment && <span className="badge badge-gray">{c.target_segment}</span>}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Create campaign */}
        <div className="card">
          <div className="card-header">
            <h2 className="font-display text-xl text-stone-900">Nueva campaña</h2>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="label">Nombre</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input"
                  placeholder="Ej: Promo fin de semana"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="label">Plantilla del mensaje</label>
                <textarea
                  name="message_template"
                  value={form.message_template}
                  onChange={(e) => setForm({ ...form, message_template: e.target.value })}
                  className="input min-h-[80px] resize-y"
                  placeholder="Escribe el mensaje... usa [nombre] para personalizar"
                  required
                />
                <div className="text-xs text-stone-500 mt-1">Usa [nombre] para incluir el nombre del cliente</div>
              </div>
              <div className="mb-4">
                <label className="label">Segmento objetivo</label>
                <div className="flex flex-wrap gap-2">
                  {SEGMENTS.map((seg) => (
                    <button
                      key={seg}
                      type="button"
                      onClick={() => setForm({ ...form, target_segment: seg })}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border-1.5 transition-colors ${
                        form.target_segment === seg
                          ? 'bg-teal-100 border-teal-600 text-teal-600'
                          : 'bg-white border-stone-300 text-stone-600 hover:border-teal-600 hover:text-teal-600'
                      }`}
                    >
                      {seg}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="label">Estado</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="select"
                >
                  <option value="draft">Borrador</option>
                  <option value="scheduled">Programada</option>
                </select>
              </div>
              <div className="mb-5">
                <label className="label">Programar envío</label>
                <input
                  type="datetime-local"
                  name="scheduled_at"
                  value={form.scheduled_at}
                  onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
                  className="input"
                />
              </div>
              <button type="submit" className="btn-primary w-full" disabled={createCampaign.isPending}>
                {createCampaign.isPending ? 'Creando...' : 'Crear campaña'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
