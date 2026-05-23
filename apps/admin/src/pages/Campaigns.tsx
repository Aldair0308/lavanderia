import React, { useState } from 'react';
import { useCampaigns } from '../hooks/useCampaigns';

export default function Campaigns() {
  const { data, isLoading, error, createCampaign } = useCampaigns();
  const [form, setForm] = useState({ name: '', message_template: '', target_segment: '', status: 'draft', scheduled_at: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createCampaign.mutateAsync({ ...form, scheduled_at: form.scheduled_at || null });
    setForm({ name: '', message_template: '', target_segment: '', status: 'draft', scheduled_at: '' });
  };

  if (isLoading) return <p>Cargando campañas...</p>;
  if (error) return <p className="text-red-600">Error al cargar campañas</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Campañas</h1>
      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <input name="name" placeholder="Nombre" value={form.name} onChange={handleChange} className="w-full border p-2" required />
        <textarea name="message_template" placeholder="Plantilla" value={form.message_template} onChange={handleChange} className="w-full border p-2" required />
        <input name="target_segment" placeholder="Segmento" value={form.target_segment} onChange={handleChange} className="w-full border p-2" required />
        <select name="status" value={form.status} onChange={handleChange} className="w-full border p-2">
          <option value="draft">Borrador</option>
          <option value="scheduled">Programada</option>
        </select>
        <input type="datetime-local" name="scheduled_at" value={form.scheduled_at} onChange={handleChange} className="w-full border p-2" />
        <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded">Crear campaña</button>
      </form>
      <ul className="space-y-2">
        {(data as any[]).map((c) => (
          <li key={c.id} className="p-4 bg-white rounded shadow">
            <p><strong>{c.name}</strong> – {c.status}</p>
            <p>{c.message_template}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
