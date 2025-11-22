import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { CreditCard, QrCode, FileText } from 'lucide-react';
import { toast } from 'sonner';

const Checkout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { cartItems, getTotal, clearCart } = useCart();
  
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/');
    } else if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [user, cartItems, navigate]);

  const total = getTotal();
  const formattedTotal = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(total);

  const handleConfirmOrder = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Criar pedido
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total,
          status: 'pending',
          payment_method: paymentMethod,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Criar itens do pedido
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.productId,
        quantity: item.quantity,
        price: item.product?.price || 0,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Limpar carrinho
      await clearCart();

      toast.success('Pedido realizado com sucesso!');
      navigate('/orders');
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      toast.error('Erro ao processar pedido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">Finalizar Compra</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Forma de Pagamento */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-xl font-bold text-foreground mb-6">
                Forma de Pagamento
              </h2>

              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
                    <RadioGroupItem value="pix" id="pix" />
                    <Label htmlFor="pix" className="flex items-center gap-3 cursor-pointer flex-1">
                      <QrCode className="w-6 h-6 text-primary" />
                      <div>
                        <p className="font-semibold">PIX</p>
                        <p className="text-sm text-muted-foreground">
                          Pagamento instantâneo
                        </p>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
                    <RadioGroupItem value="credit_card" id="credit_card" />
                    <Label htmlFor="credit_card" className="flex items-center gap-3 cursor-pointer flex-1">
                      <CreditCard className="w-6 h-6 text-primary" />
                      <div>
                        <p className="font-semibold">Cartão de Crédito</p>
                        <p className="text-sm text-muted-foreground">
                          Parcelamento disponível
                        </p>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
                    <RadioGroupItem value="boleto" id="boleto" />
                    <Label htmlFor="boleto" className="flex items-center gap-3 cursor-pointer flex-1">
                      <FileText className="w-6 h-6 text-primary" />
                      <div>
                        <p className="font-semibold">Boleto Bancário</p>
                        <p className="text-sm text-muted-foreground">
                          Vencimento em 3 dias úteis
                        </p>
                      </div>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </Card>
          </div>

          {/* Resumo */}
          <div>
            <Card className="p-6 sticky top-24">
              <h2 className="text-xl font-bold text-foreground mb-4">
                Resumo do Pedido
              </h2>

              <div className="space-y-3 mb-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.quantity}x {item.product?.name}
                    </span>
                    <span className="font-semibold">
                      {item.getFormattedSubtotal()}
                    </span>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between text-lg font-bold text-foreground mb-6">
                <span>Total</span>
                <span className="text-primary">{formattedTotal}</span>
              </div>

              <Button
                size="lg"
                className="w-full"
                onClick={handleConfirmOrder}
                disabled={loading}
              >
                {loading ? 'Processando...' : 'Confirmar Pedido'}
              </Button>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
