import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Search, User, ArrowRight, Star } from 'lucide-react';
import Navbar from '../components/Navbar';
import AIAssistant from '../components/AIAssistant';
import { useLanguage } from '../context/LanguageContext';

export default function Home() {
  const [doctors, setDoctors] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const navigate = useNavigate();
  const { t, tCat } = useLanguage();

  const categories = ['Tümü', 'Psikolog', 'Diyetisyen', 'Dermatolog', 'Diş Hekimi', 'Dahiliye'];

  const fetchDoctors = async (keyword = '') => {
    const url = keyword 
      ? `http://localhost:8080/api/users/search?keyword=${keyword}`
      : `http://localhost:8080/api/users/providers`;

    try {
      const res = await axios.get(url);
      const doctorsData = res.data;

      const doctorsWithRatings = await Promise.all(
        doctorsData.map(async (doc) => {
          try {
            const avgRes = await axios.get(`http://localhost:8080/api/reviews/provider/${doc.id}/average`);
            const avg = parseFloat(avgRes.data) || 0;
            return { ...doc, averageRating: avg };
          } catch (err) {
            return { ...doc, averageRating: 0 };
          }
        })
      );
      setDoctors(doctorsWithRatings);
    } catch (err) {
      console.error("Doktorlar çekilemedi:", err);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchKeyword(val);
    fetchDoctors(val);
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    if (category === 'Tümü') {
      setSearchKeyword('');
      fetchDoctors('');
    } else {
      setSearchKeyword(category);
      fetchDoctors(category);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1120] flex flex-col relative overflow-hidden font-sans transition-colors duration-300">
      <Navbar />

      <div className="absolute inset-0 z-0 opacity-[0.35] dark:opacity-[0.15] pointer-events-none transition-opacity duration-300">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dotPattern" patternUnits="userSpaceOnUse" width="32" height="32">
              <circle cx="1" cy="1" r="1" className="fill-slate-300 dark:fill-slate-600" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dotPattern)" />
        </svg>
      </div>

      <div className="w-full max-w-6xl mx-auto px-4 pb-20 pt-16 z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-5 leading-tight transition-colors">
            {t('home.title1')} <br className="md:hidden" />
            <span className="text-blue-600 dark:text-blue-400 underline decoration-blue-200 dark:decoration-blue-900/50 underline-offset-8">{t('home.title2')}</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg font-medium leading-relaxed transition-colors">
            {t('home.subtitle')}
          </p>
        </div>

        <div className="max-w-2xl mx-auto relative mb-12 shadow-sm rounded-2xl group">
          <Search className="absolute left-5 top-4 h-5 w-5 text-gray-400 dark:text-slate-500 group-focus-within:text-slate-900 dark:group-focus-within:text-white transition-colors" />
          <input
            type="text"
            placeholder={t('home.search')}
            value={searchKeyword}
            onChange={handleSearchChange}
            className="w-full pl-14 pr-4 py-4 bg-white dark:bg-slate-900/80 backdrop-blur-sm border border-gray-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-slate-900 dark:focus:ring-blue-500 focus:border-slate-900 dark:focus:border-blue-500 text-slate-900 dark:text-white font-bold placeholder-gray-400 dark:placeholder-slate-500 transition-all outline-none shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          />
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all border ${
                selectedCategory === cat
                  ? 'bg-slate-900 dark:bg-blue-600 text-white border-slate-900 dark:border-blue-600 shadow-lg shadow-slate-900/20 dark:shadow-blue-900/20 scale-105'
                  : 'bg-white dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-gray-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat === 'Tümü' ? t('cat.all') : tCat(cat)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {doctors.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-white dark:bg-slate-900/80 backdrop-blur-sm rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm transition-colors">
              <p className="text-slate-900 dark:text-white font-black text-xl mb-2">{t('home.notfound')}</p>
              <p className="text-slate-500 dark:text-slate-400 font-medium">{t('home.tryagain')}</p>
            </div>
          ) : (
            doctors.map((doc) => (
              <div key={doc.id} className="bg-white dark:bg-slate-900/80 backdrop-blur-sm rounded-3xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] dark:shadow-none border border-gray-200/60 dark:border-slate-800/80 p-7 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 group">
                <div>
                  <div className="flex items-start gap-4 mb-6">
                    {doc.avatarUrl ? (
                      <img 
                        src={`http://localhost:8080/uploads/${doc.avatarUrl}`} 
                        alt={doc.fullName} 
                        className="w-16 h-16 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-md shadow-slate-900/5 dark:shadow-black/20 shrink-0 transform group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="bg-gradient-to-br from-slate-800 to-slate-950 dark:from-slate-700 dark:to-slate-800 p-5 rounded-2xl text-white shadow-md shadow-slate-900/20 dark:shadow-black/20 shrink-0 transform group-hover:scale-105 transition-transform duration-300 flex items-center justify-center w-16 h-16">
                        <User className="w-6 h-6" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{doc.fullName}</h3>
                      
                      <div className="flex flex-wrap items-center gap-2 mt-2.5">
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200/50 dark:border-slate-700/50 transition-colors">
                          {tCat(doc.specialty) || t('home.general')}
                        </span>
                        
                        <span className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-3 py-1.5 rounded-lg border border-amber-100/50 dark:border-amber-800/50 transition-colors">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          {doc.averageRating > 0 ? doc.averageRating.toFixed(1) : t('home.new')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-3 mb-8 font-medium leading-relaxed transition-colors">
                    {doc.bio || 'Uzman doktorumuz hakkında detaylı bilgi ve randevu takvimi için lütfen ilerleyin.'}
                  </p>
                </div>

                <button
                  onClick={() => navigate(`/book/${doc.id}`)}
                  className="w-full bg-white dark:bg-slate-800 hover:bg-slate-900 dark:hover:bg-blue-600 text-slate-900 dark:text-white hover:text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 border border-slate-200 dark:border-slate-700 hover:border-slate-900 dark:hover:border-blue-600 hover:shadow-lg hover:shadow-slate-900/20 dark:hover:shadow-blue-900/20"
                >
                  {t('home.view')} <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </button>
              </div>
            ))
          )}
        </div>

      </div>
      <AIAssistant />
    </div>
  );
}