import { Product } from './Product';

// Classe CartItem para representar itens no carrinho
export class CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  product?: Product;

  constructor(data: {
    id: string;
    cart_id: string;
    product_id: string;
    quantity: number;
    products?: any;
  }) {
    this.id = data.id;
    this.cartId = data.cart_id;
    this.productId = data.product_id;
    this.quantity = data.quantity;
    
    if (data.products) {
      this.product = new Product(data.products);
    }
  }

  // Calcula o subtotal do item (preço x quantidade)
  getSubtotal(): number {
    if (!this.product) return 0;
    return this.product.price * this.quantity;
  }

  // Retorna o subtotal formatado em BRL
  getFormattedSubtotal(): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(this.getSubtotal());
  }

  // Incrementa a quantidade
  incrementQuantity(): void {
    this.quantity++;
  }

  // Decrementa a quantidade (mínimo 1)
  decrementQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }
}
