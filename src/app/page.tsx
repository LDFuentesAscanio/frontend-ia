'use client';

import { useState, useRef, useEffect } from 'react';

type Message = {
  from: 'user' | 'bot';
  text: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    const userMessage: Message = { from: 'user', text: trimmedInput };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmedInput }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.reply || 'Error en la respuesta del servidor'
        );
      }

      const data = await res.json();

      if (!data.reply || typeof data.reply !== 'string') {
        throw new Error('Respuesta inválida del servidor');
      }

      const botMessage: Message = { from: 'bot', text: data.reply };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      const errorMessage: Message = {
        from: 'bot',
        text:
          error instanceof Error
            ? error.message
            : '❌ Error al conectar con el agente IA.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <main className="max-w-xl mx-auto py-8 px-4 space-y-4">
      <h1 className="text-2xl font-bold text-center">
        🧠 Chat con el Agente IA
      </h1>

      <div className="border rounded p-4 h-96 overflow-y-auto bg-white shadow flex flex-col">
        {messages.length === 0 ? (
          <div className="text-gray-500 text-center my-auto">
            Escribe un mensaje para comenzar...
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className={`mb-2 ${
                msg.from === 'user' ? 'text-right' : 'text-left'
              }`}
            >
              <span
                className={`inline-block p-2 rounded-lg ${
                  msg.from === 'user'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-green-100 text-green-800'
                }`}
              >
                {msg.from === 'user' ? '🧑‍💻' : '🤖'} {msg.text}
              </span>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2">
        <input
          className="border p-2 rounded flex-1"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribí tu mensaje..."
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          autoComplete="off"
          autoFocus
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          onClick={sendMessage}
          disabled={!input.trim() || isLoading}
          aria-label="Enviar mensaje"
        >
          {isLoading ? 'Enviando...' : 'Enviar'}
        </button>
      </div>
    </main>
  );
}
