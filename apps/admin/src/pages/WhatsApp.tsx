import { useState } from 'react';

interface Message {
  id: string;
  from: 'customer' | 'agent';
  text: string;
  time: string;
}

interface Chat {
  id: string;
  name: string;
  phone: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  color: string;
}

const mockChats: Chat[] = [
  { id: '1', name: 'María García', phone: '+52 55 1234 5678', lastMessage: 'Sí, mañana en la mañana está bien', lastTime: '10:32', unread: 2, color: 'bg-teal-600' },
  { id: '2', name: 'Carlos López', phone: '+52 55 2345 6789', lastMessage: '¿Cuánto tardan en entregar?', lastTime: '09:15', unread: 0, color: 'bg-amber-600' },
  { id: '3', name: 'Fernanda Ruiz', phone: '+52 55 3456 7890', lastMessage: 'Gracias, quedó perfecto ✨', lastTime: 'Ayer', unread: 0, color: 'bg-violet-600' },
  { id: '4', name: 'Roberto Torres', phone: '+52 55 4567 8901', lastMessage: 'Claro, recibo el 20% de descuento', lastTime: 'Ayer', unread: 0, color: 'bg-stone-500' },
];

const mockMessages: Record<string, Message[]> = {
  '1': [
    { id: 'm1', from: 'customer', text: 'Hola, ¿tienen disponibilidad para recoger mañana?', time: '09:45' },
    { id: 'm2', from: 'agent', text: '¡Claro que sí! Tenemos horarios disponibles a partir de las 8am. ¿Prefieres en la mañana o en la tarde?', time: '09:48' },
    { id: 'm3', from: 'customer', text: 'Sí, mañana en la mañana está bien. Son como 15 piezas, ¿puedo dejarlas en bolsa?', time: '10:30' },
    { id: 'm4', from: 'agent', text: 'Perfecto. Sí, con bolsa es suficiente. Pasamos entre 8-9am. ¿Confirmamos la dirección de siempre?', time: '10:32' },
  ],
};

export default function WhatsApp() {
  const [activeChat, setActiveChat] = useState<string | null>('1');
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Record<string, Message[]>>(mockMessages);

  const active = mockChats.find((c) => c.id === activeChat);

  const sendMessage = () => {
    if (!newMessage.trim() || !activeChat) return;
    const msg: Message = {
      id: `m${Date.now()}`,
      from: 'agent',
      text: newMessage.trim(),
      time: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => ({ ...prev, [activeChat]: [...(prev[activeChat] || []), msg] }));
    setNewMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="-m-8 flex h-[calc(100vh-60px)]">
      {/* Chat list */}
      <div className="w-[340px] flex-shrink-0 border-r border-stone-200 bg-white flex flex-col">
        <div className="p-4 border-b border-stone-100">
          <div className="relative">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" placeholder="Buscar conversación..." className="w-full pl-9 pr-3 py-2 text-sm border-1.5 border-stone-300 rounded-md bg-stone-50 outline-none focus:border-teal-600 font-body" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {mockChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setActiveChat(chat.id)}
              className={`flex gap-3 px-5 py-3.5 cursor-pointer transition-colors border-l-[3px] ${
                activeChat === chat.id ? 'bg-stone-50 border-l-teal-600' : 'border-l-transparent hover:bg-stone-50'
              }`}
            >
              <div className={`flex h-11 w-11 items-center justify-center rounded-full text-white text-sm font-semibold flex-shrink-0 ${chat.color}`}>
                {chat.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-base text-stone-900 leading-tight">{chat.name}</div>
                <div className="text-xs text-stone-500 truncate mt-0.5">{chat.lastMessage}</div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-2xs text-stone-400">{chat.lastTime}</div>
                {chat.unread > 0 && (
                  <div className="inline-flex items-center justify-center min-w-[20px] h-5 rounded-full bg-teal-600 text-white text-[10px] font-semibold px-1.5 mt-1">{chat.unread}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat area */}
      {active ? (
        <div className="flex-1 flex flex-col bg-stone-50">
          {/* Chat header */}
          <div className="flex items-center justify-between px-6 py-3.5 bg-white border-b border-stone-200">
            <div className="flex items-center gap-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-full text-white text-xs font-semibold ${active.color}`}>
                {active.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <div>
                <div className="font-semibold text-lg text-stone-900">{active.name}</div>
                <div className="text-xs text-emerald-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block" /> En línea
                </div>
              </div>
            </div>
            <span className="font-mono text-xs text-stone-500">{active.phone}</span>
          </div>

          {/* Agent status */}
          <div className="flex items-center gap-2 px-6 py-2 bg-teal-50 border-b border-teal-100">
            <div className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse-dot" />
            <span className="text-xs font-semibold text-teal-600">Agente IA activo — respondiendo automáticamente</span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-4">
            <div className="text-center relative mb-2">
              <span className="relative bg-stone-50 px-3 text-xs text-stone-400">Hoy</span>
              <div className="absolute left-0 right-0 top-1/2 h-px bg-stone-200 -z-0" />
            </div>
            {(messages[active.id] || []).map((msg) => (
              <div
                key={msg.id}
                className={`max-w-[70%] px-4 py-3 rounded-lg text-base leading-relaxed ${
                  msg.from === 'agent'
                    ? 'self-end bg-teal-600 text-white rounded-br-sm'
                    : 'self-start bg-white rounded-bl-sm'
                }`}
              >
                {msg.text}
                <div className={`text-[11px] mt-1 ${msg.from === 'agent' ? 'text-white/60' : 'text-stone-400'}`}>{msg.time}</div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="flex gap-3 p-4 bg-white border-t border-stone-200 items-end">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe un mensaje..."
              rows={1}
              className="flex-1 px-4 py-3 border-1.5 border-stone-300 rounded-lg font-body text-base resize-none outline-none focus:border-teal-600 max-h-[100px]"
            />
            <button
              onClick={sendMessage}
              className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-teal-600 text-white hover:bg-teal-500 transition-colors flex-shrink-0"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-stone-400">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-stone-100">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
          </div>
          <strong className="text-stone-700 text-lg">Selecciona una conversación</strong>
          <span className="text-sm">Elige un chat de la lista para ver los mensajes</span>
        </div>
      )}
    </div>
  );
}
