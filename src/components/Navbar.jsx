import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Calendar, User, Activity, MessageSquare, Crown, Menu, X, Sun, Moon, Globe } from 'lucide-react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { toast } from 'react-toastify';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const { lang, setLang, t } = useLanguage();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (user) {
      const stompClient = new Client({
        webSocketFactory: () => new SockJS('http://localhost:8080/ws-notify'),
        onConnect: () => {
          stompClient.subscribe(`/topic/notifications/${user.id}`, (message) => {
            toast.info(message.body, {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              theme: theme === 'dark' ? 'dark' : 'colored',
            });
          });
        },
      });
      stompClient.activate();

      return () => {
        stompClient.deactivate();
      };
    }
  }, [user, theme]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setIsMobileMenuOpen(false);
    navigate('/login');
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <nav className="w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-gray-200 dark:border-slate-800 sticky top-0 z-50 transition-all shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-slate-900 dark:bg-blue-600 p-2.5 rounded-xl group-hover:bg-slate-800 transition-all shadow-md">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-xl sm:text-2xl text-slate-900 dark:text-white tracking-tight">
              Schedulify<span className="text-blue-600 dark:text-blue-400">Pro</span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-5">
            
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <Globe className="w-4 h-4 text-slate-500 ml-2" />
              <select 
                value={lang} 
                onChange={(e) => setLang(e.target.value)}
                className="bg-transparent text-sm font-bold text-slate-600 dark:text-slate-300 outline-none cursor-pointer py-1.5 pr-2 rounded-lg"
              >
                <option value="tr">TR</option>
                <option value="en">EN</option>
                <option value="ar">AR</option>
              </select>
            </div>

            <button 
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-amber-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            {user ? (
              <>
                <Link to="/messages" className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-bold transition-colors">
                  <div className="relative">
                    <MessageSquare className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-white"></span>
                    </span>
                  </div>
                  <span className="text-sm">{t('nav.messages')}</span>
                </Link>

                <div className="h-8 w-px bg-gray-200 dark:bg-slate-800"></div>

                <div className="flex items-center gap-3">
                  <div className="flex flex-col text-right">
                    <div className="flex items-center gap-1.5 justify-end">
                      <span className="text-sm font-black text-slate-900 dark:text-white">{user.fullName}</span>
                      {user.vip && <Crown className="w-4 h-4 text-amber-500 fill-amber-500 drop-shadow-sm" />}
                    </div>
                    <span className="text-xs font-bold text-gray-500 dark:text-slate-400 tracking-wide">
                      {user.role === 'ROLE_PROVIDER' ? 'Uzman Doktor' : user.role === 'ROLE_ADMIN' ? 'Sistem Yöneticisi' : user.vip ? 'VIP Hasta' : 'Hasta'}
                    </span>
                  </div>
                  {user.avatarUrl ? (
                    <img 
                      src={`http://localhost:8080/uploads/${user.avatarUrl}`} 
                      alt="Profile" 
                      className={`w-10 h-10 rounded-full object-cover border-2 ${user.vip ? 'border-amber-400' : 'border-slate-200 dark:border-slate-700'}`}
                    />
                  ) : (
                    <div className={`w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border-2 ${user.vip ? 'border-amber-400 text-amber-500' : 'border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500'} flex items-center justify-center`}>
                      <User className="w-5 h-5" />
                    </div>
                  )}
                </div>

                {!user.vip && user.role === 'ROLE_CLIENT' && (
                  <Link to="/pricing" className="flex items-center gap-1.5 text-xs font-black bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 px-3 py-1.5 rounded-lg shadow-sm hover:shadow-md transition-all">
                    <Crown className="w-3.5 h-3.5 fill-slate-900" /> {t('nav.premium')}
                  </Link>
                )}

                {user.role === 'ROLE_PROVIDER' ? (
                  <Link to="/dashboard" className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800">
                    <User className="w-4 h-4" /> {t('nav.dashboard')}
                  </Link>
                ) : user.role === 'ROLE_ADMIN' ? (
                  <Link to="/admin-dashboard" className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800">
                    <Activity className="w-4 h-4" /> {t('nav.admin')}
                  </Link>
                ) : (
                  <Link to="/my-appointments" className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800">
                    <Calendar className="w-4 h-4" /> {t('nav.appointments')}
                  </Link>
                )}

                <div className="h-8 w-px bg-gray-200 dark:bg-slate-800 mx-1"></div>
                
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-sm font-bold text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 px-4 py-2 rounded-xl transition-all"
                >
                  <LogOut className="w-4 h-4" /> {t('nav.logout')}
                </button>
              </>
            ) : (
              <>
                <Link to="/pricing" className="text-sm font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors px-3 py-2 flex items-center gap-1">
                  <Crown className="w-4 h-4 fill-amber-500" /> {t('nav.pricing')}
                </Link>
                <Link to="/login" className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors px-3 py-2 border-l border-gray-200 dark:border-slate-800 ml-2 pl-4">
                  {t('nav.login')}
                </Link>
                <Link to="/register" className="text-sm font-bold bg-slate-900 dark:bg-blue-600 text-white hover:bg-slate-800 dark:hover:bg-blue-700 hover:shadow-lg hover:shadow-slate-900/20 px-5 py-2.5 rounded-xl transition-all active:scale-95">
                  {t('nav.register')}
                </Link>
              </>
            )}
          </div>

          <div className="lg:hidden flex items-center gap-3">
            <select 
              value={lang} 
              onChange={(e) => setLang(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 text-sm font-bold text-slate-600 dark:text-slate-300 outline-none p-1.5 rounded-lg"
            >
              <option value="tr">TR</option>
              <option value="en">EN</option>
              <option value="ar">AR</option>
            </select>
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-amber-400"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white focus:outline-none p-2"
            >
              {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>

        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 shadow-xl absolute w-full left-0 top-20 flex flex-col p-4 gap-2 animate-fade-in z-50">
          {user ? (
            <>
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl mb-2">
                {user.avatarUrl ? (
                  <img src={`http://localhost:8080/uploads/${user.avatarUrl}`} alt="Profile" className="w-12 h-12 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 flex items-center justify-center">
                    <User className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-slate-900 dark:text-white">{user.fullName}</span>
                    {user.vip && <Crown className="w-4 h-4 text-amber-500 fill-amber-500" />}
                  </div>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{user.email}</span>
                </div>
              </div>

              <Link onClick={() => setIsMobileMenuOpen(false)} to="/messages" className="flex items-center gap-3 font-bold text-slate-600 dark:text-slate-300 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl">
                <MessageSquare className="w-5 h-5" /> {t('nav.messages')}
              </Link>

              {user.role === 'ROLE_PROVIDER' ? (
                <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard" className="flex items-center gap-3 font-bold text-slate-600 dark:text-slate-300 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl">
                  <User className="w-5 h-5" /> {t('nav.dashboard')}
                </Link>
              ) : user.role === 'ROLE_ADMIN' ? (
                <Link onClick={() => setIsMobileMenuOpen(false)} to="/admin-dashboard" className="flex items-center gap-3 font-bold text-slate-600 dark:text-slate-300 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl">
                  <Activity className="w-5 h-5" /> {t('nav.admin')}
                </Link>
              ) : (
                <Link onClick={() => setIsMobileMenuOpen(false)} to="/my-appointments" className="flex items-center gap-3 font-bold text-slate-600 dark:text-slate-300 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl">
                  <Calendar className="w-5 h-5" /> {t('nav.appointments')}
                </Link>
              )}

              {!user.vip && user.role === 'ROLE_CLIENT' && (
                <Link onClick={() => setIsMobileMenuOpen(false)} to="/pricing" className="flex items-center gap-3 font-bold text-amber-700 bg-amber-50 dark:bg-amber-950/20 p-3 rounded-xl">
                  <Crown className="w-5 h-5 fill-amber-500 text-amber-500" /> {t('nav.premium')}
                </Link>
              )}

              <button onClick={handleLogout} className="flex items-center gap-3 font-bold text-red-600 p-3 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl w-full text-left">
                <LogOut className="w-5 h-5" /> {t('nav.logout')}
              </button>
            </>
          ) : (
            <>
              <Link onClick={() => setIsMobileMenuOpen(false)} to="/pricing" className="flex items-center gap-3 font-bold text-amber-600 dark:text-amber-400 p-3 hover:bg-amber-50 dark:hover:bg-slate-800 rounded-xl">
                <Crown className="w-5 h-5 fill-amber-500 text-amber-500" /> {t('nav.pricing')}
              </Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} to="/login" className="flex items-center gap-3 font-bold text-slate-600 dark:text-slate-300 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl">
                {t('nav.login')}
              </Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} to="/register" className="flex items-center justify-center gap-3 font-bold bg-slate-900 dark:bg-blue-600 text-white p-3 rounded-xl text-center">
                {t('nav.register')}
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}