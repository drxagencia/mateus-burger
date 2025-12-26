// --- CONFIGURAÇÃO PRINCIPAL ---

// O ID da empresa que será carregado do banco de dados.
// Deve ser IGUAL à chave no seu JSON (ex: "universo_acai")
export const DEFAULT_COMPANY_ID = "universo_acai";

export const getCompanyIdFromUrl = (): string => {
  // Retorna SEMPRE o ID configurado acima, ignorando a URL do site.
  // Isso garante que carregue "universo_acai" mesmo estando em "reyssin.vercel.app"
  return DEFAULT_COMPANY_ID;
  
  /* 
  Lógica antiga (Desativada para forçar o uso da constante):
  
  const hostname = window.location.hostname;
  if (hostname.includes('localhost')) return DEFAULT_COMPANY_ID;
  if (hostname.includes('.vercel.app')) {
    return hostname.split('.')[0].replace(/-/g, '_');
  }
  return DEFAULT_COMPANY_ID;
  */
};