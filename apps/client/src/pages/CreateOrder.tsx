import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { useCreateOrder } from '../hooks/useCreateOrder';
import { useServices } from '../hooks/useServices';
import LocationPicker from '../components/LocationPicker';

const orderSchema = z.object({
  customer_name: z.string().min(1, 'Ingresa tu nombre'),
  customer_phone: z.string().min(1, 'Ingresa tu teléfono'),
  pickup_address: z.string().min(1, 'Selecciona tu ubicación'),
  pickup_lat: z.number().optional(),
  pickup_lng: z.number().optional(),
  quantity_kg: z.number({ required_error: 'Ingresa la cantidad' }).min(1, 'Mínimo 1 kg'),
  pickup_date: z.string().min(1, 'Selecciona la fecha de recolección'),
  pickup_time: z.string().min(1, 'Selecciona el horario de recolección'),
  service_type: z.string().min(1, 'Selecciona un servicio'),
  notes: z.string().optional(),
});

type OrderFormValues = z.infer<typeof orderSchema>;

const timeSlots = [
  { value: '7am - 10am', label: '7:00 – 10:00' },
  { value: '10am - 1pm', label: '10:00 – 13:00' },
  { value: '1pm - 4pm', label: '13:00 – 16:00' },
  { value: '4pm - 7pm', label: '16:00 – 19:00' },
];

function SectionBadge({ number }: { number: number }) {
  return (
    <span className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-semibold text-sm shrink-0">
      {number}
    </span>
  );
}

function SectionHeader({ number, title }: { number: number; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <SectionBadge number={number} />
      <h2 className="font-display text-xl text-stone-900">{title}</h2>
    </div>
  );
}

