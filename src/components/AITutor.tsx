import React, { useState, useEffect, useRef } from 'react';
import { Icons } from './Icons';

interface AITutorProps {
  context: {
    courseTitle?: string;      // Опционально - название курса
    moduleTitle: string;       // Изменено с moduleName
    moduleContent: string;     // Изменено с content
  };
  onClose: () => void;
}

const BOT_TOKEN = import.meta.env.VITE_PROTALK_BOT_TOKEN;
const BOT_ID = import.meta.env.VITE_PROTALK_BOT_ID;
const API_URL = import.meta.env.VITE_PROTALK_API_URL;

export const AITutor: React.FC<AITutorProps> = ({ context, onClose }) => {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'ai'; text: string }>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([
      { 
        role: 'ai', 
        text: `Привет! Я AI-помощник для модуля "${context.moduleTitle}". Задавай любые вопросы по материалу! 🎓` 
      }
    ]);
  }, [context.moduleTitle]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);
    
    try {
      if (!BOT_TOKEN || !BOT_ID || !API_URL) {
        throw new Error('Pro-Talk credentials не настроены в .env.local');
      }
      
      const prompt = `Ты AI-тьютор для образовательной платформы.
Курс: "${context.courseTitle || 'не указан'}"
Текущий модуль: "${context.moduleTitle}"
Содержание модуля: ${context.moduleContent}

Вопрос студента: ${userMessage}

Дай краткий, понятный ответ на русском языке, связанный с темой модуля.`;

      const chatId = `tutor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const response = await fetch(`${API_URL}/ask/${BOT_TOKEN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bot_id: parseInt(BOT_ID),
          chat_id: chatId,
          message: prompt
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const text = data.done || data.response;
      
      setMessages(prev => [...prev, { role: 'ai', text }]);
    } catch (error: any) {
      console.error('AI Tutor error:', error);
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: `Извините, произошла ошибка: ${error.message}. Попробуйте задать вопрос позже.` 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="ai-tutor-drawer">
      <div className="ai-header">
        <div className="ai-title">
          <Icons.Brain />
          <div>
            <div>🤖 AI-Помощник</div>
            <small style={{ fontSize: '0.75rem', opacity: 0.9 }}>
              {context.moduleTitle}
            </small>
          </div>
        </div>
        <button onClick={onClose} className="icon-btn">
          <Icons.X />
        </button>
      </div>
      
      <div className="chat-area">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            <div className="message-bubble">{msg.text}</div>
          </div>
        ))}
        {loading && (
          <div className="message ai">
            <div className="message-bubble">
              <span className="typing-indicator">
                <span>●</span><span>●</span><span>●</span>
              </span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      
      <div className="input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Задайте вопрос по материалу..."
          disabled={loading}
        />
        <button 
          onClick={handleSend} 
          disabled={loading || !input.trim()}
        >
          <Icons.Send />
        </button>
      </div>
    </div>
  );
};
