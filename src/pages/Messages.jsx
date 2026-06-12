import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Send, Search, User, Info, ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useLanguage } from '../context/LanguageContext';

export default function Messages() {
  const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [stompClient, setStompClient] = useState(null);
  const messagesEndRef = useRef(null);
  const { t } = useLanguage();

  useEffect(() => {
    if (!currentUser) {
      window.location.href = '/login';
      return;
    }

    axios.get(`http://localhost:8080/api/users/${currentUser.id}/contacts`)
      .then(res => {
        setContacts(res.data);
        setFilteredContacts(res.data);
      })
      .catch(err => console.error(err));

    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      onConnect: () => {
        client.subscribe(`/user/${currentUser.id}/queue/messages`, (msg) => {
          const receivedMessage = JSON.parse(msg.body);
          setMessages(prev => [...prev, receivedMessage]);
        });
      },
      onStompError: (frame) => console.error(frame)
    });

    client.activate();
    setStompClient(client);

    return () => {
      client.deactivate();
    };
  }, [currentUser]);

  useEffect(() => {
    if (selectedContact) {
      axios.get(`http://localhost:8080/api/messages/${currentUser.id}/${selectedContact.id}`)
        .then(res => setMessages(res.data))
        .catch(err => console.error(err));
    }
  }, [selectedContact, currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const results = contacts.filter(contact =>
      contact.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredContacts(results);
  }, [searchTerm, contacts]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && stompClient && selectedContact) {
      const chatMessage = {
        senderId: currentUser.id,
        recipientId: selectedContact.id,
        content: newMessage,
        timestamp: new Date()
      };
      
      stompClient.publish({
        destination: '/app/chat',
        body: JSON.stringify(chatMessage),
      });

      setMessages(prev => [...prev, chatMessage]);
      setNewMessage('');
    }
  };

  return (
    <div className="h-screen bg-slate-50 dark:bg-[#0b1120] flex flex-col font-sans transition-colors duration-300">
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto p-4 flex gap-4 h-[calc(100vh-80px)]">
        
        {/* Sol Menü (Kişiler) */}
        <div className={`w-full md:w-80 bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-gray-200 dark:border-slate-800 flex flex-col transition-colors ${selectedContact ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-6 pb-4">
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-4 transition-colors">{t('msg.title')}</h2>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-4 top-3.5" />
              <input 
                type="text" 
                placeholder={t('msg.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white pl-10 pr-4 py-3 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 transition-all border border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-blue-200 dark:focus:border-blue-800"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1">
            {filteredContacts.map(contact => (
              <div 
                key={contact.id} 
                onClick={() => setSelectedContact(contact)}
                className={`flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition-all ${
                  selectedContact?.id === contact.id ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/50' : 'hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-700 flex items-center justify-center font-black text-slate-700 dark:text-slate-300 shadow-sm shrink-0">
                  {contact.fullName.charAt(0)}
                </div>
                <div className="overflow-hidden">
                  <h3 className="font-bold text-slate-900 dark:text-white truncate text-sm transition-colors">{contact.fullName}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-medium mt-0.5 transition-colors">
                    {contact.role === 'ROLE_PROVIDER' ? (contact.specialty || t('home.general')) : t('msg.patient')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sağ Menü (Mesajlaşma) */}
        <div className={`flex-1 bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-gray-200 dark:border-slate-800 flex flex-col relative overflow-hidden transition-colors ${!selectedContact ? 'hidden md:flex' : 'flex'}`}>
          <div className="absolute inset-0 z-0 opacity-5 dark:opacity-10 pointer-events-none transition-opacity duration-300">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="hexPattern" patternUnits="userSpaceOnUse" width="40" height="40" patternTransform="scale(0.8) rotate(0)">
                  <path d="M20 0l20 10v20L20 40 0 30V10z" fill="none" stroke="#0f172a" strokeWidth="1.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#hexPattern)" />
            </svg>
          </div>

          {selectedContact ? (
            <>
              <div className="relative z-10 px-6 py-5 border-b border-gray-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center gap-4 transition-colors">
                <button onClick={() => setSelectedContact(null)} className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {selectedContact.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white text-lg transition-colors">{selectedContact.fullName}</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Çevrimiçi</span>
                  </div>
                </div>
              </div>

              <div className="relative z-10 flex-1 overflow-y-auto p-6 space-y-6 flex flex-col">
                {messages.map((msg, index) => {
                  const isMine = msg.senderId === currentUser.id;
                  return (
                    <div key={index} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] px-5 py-3.5 rounded-[1.25rem] font-medium text-sm leading-relaxed shadow-sm ${
                        isMine 
                        ? 'bg-slate-900 dark:bg-blue-600 text-white rounded-br-sm' 
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-gray-200 dark:border-slate-700 rounded-bl-sm'
                      }`}>
                        {msg.content}
                        <div className={`text-[10px] mt-1.5 font-bold ${isMine ? 'text-slate-400 dark:text-blue-200' : 'text-slate-400 dark:text-slate-500'} text-right`}>
                          {new Date(msg.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <div className="relative z-10 p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-gray-100 dark:border-slate-800 transition-colors">
                <form onSubmit={sendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Bir mesaj yazın..."
                    className="flex-1 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white px-5 py-4 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-blue-500 transition-all border border-gray-200 dark:border-slate-700"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-blue-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 hover:bg-blue-700 text-white p-4 rounded-2xl transition-all shadow-md active:scale-95 flex items-center justify-center shrink-0"
                  >
                    <Send className="w-5 h-5 ml-1" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-inner border border-gray-100 dark:border-slate-700 transition-colors">
                <Info className="w-8 h-8 text-slate-300 dark:text-slate-500" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 transition-colors">{t('msg.placeholder_title')}</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm transition-colors">
                {t('msg.placeholder_desc')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}