import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';

const Cart = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart, getTotal, loading } = useCart();

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  const total = getTotal();
  const formattedTotal = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(total);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Carregando carrinho...</div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card className="p-12 text-center">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Seu carrinho está vazio
            </h2>
            <p className="text-muted-foreground mb-6">
              Adicione produtos para começar suas compras
            </p>
            <Button asChild>
              <Link to="/shop">Continuar Comprando</Link>
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">Meu Carrinho</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de Produtos */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex gap-4">
                  <img
                    src={item.product?.imageUrl}
                    alt={item.product?.name}
                    className="w-24 h-24 object-cover rounded-md bg-muted"
                  />
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">
                      {item.product?.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {item.product?.category}
                    </p>
                    <p className="text-lg font-bold text-primary">
                      {item.product?.getFormattedPrice()}
                    </p>
                  </div>

                  <div className="flex flex-col items-end justify-between">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFromCart(item.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-12 text-center font-semibold">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= (item.product?.stock || 0)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    <p className="text-sm font-semibold text-foreground">
                      Subtotal: {item.getFormattedSubtotal()}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Resumo */}
          <div>
            <Card className="p-6 sticky top-24">
              <h2 className="text-xl font-bold text-foreground mb-4">
                Resumo do Pedido
              </h2>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal ({cartItems.length} {cartItems.length === 1 ? 'item' : 'itens'})</span>
                  <span>{formattedTotal}</span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between text-lg font-bold text-foreground mb-6">
                <span>Total</span>
                <span className="text-primary">{formattedTotal}</span>
              </div>

              <Button asChild size="lg" className="w-full mb-3">
                <Link to="/checkout">Finalizar Compra</Link>
              </Button>

              <Button asChild variant="outline" className="w-full">
                <Link to="/shop">Continuar Comprando</Link>
              </Button>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Cart;
