export interface Item {
  nome: string;
  disponivel: boolean;
  preco?: number; 
  descricao?: string;
  imagem?: string; // Mantido para compatibilidade
  img_url?: string; // Novo campo correspondente ao JSON
  // Flags de controle de customização
  sabores_recheios?: boolean;
  adicionais?: boolean;
}

// Interface para um objeto de categoria que contem itens indexados (ex: "1", "2") e metadados
export interface CategoriaData {
  nome_categoria: string;
  [key: string]: any; // Pode conter itens (Item) ou strings
}

export interface Cardapio {
  // Agora temos um objeto de categorias
  categorias?: Record<string, CategoriaData>;
  
  // Listas de extras continuam na raiz para uso geral (customização)
  adicionais?: Item[];
  recheios?: Item[];
  sabores?: Item[];
  // Fallback
  [key: string]: any; 
}

export interface Config {
  email_dono: string;
  nome_fantasia?: string;
  cor_tema?: string;
  logo_url?: string;
  whatsapp_number?: string;
  hora_abre?: string; // Ex: "15:00"
  hora_fecha?: string; // Ex: "23:59"
}

export interface PedidoItem {
  produto: string; 
  quantidade: number;
  extras: string[]; 
  preco_unitario: number;
  total_item: number;
}

export interface Pedido {
  cliente: {
    nome: string;
    whatsapp: string; // Adicionado campo obrigatório
  };
  data_hora: string;
  endereco: {
    bairro: string;
    rua: string;
    referencia: string;
  };
  itens: PedidoItem[];
  pagamento: {
    metodo: string;
    troco?: string; // Adicionado opcional
    troco_para?: string; // Adicionado opcional
  };
  status: string;
  total_pedido: number;
}

export interface Empresa {
  config: Config;
  cardapio?: Cardapio;
  pedidos?: Record<string, Pedido>;
}

export interface Database {
  empresas: Record<string, Empresa>;
}

export interface CartItem {
  id: string;
  baseItem: Item;
  extras: Record<string, string[]>; 
  totalPrice: number;
  quantity: number;
}