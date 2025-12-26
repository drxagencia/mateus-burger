import React, { useState } from 'react';
import { CartItem, Config, Pedido } from '../types';
import { Button } from './Button';
import { Trash2, ShoppingBag, Send, CreditCard, Banknote, MapPin, User, Home, Map, Flag, CheckCircle, Smartphone, AlertCircle } from 'lucide-react';
import { sendOrder } from '../services/dataService';

interface CartProps {
  items: CartItem[];
  companyConfig: Config;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
}

export const Cart: React.FC<CartProps> = ({ items, companyConfig, onRemoveItem, onClearCart }) => {
  const [formData, setFormData] = useState({
    nome: '',
    whatsapp: '',
    bairro: '',
    rua: '',
    referencia: '',
    metodoPagamento: 'Pix',
    precisaTroco: false,
    trocoPara: ''
  });
  const [isSending, setIsSending] = useState(false);
  const [orderSent, setOrderSent] = useState(false);

  const total = items.reduce((acc, item) => acc + item.totalPrice, 0);

  const isPhoneValid = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 11) return false;
    if (cleanPhone[2] !== '9') return false; 
    return true;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    if (val.length <= 11) {
      setFormData({ ...formData, whatsapp: val });
    }
  };

  const handleSendOrder = async () => {
    setIsSending(true);

    const pagamentoInfo: any = {
        metodo: formData.metodoPagamento
    };

    if (formData.metodoPagamento === 'Dinheiro') {
        if (formData.precisaTroco && formData.trocoPara) {
            pagamentoInfo.troco = 'Sim';
            pagamentoInfo.troco_para = formData.trocoPara;
        } else {
            pagamentoInfo.troco = 'Não';
        }
    }

    const pedido: Pedido = {
      cliente: {
        nome: formData.nome,
        whatsapp: formData.whatsapp
      },
      data_hora: new Date().toLocaleString('pt-BR'),
      endereco: {
        bairro: formData.bairro,
        rua: formData.rua,
        referencia: formData.referencia
      },
      itens: items.map(item => ({
        produto: item.baseItem.nome,
        quantidade: item.quantity,
        extras: Object.values(item.extras).flat(),
        preco_unitario: item.baseItem.preco || 0,
        total_item: item.totalPrice
      })),
      pagamento: pagamentoInfo,
      status: 'pendente',
      total_pedido: total
    };

    const success = await sendOrder(pedido);

    if (success) {
      setOrderSent(true);
      setTimeout(() => {
        onClearCart();
      }, 3000);
    } else {
      alert("Houve um erro ao enviar seu pedido. Tente novamente.");
      setIsSending(false);
    }
  };

  if (orderSent) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-scale-in">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 ring-1 ring-green-100">
          <CheckCircle size={40} className="text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Pedido Recebido!</h3>
        <p className="text-gray-500 max-w-xs mx-auto text-sm">
          Seu pedido foi enviado para {companyConfig.nome_fantasia}.
        </p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-up">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <ShoppingBag size={32} className="text-gray-300" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Sacola vazia</h3>
        <p className="text-gray-400 text-sm">Adicione itens deliciosos ao seu pedido.</p>
      </div>
    );
  }

  const isBasicInfoValid = formData.nome.length > 2 && formData.bairro.length > 2 && formData.rua.length > 3 && formData.referencia.length > 2;
  const isWhatsappValid = isPhoneValid(formData.whatsapp);
  
  const isTrocoValid = () => {
      if (formData.metodoPagamento !== 'Dinheiro') return true;
      if (!formData.precisaTroco) return true;
      const valTroco = parseFloat(formData.trocoPara.replace(',', '.'));
      return valTroco > total;
  };

  const isFormValid = isBasicInfoValid && isWhatsappValid && isTrocoValid();

  const InputField = ({ label, icon: Icon, error, ...props }: any) => (
    <div className="group">
      <label className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">
        <Icon size={12} /> {label} <span className="text-red-500">*</span>
      </label>
      <input 
        {...props}
        className={`
            w-full p-3.5 bg-gray-50 rounded-xl border-2 outline-none transition-all font-medium text-sm text-gray-800 placeholder-gray-400
            ${error 
                ? 'border-red-100 bg-red-50/50 focus:border-red-300' 
                : 'border-transparent hover:bg-gray-100 focus:bg-white focus:border-theme focus:shadow-sm'}
        `}
      />
      {error && <p className="text-[10px] text-red-500 mt-1 ml-1 font-medium">{error}</p>}
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      
      {/* Items List */}
      <div className="w-full lg:flex-1 space-y-3">
        {items.map((item, idx) => (
          <div 
            key={item.id} 
            className="group bg-white p-4 rounded-2xl shadow-card border border-gray-100 flex justify-between items-start animate-fade-up"
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            <div className="flex items-start gap-4">
               <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-theme font-bold text-sm shrink-0">
                 {item.quantity}x
               </div>
               <div>
                  <h4 className="font-bold text-gray-900 text-sm leading-tight">{item.baseItem.nome}</h4>
                  <div className="text-xs text-gray-500 mt-1.5 space-y-1">
                    {Object.entries(item.extras).map(([cat, vals]) => {
                       const extrasList = vals as string[];
                       return extrasList.length > 0 && (
                         <p key={cat} className="flex flex-wrap gap-1">
                           {extrasList.map(v => (
                             <span key={v} className="after:content-[','] last:after:content-[''] mr-1">
                               {v}
                             </span>
                           ))}
                         </p>
                       );
                    })}
                  </div>
                  <p className="mt-2 font-bold text-gray-900 text-sm">R$ {item.totalPrice.toFixed(2).replace('.', ',')}</p>
               </div>
            </div>
            
            <button 
              onClick={() => onRemoveItem(item.id)}
              className="text-gray-300 hover:text-red-500 p-2 rounded-lg transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Checkout Form */}
      <div className="w-full lg:w-[400px] lg:sticky lg:top-24 animate-fade-up delay-100">
        <div className="bg-white p-6 rounded-3xl shadow-premium border border-gray-100/50">
          
          <h3 className="text-lg font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">
             Dados de Entrega
          </h3>
          
          <div className="space-y-4">
            <InputField 
                label="Nome" 
                icon={User} 
                placeholder="Seu nome"
                value={formData.nome}
                onChange={(e: any) => setFormData({...formData, nome: e.target.value})}
            />

            <InputField 
                label="WhatsApp" 
                icon={Smartphone} 
                placeholder="Somente números"
                type="tel"
                inputMode="numeric"
                value={formData.whatsapp}
                onChange={handlePhoneChange}
                error={formData.whatsapp.length > 0 && !isWhatsappValid ? "Formato inválido (11 dígitos)" : null}
            />
            
            <div className="grid grid-cols-1 gap-4">
                <InputField 
                    label="Bairro" 
                    icon={Map} 
                    placeholder="Ex: Centro"
                    value={formData.bairro}
                    onChange={(e: any) => setFormData({...formData, bairro: e.target.value})}
                />

                <InputField 
                    label="Rua e Número" 
                    icon={Home} 
                    placeholder="Rua das Flores, 123"
                    value={formData.rua}
                    onChange={(e: any) => setFormData({...formData, rua: e.target.value})}
                />

                <InputField 
                    label="Referência" 
                    icon={Flag} 
                    placeholder="Próximo ao mercado..."
                    value={formData.referencia}
                    onChange={(e: any) => setFormData({...formData, referencia: e.target.value})}
                />
            </div>

            <div className="pt-4">
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Pagamento</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'Pix', icon: <span className="font-bold text-[10px]">PIX</span> }, 
                  { id: 'Dinheiro', icon: <Banknote size={16}/> }, 
                  { id: 'Cartão', icon: <CreditCard size={16}/> }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                        setFormData({...formData, metodoPagamento: opt.id, precisaTroco: false, trocoPara: ''});
                    }}
                    className={`p-3 rounded-xl text-xs font-semibold border transition-all duration-200 flex flex-col items-center gap-1.5 ${
                      formData.metodoPagamento === opt.id
                        ? 'bg-gray-900 border-gray-900 text-white shadow-md'
                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {opt.icon}
                    <span>{opt.id}</span>
                  </button>
                ))}
              </div>
            </div>

            {formData.metodoPagamento === 'Dinheiro' && (
                <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100 animate-scale-in">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-orange-800">Precisa de troco?</span>
                        <div className="flex bg-white rounded-lg p-1 border border-orange-100 shadow-sm">
                             <button 
                                onClick={() => setFormData({...formData, precisaTroco: false, trocoPara: ''})}
                                className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${!formData.precisaTroco ? 'bg-orange-100 text-orange-700' : 'text-gray-400'}`}
                             >
                                Não
                             </button>
                             <button 
                                onClick={() => setFormData({...formData, precisaTroco: true})}
                                className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${formData.precisaTroco ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-400'}`}
                             >
                                Sim
                             </button>
                        </div>
                    </div>
                    
                    {formData.precisaTroco && (
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400 font-bold text-xs">R$</span>
                            <input 
                                type="number"
                                className="w-full pl-8 pr-4 py-2.5 bg-white rounded-lg border border-orange-200 focus:border-orange-500 outline-none text-orange-900 text-sm font-bold placeholder-orange-200"
                                placeholder="Troco para..."
                                value={formData.trocoPara}
                                onChange={(e) => setFormData({...formData, trocoPara: e.target.value})}
                            />
                        </div>
                    )}
                </div>
            )}

          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="flex justify-between items-end mb-6">
                 <span className="text-gray-500 text-sm font-medium">Total a pagar</span>
                 <span className="text-2xl font-bold text-gray-900">R$ {total.toFixed(2).replace('.', ',')}</span>
              </div>

              <Button 
                fullWidth 
                variant="primary"
                disabled={!isFormValid || isSending}
                onClick={handleSendOrder}
                className={`
                  py-4 rounded-xl shadow-lg shadow-theme/20 flex justify-center items-center gap-2
                  ${(!isFormValid || isSending) ? 'opacity-50 cursor-not-allowed bg-gray-300 shadow-none' : 'hover:-translate-y-0.5'}
                `}
              >
                <span className="font-bold">{isSending ? 'Enviando...' : 'Confirmar Pedido'}</span>
                {!isSending && <Send size={18} />}
              </Button>
          </div>
        </div>
      </div>
    </div>
  );
};