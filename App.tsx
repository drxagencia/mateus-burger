import React, { useEffect, useState } from 'react';
import { Empresa, CartItem, Item } from './types';
import { getCompanyData } from './services/dataService';
import { getCompanyIdFromUrl } from './constants';
import { ProductBuilder } from './components/ProductBuilder';
import { Cart } from './components/Cart';
import { ShoppingBag, Loader2, ArrowLeft, AlertTriangle, Lock, MapPin, Clock, Info, Search } from 'lucide-react';

const App: React.FC = () => {
  const [company, setCompany] = useState<Empresa | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'menu' | 'cart'>('menu');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [currentCompanyId, setCurrentCompanyId] = useState<string>("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  // 1. Efeito APENAS para Scroll e Fetch Inicial
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    
    const id = getCompanyIdFromUrl();
    setCurrentCompanyId(id);

    getCompanyData()
      .then((data) => {
        setCompany(data);
        setLoading(false);
        if (data?.config) {
          document.title = data.config.nome_fantasia || 'Cardápio Digital';
          const themeColor = data.config.cor_tema || '#0f172a'; // Default slate-900 if missing
          document.documentElement.style.setProperty('--theme-color', themeColor);
        }
      })
      .catch((err) => {
        console.error("Erro ao carregar dados:", err);
        if (err.code === 'PERMISSION_DENIED') {
          setError('PERMISSION_DENIED');
        } else {
          setError('UNKNOWN');
        }
        setLoading(false);
      });

    return () => {
        window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // 2. Efeito para relógio e status
  useEffect(() => {
    if (!company?.config) return;
    const runCheck = () => {
        checkOpeningStatus(company.config.hora_abre, company.config.hora_fecha);
    };
    runCheck();
    const interval = setInterval(runCheck, 60000);
    return () => clearInterval(interval);
  }, [company]);

  const checkOpeningStatus = (openTime?: string, closeTime?: string) => {
    if (!openTime || !closeTime) {
        setIsOpen(true);
        setStatusMessage("Aberto agora");
        return;
    }

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [openH, openM] = openTime.split(':').map(Number);
    const [closeH, closeM] = closeTime.split(':').map(Number);
    
    const startMinutes = openH * 60 + openM;
    const endMinutes = closeH * 60 + closeM;

    let isOpenNow = false;

    if (endMinutes < startMinutes) {
        isOpenNow = currentMinutes >= startMinutes || currentMinutes <= endMinutes;
    } else {
        isOpenNow = currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    }

    setIsOpen(isOpenNow);
    if (isOpenNow) {
        setStatusMessage("Aberto agora");
    } else {
        setStatusMessage(`Abrimos às ${openTime}`);
    }
  };

  const handleAddToCart = (baseItem: Item, extras: Record<string, string[]>, finalPrice: number) => {
    if (!isOpen) {
        alert("Desculpe, estamos fechados no momento.");
        return;
    }

    const newItem: CartItem = {
      id: Math.random().toString(36).substr(2, 9),
      baseItem,
      extras,
      totalPrice: finalPrice,
      quantity: 1
    };

    setCartItems(prev => [...prev, newItem]);
    
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }
  };

  const removeFromCart = (id: string) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center">
          <Loader2 className="w-8 h-8 animate-spin text-theme mb-4" />
          <span className="text-gray-400 text-sm font-medium">Carregando experiência...</span>
        </div>
      </div>
    );
  }

  if (error === 'PERMISSION_DENIED') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-premium p-8 text-center">
           <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="text-red-500 w-6 h-6" />
           </div>
           <h2 className="font-bold text-xl text-gray-900 mb-2">Acesso Restrito</h2>
           <p className="text-gray-500 text-sm">
             As configurações de segurança impedem o acesso.
           </p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-premium p-8 text-center">
           <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="text-gray-400 w-6 h-6" />
           </div>
           <h2 className="font-bold text-xl text-gray-900 mb-2">Empresa não encontrada</h2>
           <p className="text-gray-500 text-sm">ID: {currentCompanyId}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-gray-900 flex flex-col relative">
      
      {/* Background Sutil e Profissional */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-theme opacity-[0.03] rounded-full blur-[120px] translate-x-1/3 -translate-y-1/3"></div>
         <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500 opacity-[0.02] rounded-full blur-[100px] -translate-x-1/3 translate-y-1/3"></div>
      </div>

      {/* Navbar Minimalista */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'glass py-3 shadow-sm' : 'bg-transparent py-6'}`}>
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
             {company.config.logo_url ? (
               <img src={company.config.logo_url} alt="Logo" className="w-10 h-10 rounded-xl object-cover shadow-sm" />
             ) : (
               <div className="w-10 h-10 bg-theme rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-theme/20">
                  {company.config.nome_fantasia?.charAt(0) || 'F'}
               </div>
             )}
             <div className="flex flex-col">
                <h1 className="text-base font-bold text-gray-900 leading-none tracking-tight">
                  {company.config.nome_fantasia}
                </h1>
                
                {/* Status Pill */}
                <div className="flex items-center gap-1.5 mt-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">
                    {statusMessage}
                  </span>
                </div>
             </div>
          </div>

          <button 
            onClick={() => setView(view === 'cart' ? 'menu' : 'cart')}
            className={`
               relative p-2.5 rounded-xl transition-all duration-200 active:scale-95 group
               ${view === 'cart' 
                 ? 'bg-gray-900 text-white shadow-lg' 
                 : 'bg-white text-gray-700 shadow-sm border border-gray-100 hover:border-gray-200'}
            `}
          >
            <ShoppingBag size={20} strokeWidth={2} className={`${view === 'cart' ? '' : 'group-hover:text-theme transition-colors'}`} />
            {cartItems.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                {cartItems.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Hero Section Minimalista */}
      {view === 'menu' && (
        <div className="relative pt-32 pb-8 px-6 z-10">
           <div className="max-w-5xl mx-auto">
             <div className="animate-fade-up">
               <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 mb-6">
                 Faça seu pedido <br/>
                 <span className="text-theme">sem complicação.</span>
               </h2>
               
               <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-gray-100 text-xs font-semibold text-gray-600">
                    <Clock size={14} className="text-theme"/> 30-45 min
                  </div>
                  <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-gray-100 text-xs font-semibold text-gray-600">
                    <MapPin size={14} className="text-theme"/> Entrega Grátis
                  </div>
               </div>
             </div>
           </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 pb-32 relative z-10 flex-grow w-full">
        {view === 'menu' ? (
          <div className="animate-fade-up delay-75">
             {company.cardapio ? (
               <ProductBuilder 
                 cardapio={company.cardapio} 
                 onAddToCart={handleAddToCart} 
               />
             ) : (
               <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <p className="text-gray-400 font-medium">O cardápio está sendo preparado.</p>
               </div>
             )}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto pt-24 animate-fade-up">
             <button 
               className="group flex items-center gap-2 mb-6 text-gray-500 hover:text-gray-900 transition-colors text-sm font-semibold px-0 py-2 w-fit" 
               onClick={() => setView('menu')}
             >
                <div className="bg-white p-1.5 rounded-lg border border-gray-200 group-hover:border-gray-300 transition-all">
                  <ArrowLeft size={16} />
                </div>
                Voltar ao cardápio
             </button>
             
             <div className="flex items-baseline justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Checkout</h2>
                <span className="text-sm text-gray-500 font-medium">{cartItems.length} itens</span>
             </div>
             
             <Cart 
               items={cartItems} 
               companyConfig={company.config}
               onRemoveItem={removeFromCart}
               onClearCart={() => setCartItems([])}
             />
          </div>
        )}
      </main>

      {/* Footer Profissional */}
      <footer className="text-white relative z-20 mt-auto" style={{ backgroundColor: 'var(--theme-color)' }}>
        <div className="max-w-5xl mx-auto px-6 py-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h3 className="text-lg font-bold mb-1">{company.config.nome_fantasia}</h3>
                    <p className="text-white/70 text-sm font-light">Qualidade e sabor em cada detalhe.</p>
                </div>
                
                <div className="flex items-center gap-2 text-xs font-medium text-white/50 bg-white/10 px-3 py-1 rounded-lg">
                    <span>Pedido Seguro</span>
                    <div className="w-1 h-1 bg-white/40 rounded-full"></div>
                    <span>Criptografado</span>
                </div>
            </div>
            
            <div className="border-t border-white/10 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center text-[10px] text-white/40 gap-4 uppercase tracking-wider">
                <p>&copy; {new Date().getFullYear()} {company.config.nome_fantasia}.</p>
                <p>Tecnologia FlexOrder</p>
            </div>
        </div>
      </footer>
      
      {/* Floating Cart Button (Mobile Only) */}
      {view === 'menu' && cartItems.length > 0 && (
        <div className="fixed bottom-6 left-6 right-6 z-50 md:hidden animate-scale-in">
           <button 
             onClick={() => setView('cart')}
             className="w-full text-white p-4 rounded-xl shadow-lg shadow-theme/30 flex items-center justify-between active:scale-[0.98] transition-all"
             style={{ backgroundColor: 'var(--theme-color)' }}
           >
              <div className="flex items-center gap-3">
                 <div className="bg-white/20 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm">
                   {cartItems.length}
                 </div>
                 <span className="font-semibold text-sm">Ver sacola</span>
              </div>
              <span className="font-bold text-base">
                R$ {cartItems.reduce((acc, item) => acc + item.totalPrice, 0).toFixed(2).replace('.', ',')}
              </span>
           </button>
        </div>
      )}
    </div>
  );
};

export default App;