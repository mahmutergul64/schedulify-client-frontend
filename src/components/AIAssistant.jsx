import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Bot, X, Send, Sparkles, User, Activity } from 'lucide-react';

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Merhaba! Ben SchedulifyPro Yapay Zeka Asistanı. Şikayetlerinizi veya belirtilerinizi bana kısaca yazın, sizi doğru uzmana yönlendireyim.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await axios.post('https://schedulify-backend-dgce.onrender.com/api/ai/analyze', { message: userMsg.text });
      const aiMsg = { sender: 'ai', text: res.data.reply, specialty: res.data.specialty };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      setMessages(prev => [...prev, { sender: 'ai', text: 'Üzgünüm, şu an sunucularıma bağlanamıyorum. Lütfen daha sonra tekrar deneyin.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {isOpen && (
        <div className="bg-white/95 backdrop-blur-xl w-80 sm:w-96 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-gray-200/60 flex flex-col mb-4 overflow-hidden animate-fade-in transition-all origin-bottom-right">
          
          <div className="bg-slate-900 p-4 text-white flex items-center justify-between shadow-md relative z-10">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-xl relative">
                <Bot className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                </span>
              </div>
              <div>
                <h3 className="font-black text-sm tracking-wide">AI Semptom Asistanı</h3>
                <p className="text-blue-300 text-xs font-bold flex items-center gap-1"><Sparkles className="w-3 h-3" /> OpenAI Destekli</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors bg-slate-800 hover:bg-slate-700 p-1.5 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto max-h-96 min-h-[300px] bg-slate-50/50 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${msg.sender === 'user' ? 'bg-slate-200 text-slate-600' : 'bg-blue-100 text-blue-600'}`}>
                    {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                  </div>

                  <div className={`p-3.5 rounded-2xl text-sm font-medium shadow-sm leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-slate-900 text-white rounded-tr-none' 
                      : 'bg-white text-slate-700 border border-gray-100 rounded-tl-none'
                  }`}>
                    {msg.text}
                    {msg.specialty && (
                      <div className="mt-3 pt-3 border-t border-gray-100/50">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
                          Önerilen Uzman: {msg.specialty}
                        </span>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex gap-3 max-w-[85%]">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-gray-100 rounded-tl-none shadow-sm flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Örn: İki gündür başım çok ağrıyor..."
                disabled={isLoading}
                className="w-full pl-4 pr-12 py-3.5 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none text-sm font-bold text-slate-800 placeholder-slate-400 transition-all disabled:opacity-50"
              />
              <button 
                type="submit" 
                disabled={isLoading || !input.trim()}
                className="absolute right-2 bg-slate-900 hover:bg-slate-800 text-white p-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>

        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`bg-slate-900 hover:bg-slate-800 text-white p-4 rounded-full shadow-2xl shadow-slate-900/40 transition-all hover:scale-110 active:scale-95 flex items-center justify-center group relative ${isOpen ? 'rotate-90 scale-0 opacity-0 absolute' : 'rotate-0 scale-100 opacity-100'}`}
      >
        <Bot className="w-7 h-7" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500 border-2 border-slate-900"></span>
        </span>
      </button>

    </div>
  );
}