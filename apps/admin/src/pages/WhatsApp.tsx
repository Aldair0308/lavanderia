import { useState, useEffect, useCallback, useRef } from 'react';
import { apiFetch } from '../lib/api';

interface Customer {
  id: string;
  name: string;
  phone_whatsapp: string;
}

interface Conversation {
  id: string;
  customer: Customer;
  is_agent_active: boolean;
  needs_human: boolean;
  last_message_at: string;
  last_message: string | null;
  unread_count: number;
}

interface Message {
  id: string;
  direction: 'inbound' | 'outbound';
  content: string;
  is_automated: boolean;
  timestamp: string;
}

function formatPhone(phone: string): string {
  if (phone.length === 12 && phone.startsWith('52')) {
    return `+52 ${phone.slice(2, 4)} ${phone.slice(4, 8)} ${phone.slice(8)}`;
  }
  return `+${phone}`;
}

function formatTime(ts: string): string {
  const d = new Date(ts);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Ayer';
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
}

function formatMessageTime(ts: string): string {
  return new Date(ts).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
}

const COLORS = ['bg-teal-600', 'bg-amber-600', 'bg-violet-600', 'bg-stone-500', 'bg-rose-600', 'bg-sky-600', 'bg-lime-600', 'bg-orange-600'];

function getColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function WhatsApp() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const active = conversations.find((c) => c.id === activeConv);

  const loadConversations = useCallback(async () => {
    try {
      const data = await apiFetch<Conversation[]>('/whatsapp/conversations');
      setConversations(data);
      setError('');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMessages = useCallback(async (convId: string) => {
    try {
      const data = await apiFetch<Message[]>(`/whatsapp/conversations/${convId}/messages`);
      setMessages(data);
    } catch (e: any) {
      console.error('Failed to load messages:', e);
    }
  }, []);

  useEffect(() => {
    loadConversations();
    const interval = setInterval(loadConversations, 10000);
    return () => clearInterval(interval);
  }, [loadConversations]);

  useEffect(() => {
    if (activeConv) {
      loadMessages(activeConv);
      setConversations((prev) =>
        prev.map((c) => (c.id === activeConv ? { ...c, unread_count: 0 } : c))
      );
    }
  }, [activeConv, loadMessages]);

  useEffect(() => {
    if (activeConv) {
      const interval = setInterval(() => loadMessages(activeConv), 5000);
      return () => clearInterval(interval);
    }
  }, [activeConv, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConv) return;
    try {
      await apiFetch(`/whatsapp/conversations/${activeConv}/messages`, {
        method: 'POST',
        body: JSON.stringify({ text: newMessage.trim() }),
      });
      setNewMessage('');
      await loadMessages(activeConv);
    } catch (e: any) {
      console.error('Failed to send message:', e);
    }
  };

  const toggleAgent = async (convId: string, active: boolean) => {
    try {
      await apiFetch(`/whatsapp/conversations/${convId}/agent`, {
        method: 'PATCH',
        body: JSON.stringify({ active }),
      });
      setConversations((prev) => prev.map((c) => (c.id === convId ? { ...c, is_agent_active: active, needs_human: active ? false : c.needs_human } : c)));
    } catch (e: any) {
      console.error('Failed to toggle agent:', e);
    }
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
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-stone-800 text-sm">Conversaciones</h2>
            <button onClick={loadConversations} className="text-teal-600 text-xs hover:underline">Actualizar</button>
          </div>
          <div className="relative">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" placeholder="Buscar conversación..." className="w-full pl-9 pr-3 py-2 text-sm border-1.5 border-stone-300 rounded-md bg-stone-50 outline-none focus:border-teal-600 font-body" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-stone-400 text-sm">Cargando...</div>
          ) : error ? (
            <div className="flex items-center justify-center py-12 text-red-500 text-sm px-4 text-center">{error}</div>
          ) : conversations.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-stone-400 text-sm">Sin conversaciones aún. Espera a que un cliente te escriba.</div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setActiveConv(conv.id)}
                className={`flex gap-3 px-5 py-3.5 cursor-pointer transition-colors border-l-[3px] ${
                  activeConv === conv.id ? 'bg-stone-50 border-l-teal-600' : 'border-l-transparent hover:bg-stone-50'
                }`}
              >
                <div className={`flex h-11 w-11 items-center justify-center rounded-full text-white text-sm font-semibold flex-shrink-0 ${getColor(conv.customer.name)}`}>
                  {getInitials(conv.customer.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-base text-stone-900 leading-tight">{conv.customer.name}</div>
                  <div className="text-xs text-stone-500 truncate mt-0.5">{conv.last_message || 'Sin mensajes'}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-2xs text-stone-400">{conv.last_message_at ? formatTime(conv.last_message_at) : ''}</div>
                  {conv.unread_count > 0 && (
                    <div className="inline-flex items-center justify-center min-w-[20px] h-5 rounded-full bg-teal-600 text-white text-[10px] font-semibold px-1.5 mt-1">{conv.unread_count}</div>
                  )}
                  {conv.needs_human && !conv.is_agent_active && (
                    <div className="text-[10px] text-rose-500 font-semibold mt-1">Requiere atención</div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat area */}
      {active ? (
        <div className="flex-1 flex flex-col bg-stone-50">
          {/* Chat header */}
          <div className="flex items-center justify-between px-6 py-3.5 bg-white border-b border-stone-200">
            <div className="flex items-center gap-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-full text-white text-xs font-semibold ${getColor(active.customer.name)}`}>
                {getInitials(active.customer.name)}
              </div>
              <div>
                <div className="font-semibold text-lg text-stone-900">{active.customer.name}</div>
                {active.needs_human && (
                  <div className="text-xs text-rose-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600 inline-block" /> Requiere atención humana
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-stone-500">{formatPhone(active.customer.phone_whatsapp)}</span>
              <button
                onClick={() => toggleAgent(active.id, !active.is_agent_active)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                  active.is_agent_active
                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                    : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                }`}
              >
                {active.is_agent_active ? 'IA Activo' : 'IA Inactivo'}
              </button>
            </div>
          </div>

          {/* Agent status bar */}
          <div className={`flex items-center gap-2 px-6 py-2 border-b ${active.is_agent_active ? 'bg-teal-50 border-teal-100' : 'bg-stone-100 border-stone-200'}`}>
            <div className={`w-2 h-2 rounded-full ${active.is_agent_active ? 'bg-emerald-600 animate-pulse-dot' : 'bg-stone-400'}`} />
            <span className={`text-xs font-semibold ${active.is_agent_active ? 'text-teal-600' : 'text-stone-500'}`}>
              {active.is_agent_active ? 'Agente IA activo — respondiendo automáticamente' : 'Agente IA desactivado — solo respondes tú'}
            </span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-4">
            {messages.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-stone-400 text-sm">No hay mensajes en esta conversación</div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`max-w-[70%] px-4 py-3 rounded-lg text-base leading-relaxed ${
                    msg.direction === 'outbound'
                      ? 'self-end bg-teal-600 text-white rounded-br-sm'
                      : 'self-start bg-white rounded-bl-sm'
                  } ${msg.is_automated && msg.direction === 'outbound' ? 'opacity-80' : ''}`}
                >
                  {msg.content}
                  <div className={`text-[11px] mt-1 flex items-center gap-1 ${msg.direction === 'outbound' ? 'text-white/60' : 'text-stone-400'}`}>
                    {formatMessageTime(msg.timestamp)}
                    {msg.is_automated && msg.direction === 'outbound' && <span className="text-[10px] opacity-70">· IA</span>}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
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
              className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-teal-600 text-white hover:bg-teal-500 transition-colors flex-shrink-0 disabled:opacity-50"
              disabled={!newMessage.trim()}
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
