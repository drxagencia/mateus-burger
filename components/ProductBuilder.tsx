import React, { useState } from 'react';
import { Cardapio, Item } from '../types';
import { Plus, Check, X, ChevronRight, ShoppingBag, Info } from 'lucide-react';
import { Button } from './Button';

interface ProductBuilderProps {
  cardapio: Cardapio;
  onAddToCart: (item: Item, extras: Record<string, string[]>, finalPrice: number) => void;
}

export const ProductBuilder: React.FC<ProductBuilderProps> = ({ cardapio, onAddToCart }) => {
  const [selectedProduct, setSelectedProduct] = useState<Item | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selections, setSelections] = useState<Record<string, string[]>>({});

  const getItemImage = (item: Item) => {
      if (item.img_url && item.img_url.length > 5) return item.img_url;
      if (item.imagem && item.imagem.length > 5) return item.imagem;
      return null;
  };

  const categoryKeys = cardapio.categorias ? Object.keys(cardapio.categorias) : [];

  const customizationKeys = Object.keys(cardapio).filter(key => 
    key !== 'categorias' && 
    key !== 'itens' && 
    Array.isArray(cardapio[key]) && 
    cardapio[key]!.length > 0
  );

  const needsCustomization = (item: Item): boolean => {
    return !!(item.sabores_recheios || item.adicionais);
  };

  const handleProductClick = (item: Item) => {
    if (needsCustomization(item)) {
      setSelectedProduct(item);
      setSelections({});
      setIsModalOpen(true);
    } else {
      onAddToCart(item, {}, item.preco || 0);
    }
  };

  const toggleSelection = (customizationType: string, item: Item) => {
    setSelections(prev => {
      const current = prev[customizationType] || [];
      const isSelected = current.includes(item.nome);
      
      if (isSelected) {
        return { ...prev, [customizationType]: current.filter(n => n !== item.nome) };
      } else {
        return { ...prev, [customizationType]: [...current, item.nome] };
      }
    });
  };

  const calculateTotal = () => {
    if (!selectedProduct) return 0;
    let total = selectedProduct.preco || 0;
    
    customizationKeys.forEach(catKey => {
      if (!shouldShowSection(catKey)) return;
      const selectedNames = selections[catKey] || [];
      const catItems = cardapio[catKey] as Item[] || [];
      selectedNames.forEach(name => {
        const extraItem = catItems.find(i => i && i.nome === name);
        if (extraItem?.preco) {
          total += extraItem.preco;
        }
      });
    });
    return total;
  };

  const shouldShowSection = (sectionKey: string) => {
    if (!selectedProduct) return false;
    if (sectionKey === 'sabores' || sectionKey === 'recheios') return !!selectedProduct.sabores_recheios;
    if (sectionKey === 'adicionais') return !!selectedProduct.adicionais;
    return true;
  };

  const confirmCustomization = () => {
    if (selectedProduct) {
      onAddToCart(selectedProduct, selections, calculateTotal());
      setIsModalOpen(false);
      setSelectedProduct(null);
    }
  };

  if (categoryKeys.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm mx-auto max-w-lg">
        <div className="bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="text-gray-300 w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">Cardápio vazio</h3>
        <p className="text-sm text-gray-500">Aguarde, novidades estão chegando.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {categoryKeys.map((catKey, sectionIdx) => {
        const categoryData = cardapio.categorias![catKey];
        if (!categoryData) return null;

        const items: Item[] = Object.keys(categoryData)
            .filter(k => k !== 'nome_categoria')
            .map(k => categoryData[k])
            .filter((i): i is Item => i && typeof i === 'object' && i.nome);

        if (items.length === 0) return null;

        return (
          <section key={catKey} className="animate-fade-up" style={{ animationDelay: `${sectionIdx * 100}ms` }}>
            {/* Category Header */}
            <div className="sticky top-[80px] z-30 bg-[#FAFAFA]/95 backdrop-blur-sm py-4 mb-2 border-b border-gray-100/50">
                <h3 className="text-xl font-bold text-gray-900 tracking-tight">
                {categoryData.nome_categoria || catKey}
                </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map((item, idx) => {
                const hasOptions = needsCustomization(item);
                const itemImg = getItemImage(item);
                
                return (
                  <div 
                    key={`${item.nome}-${idx}`}
                    onClick={() => item.disponivel && handleProductClick(item)}
                    className={`
                      group relative bg-white rounded-2xl p-4 border border-gray-100 shadow-card 
                      transition-all duration-300 hover:shadow-premium-hover hover:-translate-y-1 hover:border-gray-200
                      flex gap-4 items-stretch min-h-[120px]
                      ${!item.disponivel ? 'opacity-60 cursor-not-allowed grayscale-[0.8]' : 'cursor-pointer'}
                    `}
                  >
                     {/* Image Container */}
                     <div className="shrink-0 w-28 h-28 relative rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                       {itemImg ? (
                         <img 
                            src={itemImg} 
                            alt={item.nome} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=';
                                (e.target as HTMLImageElement).style.opacity = '0.0';
                            }}
                         />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <ShoppingBag size={20} />
                         </div>
                       )}
                     </div>

                     {/* Content Container */}
                     <div className="flex-1 flex flex-col justify-between py-0.5">
                       <div>
                         <div className="flex justify-between items-start gap-2">
                             <h3 className="font-bold text-gray-900 text-base leading-snug group-hover:text-theme transition-colors line-clamp-2">
                                 {item.nome}
                             </h3>
                         </div>
                         {item.descricao && (
                             <p className="text-gray-500 text-xs mt-1.5 leading-relaxed line-clamp-2 font-medium">
                               {item.descricao}
                             </p>
                         )}
                       </div>
                       
                       <div className="flex items-center justify-between mt-3">
                         <span className="font-bold text-gray-900 text-base">
                           {item.preco !== undefined ? `R$ ${item.preco.toFixed(2).replace('.', ',')}` : 'A partir...'}
                         </span>
                         
                         {item.disponivel && (
                             <div className={`
                                w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200
                                ${hasOptions 
                                    ? 'bg-gray-50 text-theme border border-gray-100 group-hover:bg-theme group-hover:text-white' 
                                    : 'bg-gray-900 text-white group-hover:scale-110 shadow-sm'}
                             `}>
                               {hasOptions ? <ChevronRight size={16} strokeWidth={2.5} /> : <Plus size={16} strokeWidth={2.5} />}
                             </div>
                         )}
                       </div>
                     </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* Professional Customization Modal */}
      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center pointer-events-auto">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity animate-fade-in" onClick={() => setIsModalOpen(false)} />
          
          <div className="bg-white w-full h-[90vh] sm:h-auto sm:max-h-[85vh] sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl relative flex flex-col animate-fade-up overflow-hidden">
            
            {/* Modal Header */}
            <div className="relative shrink-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between z-10">
                <h3 className="font-bold text-gray-900 text-lg truncate pr-4">{selectedProduct.nome}</h3>
                <button 
                    onClick={() => setIsModalOpen(false)}
                    className="w-8 h-8 bg-gray-50 text-gray-500 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                >
                    <X size={18} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-0 bg-[#FAFAFA] no-scrollbar">
               {/* Product Hero in Modal */}
               <div className="bg-white p-6 mb-2 border-b border-gray-100">
                    <div className="flex gap-4">
                        <div className="w-20 h-20 rounded-lg bg-gray-100 shrink-0 overflow-hidden border border-gray-100">
                             {getItemImage(selectedProduct) && (
                                <img src={getItemImage(selectedProduct)!} className="w-full h-full object-cover" alt="" />
                             )}
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm leading-relaxed">{selectedProduct.descricao || "Personalize seu pedido abaixo."}</p>
                            <p className="text-theme font-bold mt-2">R$ {selectedProduct.preco?.toFixed(2).replace('.', ',')}</p>
                        </div>
                    </div>
               </div>

              {customizationKeys.map((customizationType, idx) => {
                if (!shouldShowSection(customizationType)) return null;

                const items = cardapio[customizationType] as Item[] || [];
                const categoryTitle = customizationType.charAt(0).toUpperCase() + customizationType.slice(1).replace(/_/g, ' ');

                return (
                  <section key={customizationType} className="bg-white mb-2 p-5 border-y border-gray-100 sm:border-none sm:mb-4 sm:mx-4 sm:rounded-xl sm:shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide">
                        {categoryTitle}
                        </h3>
                        <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded font-medium">Opcional</span>
                    </div>
                    
                    <div className="space-y-2">
                      {items.map((item) => {
                        if (!item) return null;
                        const selected = selections[customizationType]?.includes(item.nome);
                        const itemImg = getItemImage(item);

                        return (
                          <div
                            key={item.nome}
                            onClick={() => toggleSelection(customizationType, item)}
                            className={`
                              cursor-pointer relative rounded-lg border transition-all duration-200 flex items-center justify-between p-3.5
                              ${selected 
                                ? 'border-theme bg-theme/5' 
                                : 'border-gray-100 bg-white hover:border-gray-300'}
                            `}
                          >
                            <div className="flex items-center gap-3 overflow-hidden w-full">
                              <div className={`
                                w-5 h-5 shrink-0 rounded border flex items-center justify-center transition-colors
                                ${selected ? 'bg-theme border-theme' : 'border-gray-300 bg-white'}
                              `}>
                                 {selected && <Check size={12} className="text-white" strokeWidth={3} />}
                              </div>
                              
                              {/* Imagem do Item (Sabor/Recheio/Adicional) */}
                              {itemImg && (
                                <div className="w-10 h-10 shrink-0 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden">
                                    <img 
                                        src={itemImg} 
                                        alt={item.nome} 
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.currentTarget.parentElement!.style.display = 'none';
                                        }}
                                    />
                                </div>
                              )}

                              <div className="flex flex-col min-w-0">
                                <span className={`text-sm font-medium truncate pr-2 ${selected ? 'text-theme' : 'text-gray-700'}`}>
                                  {item.nome}
                                </span>
                              </div>
                            </div>
                            
                            {item.preco ? (
                                <span className="text-xs font-semibold text-gray-600 whitespace-nowrap pl-2">+ R$ {item.preco.toFixed(2).replace('.', ',')}</span>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>

            <div className="p-4 bg-white border-t border-gray-100 z-20 w-full pb-8 sm:pb-4">
               <div className="flex justify-between items-center mb-4 px-2">
                   <span className="text-sm font-medium text-gray-500">Total do item</span>
                   <span className="text-xl font-bold text-gray-900">R$ {calculateTotal().toFixed(2).replace('.', ',')}</span>
               </div>
               <Button fullWidth onClick={confirmCustomization} className="py-3.5 rounded-xl shadow-lg shadow-theme/20 text-base">
                 Confirmar
               </Button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};