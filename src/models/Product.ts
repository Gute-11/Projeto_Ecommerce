// Classe Product para representar produtos
export class Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  category: string;
  createdAt: Date;

  constructor(data: {
    id: string;
    name: string;
    description?: string;
    price: number;
    stock: number;
    image_url?: string;
    category?: string;
    created_at?: string;
  }) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description || '';
    this.price = Number(data.price);
    this.stock = data.stock;
    this.imageUrl = data.image_url || '';
    this.category = data.category || '';
    this.createdAt = data.created_at ? new Date(data.created_at) : new Date();
  }

  // Verifica se o produto está disponível em estoque
  isAvailable(): boolean {
    return this.stock > 0;
  }

  // Retorna o preço formatado em BRL
  getFormattedPrice(): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(this.price);
  }

  // Verifica se há estoque suficiente
  hasStock(quantity: number): boolean {
    return this.stock >= quantity;
  }
}