export default function CreateOrder() {
  const navigate = useNavigate();
  const { services, isLoading: servicesLoading, error: servicesError } = useServices();
  const { mutateAsync, isPending: submitting, error: submitError } = useCreateOrder();
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: { quantity_kg: 1 },
  });

  const quantityKg = watch('quantity_kg') ?? 1;
  const watchedService = watch('service_type');

  const serviceOptions: [string, number | Record<string, unknown>][] = services
    ? Object.entries(services as Record<string, number | Record<string, unknown>>)
    : [];

  const selectedServiceData = serviceOptions.find(([name]) => name === (selectedService ?? watchedService));
  const rawPrice = selectedServiceData ? selectedServiceData[1] : 0;
  const pricePerKg = typeof rawPrice === 'number' ? rawPrice : ((rawPrice as Record<string, unknown>)?.price_per_kg ?? (rawPrice as Record<string, unknown>)?.price ?? 0) as number;
  const serviceName = selectedServiceData ? selectedServiceData[0] : '';
  const estimatedTotal = pricePerKg * quantityKg;

  const handleServiceSelect = (name: string) => {
    setSelectedService(name);
    setValue('service_type', name, { shouldValidate: true });
  };

  const adjustQuantity = (delta: number) => {
    const next = Math.max(1, quantityKg + delta);
    setValue('quantity_kg', next, { shouldValidate: true });
  };

  const handleLocationConfirm = (address: string, lat: number, lng: number) => {
    setValue('pickup_address', address, { shouldValidate: true });
    setPickupCoords({ lat, lng });
  };

  const onSubmit = async (data: OrderFormValues) => {
    try {
      const payload = {
        ...data,
        pickup_lat: pickupCoords?.lat,
        pickup_lng: pickupCoords?.lng,
        total_price: pricePerKg * data.quantity_kg,
      };
      const created = await mutateAsync(payload);
      navigate(`/pedido/${created.id}`);
    } catch {}
  };

  if (servicesLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="font-body text-stone-500 text-lg">Cargando servicios…</p>
      </div>
    );
  }

  if (servicesError) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="font-body text-red-600 text-lg">Error al cargar servicios</p>
      </div>
    );
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-gradient-to-b from-warm-gray to-cream pt-20 pb-10">
        <div className="max-w-2xl mx-auto px-4">
          <nav className="mb-4">
            <ol className="flex items-center text-sm font-body text-stone-500 gap-1">
              <li>
                <Link to="/" className="hover:text-teal-600 transition-colors">Inicio</Link>
              </li>
              <li aria-hidden="true" className="mx-1">›</li>
              <li className="text-stone-700">Solicitar recolección</li>
            </ol>
          </nav>
          <h1 className="font-display text-3xl sm:text-4xl text-stone-900 leading-tight">
            Solicita tu <em className="text-teal-600 not-italic italic">recolección</em>
          </h1>
          <p className="mt-2 font-body text-stone-500">
            Completa los siguientes pasos y nosotros pasamos por tu ropa.
          </p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pb-24">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
          {/* ── Section 1: Contact ── */}
          <section className="bg-white rounded-2xl border border-border p-6 sm:p-8 shadow-sm">
            <SectionHeader number={1} title="Datos de contacto" />

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1" htmlFor="customer_name">
                  Nombre completo
                </label>
                <input
                  id="customer_name"
                  type="text"
                  placeholder="Ej. María García López"
                  {...register('customer_name')}
                  className="w-full rounded-lg border-border px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
                />
                {errors.customer_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.customer_name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1" htmlFor="customer_phone">
                  Teléfono
                </label>
                <input
                  id="customer_phone"
                  type="tel"
                  placeholder="Ej. 55 1234 5678"
                  {...register('customer_phone')}
                  className="w-full rounded-lg border-border px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
                />
                {errors.customer_phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.customer_phone.message}</p>
                )}
              </div>
            </div>
          </section>

          {/* ── Section 2: Service type ── */}
          <section className="bg-white rounded-2xl border border-border p-6 sm:p-8 shadow-sm">
            <SectionHeader number={2} title="Tipo de servicio" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {serviceOptions.map(([name, data]) => {
          const isSelected = (selectedService ?? watchedService) === name;
          const price = typeof data === 'number' ? data : ((data as Record<string, unknown>)?.price_per_kg ?? (data as Record<string, unknown>)?.price ?? null);
          const isPerKg = typeof data !== 'number' && (data as Record<string, unknown>)?.price_per_kg != null;
          return (
            <button
              key={name}
              type="button"
              onClick={() => handleServiceSelect(name)}
              className={`relative text-left rounded-xl border-2 p-4 transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'border-teal-600 bg-teal-200/30 shadow-sm'
                  : 'border-border hover:border-teal-300 hover:bg-teal-200/10'
              }`}
            >
              {isSelected && (
                <span className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-teal-600 text-white">
                  <svg className="h-3 w-3" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M12.207 4.793a1 1 0 0 1 0 1.414l-5 5a1 1 0 0 1-1.414 0l-2.5-2.5a1 1 0 0 1 1.414-1.414L6.5 9.086l4.293-4.293a1 1 0 0 1 1.414 0z" />
                  </svg>
                </span>
              )}
              <p className="font-body font-semibold text-stone-900 pr-7">{name}</p>
              {price !== null && (
                <p className="font-mono text-sm text-teal-600 mt-1">
                  ${typeof price === 'number' ? price.toFixed(2) : String(price)}
                  {isPerKg ? ' / kg' : ' / kg'}
                </p>
              )}
            </button>
                );
              })}
            </div>

            <input type="hidden" {...register('service_type')} />
            {errors.service_type && (
              <p className="mt-3 text-sm text-red-600">{errors.service_type.message}</p>
            )}
          </section>

          {/* ── Section 3: Order details ── */}
          <section className="bg-white rounded-2xl border border-border p-6 sm:p-8 shadow-sm">
            <SectionHeader number={3} title="Detalles del pedido" />

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Cantidad (kg)
                </label>
                <div className="flex items-center gap-0">
                  <button
                    type="button"
                    onClick={() => adjustQuantity(-1)}
                    disabled={quantityKg <= 1}
                    className="flex items-center justify-center w-12 h-12 rounded-l-lg border border-border bg-cream text-stone-700 text-xl font-body font-semibold hover:bg-warm-gray transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    {...register('quantity_kg', { valueAsNumber: true })}
                    className="w-full h-12 border-y border-border text-center font-mono text-stone-900 text-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500/20 focus:border-teal-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => adjustQuantity(1)}
                    className="flex items-center justify-center w-12 h-12 rounded-r-lg border border-border bg-cream text-stone-700 text-xl font-body font-semibold hover:bg-warm-gray transition"
                  >
                    +
                  </button>
                </div>
                {errors.quantity_kg && (
                  <p className="mt-1 text-sm text-red-600">{errors.quantity_kg.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Dirección de recolección
                </label>
                <button
                  type="button"
                  onClick={() => setLocationPickerOpen(true)}
                  className="w-full text-left rounded-lg border border-border px-4 py-3 text-stone-900 bg-white hover:bg-cream focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition min-h-[3rem]"
                >
                  {pickupCoords ? (
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 shrink-0 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-stone-900 truncate">
                          {watch('pickup_address')}
                        </p>
                        <p className="text-xs text-stone-500">
                          {pickupCoords.lat.toFixed(5)}, {pickupCoords.lng.toFixed(5)}
                        </p>
                      </div>
                      <svg className="w-4 h-4 shrink-0 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m9 5 7 7-7 7" />
                      </svg>
                    </div>
                  ) : (
                    <span className="text-stone-400 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                      </svg>
                      Seleccionar ubicación en el mapa
                    </span>
                  )}
                </button>
                <input type="hidden" {...register('pickup_address')} />
                {errors.pickup_address && (
                  <p className="mt-1 text-sm text-red-600">{errors.pickup_address.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1" htmlFor="pickup_date">
                    Fecha de recolección
                  </label>
                  <input
                    id="pickup_date"
                    type="date"
                    min={today}
                    {...register('pickup_date')}
                    className="w-full rounded-lg border-border px-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
                  />
                  {errors.pickup_date && (
                    <p className="mt-1 text-sm text-red-600">{errors.pickup_date.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1" htmlFor="pickup_time">
                    Horario de recolección
                  </label>
                  <select
                    id="pickup_time"
                    {...register('pickup_time')}
                    className="w-full rounded-lg border-border px-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition appearance-none pr-10"
                  >
                    <option value="">-- Selecciona --</option>
                    {timeSlots.map((slot) => (
                      <option key={slot.value} value={slot.value}>
                        {slot.label}
                      </option>
                    ))}
                  </select>
                  {errors.pickup_time && (
                    <p className="mt-1 text-sm text-red-600">{errors.pickup_time.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1" htmlFor="notes">
                  Notas adicionales <span className="text-stone-400 font-normal">(opcional)</span>
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  placeholder="Instrucciones especiales, accesos, etc."
                  {...register('notes')}
                  className="w-full rounded-lg border-border px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition resize-none"
                />
              </div>
            </div>
          </section>

          {/* ── Section 4: Summary ── */}
          <section className="bg-white rounded-2xl border border-border p-6 sm:p-8 shadow-sm">
            <SectionHeader number={4} title="Resumen del pedido" />

            <div className="rounded-xl bg-cream border border-border divide-y divide-border">
              <div className="flex items-center justify-between px-5 py-4">
                <span className="font-body text-stone-500 text-sm">Servicio</span>
                <span className="font-body font-semibold text-stone-900">{serviceName || '—'}</span>
              </div>
              <div className="flex items-center justify-between px-5 py-4">
                <span className="font-body text-stone-500 text-sm">Cantidad</span>
                <span className="font-mono font-semibold text-stone-900">{quantityKg} kg</span>
              </div>
              <div className="flex items-center justify-between px-5 py-4">
                <span className="font-body text-stone-500 text-sm">Precio por kg</span>
                <span className="font-mono font-semibold text-stone-900">
                  {typeof pricePerKg === 'number' ? `$${pricePerKg.toFixed(2)}` : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between px-5 py-4 bg-teal-200/20">
                <span className="font-body font-semibold text-teal-600">Total estimado</span>
                <span className="font-mono font-bold text-teal-600 text-lg">
                  ${estimatedTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {submitError && (
              <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
                <p className="text-sm text-red-700">
                  Error al crear el pedido: {(submitError as Error).message}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 w-full rounded-xl bg-teal-600 px-6 py-4 font-body font-semibold text-white text-lg hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Procesando…
                </span>
              ) : (
                'Confirmar pedido'
              )}
            </button>
          </section>
        </form>
      </main>

      <LocationPicker
        open={locationPickerOpen}
        onClose={() => setLocationPickerOpen(false)}
        onConfirm={handleLocationConfirm}
        initialAddress={watch('pickup_address')}
        initialLat={pickupCoords?.lat}
        initialLng={pickupCoords?.lng}
      />
    </div>
  );
}
