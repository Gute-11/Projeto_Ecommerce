// Classe Order para representar pedidos
export class Order {
  id: string;
  userId: string;
  total: number;
  status: string;
  paymentMethod: string;
  createdAt: Date;
  items?: OrderItem[];

  constructor(data: {
    id: string;
    user_id: string;
    total: number;
    status: string;
    payment_method: string;
    created_at: string;
    order_items?: any[];
  }) {
    this.id = data.id;
    this.userId = data.user_id;
    this.total = Number(data.total);
    this.status = data.status;
    this.paymentMethod = data.payment_method;
    this.createdAt = new Date(data.created_at);
    
    if (data.order_items) {
      this.items = data.order_items.map(item => new OrderItem(item));
    }
  }

  // Retorna o total formatado em BRL
  getFormattedTotal(): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(this.total);
  }

  // Retorna a data formatada
  getFormattedDate(): string {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(this.createdAt);
  }

  // Retorna o status formatado
  getStatusLabel(): string {
    const statusMap: { [key: string]: string } = {
      pending: 'Pendente',
      processing: 'Processando',
      completed: 'Concluído',
      cancelled: 'Cancelado'
    };
    return statusMap[this.status] || this.status;
  }

  // Retorna o método de pagamento formatado
  getPaymentMethodLabel(): string {
    const methodMap: { [key: string]: string } = {
      pix: 'PIX',
      credit_card: 'Cartão de Crédito',
      boleto: 'Boleto Bancário'
    };
    return methodMap[this.paymentMethod] || this.paymentMethod;
  }
}

// Classe OrderItem para representar itens do pedido
export class OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  productName?: string;

  constructor(data: {
    id: string;
    order_id: string;
    product_id: string;
    quantity: number;
    price: number;
    products?: any;
  }) {
    this.id = data.id;
    this.orderId = data.order_id;
    this.productId = data.product_id;
    this.quantity = data.quantity;
    this.price = Number(data.price);
    this.productName = data.products?.name;
  }

  // Calcula o subtotal do item
  getSubtotal(): number {
    return this.price * this.quantity;
  }

  // Retorna o subtotal formatado
  getFormattedSubtotal(): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(this.getSubtotal());
  }
}
