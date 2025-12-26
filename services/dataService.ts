import { ref, get, child, push, set } from 'firebase/database';
import { db } from './firebase';
import { getCompanyIdFromUrl } from '../constants';
import { Empresa, Pedido } from '../types';

// MUDANÇA: Alterado de v1 para v2 para invalidar o cache antigo imediatamente
const CACHE_PREFIX = 'flexorder_cache_v2_';
const CACHE_EXPIRATION_MS = 15 * 60 * 1000; // 15 Minutos de cache

export const getCompanyData = async (): Promise<Empresa | null> => {
  const companyId = getCompanyIdFromUrl();
  const cacheKey = `${CACHE_PREFIX}${companyId}`;
  
  // 1. Tenta recuperar do Cache Local antes de ir ao Firebase
  try {
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      const isExpired = Date.now() - timestamp > CACHE_EXPIRATION_MS;
      
      if (!isExpired) {
        console.log(`[CACHE] Carregando dados locais para: ${companyId}`);
        return data as Empresa;
      } else {
        console.log(`[CACHE] Dados expirados para: ${companyId}, buscando novos...`);
      }
    }
  } catch (e) {
    console.warn("Erro ao ler cache local", e);
  }

  console.log(`[FIREBASE] Baixando dados frescos para: ${companyId}`);
  
  const dbRef = ref(db);

  try {
    // Baixa Config e Cardapio em paralelo
    const [configSnap, cardapioSnap] = await Promise.all([
      get(child(dbRef, `empresas/${companyId}/config`)),
      get(child(dbRef, `empresas/${companyId}/cardapio`))
    ]);

    if (configSnap.exists()) {
      const empresaData: Empresa = {
        config: configSnap.val(),
        cardapio: cardapioSnap.exists() ? cardapioSnap.val() : undefined,
        pedidos: {} // Mantemos vazio para não pesar
      };

      // 2. Salva no Cache Local para o futuro
      try {
        localStorage.setItem(cacheKey, JSON.stringify({
          timestamp: Date.now(),
          data: empresaData
        }));
      } catch (e) {
        console.warn("Não foi possível salvar no cache (provavelmente quota excedida)", e);
      }

      return empresaData;
    } else {
      console.error(`Config not found for company ID: ${companyId}`);
      return null;
    }
  } catch (error) {
    console.error("Erro ao buscar dados da empresa:", error);
    return null;
  }
};

export const sendOrder = async (pedido: Pedido): Promise<boolean> => {
  const companyId = getCompanyIdFromUrl();
  try {
    const pedidosRef = ref(db, `empresas/${companyId}/pedidos`);
    const newPedidoRef = push(pedidosRef);
    await set(newPedidoRef, pedido);
    return true;
  } catch (error) {
    console.error("Erro ao enviar pedido:", error);
    return false;
  }
};