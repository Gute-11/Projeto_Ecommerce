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
import { CreditCard, QrCode, FileText, MapPin } from 'lucide-react';
import { toast } from 'sonner';

const Checkout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { cartItems, getTotal, clearCart } = useCart();

  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [loading, setLoading] = useState(false);

  // Endereços
  const [enderecos, setEnderecos] = useState<any[]>([]);
  const [loadingEnderecos, setLoadingEnderecos] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);

  // Verificação inicial
  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    if (cartItems.length === 0) {
      navigate('/cart');
      return;
    }

    loadEnderecos();
  }, [user, cartItems]);

  // Carregar endereços
  const loadEnderecos = async () => {
    try {
      const { data, error } = await supabase
        .from('enderecos')
        .select('*')
        .eq('user_id', user!.id)
        .order('padrao', { ascending: false });

      if (error) throw error;

      setEnderecos(data || []);

      // Se houver endereço padrão, já seleciona
      const padrao = data?.find((e) => e.padrao);
      if (padrao) setSelectedAddress(padrao.id);

      // Se não houver nenhum → obrigatório criar
      if (!data || data.length === 0) {
        toast.error('Você precisa cadastrar um endereço antes de finalizar a compra.');
        navigate('/profile');
      }
    } catch (error) {
      toast.error('Erro ao carregar endereços');
      console.error(error);
    } finally {
      setLoadingEnderecos(false);
    }
  };

  // Confirmar pedido
  const total = getTotal();
  const formattedTotal = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(total);

  const handleConfirmOrder = async () => {
    if (!user) return;

    // Bloquear se não tiver endereço selecionado
    if (!selectedAddress) {
      toast.error('Selecione um endereço para entrega.');
      return;
    }

    setLoading(true);

    try {
      // Obter o endereço selecionado
      const endereco = enderecos.find((e) => e.id === selectedAddress);

      if (!endereco) {
        toast.error('Endereço inválido.');
        return;
      }

      // Remover campos desnecessários (como id, user_id)
      const { id, user_id, ...enderecoJSON } = endereco;

      // Criar pedido
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total,
          status: 'pending',
          payment_method: paymentMethod,
          endereco_entrega: enderecoJSON, // ← Aqui salvamos o JSON
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Criar itens do pedido
      const orderItems = cartItems.map((item) => ({
        order_id: order.id,
        product_id: item.productId,
        quantity: item.quantity,
        price: item.product?.price || 0,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Atualizar estoque
      for (const item of cartItems) {
        const productId = item.productId;
        const purchasedQty = item.quantity;

        const { data: product, error: productError } = await supabase
          .from('products')
          .select('stock')
          .eq('id', productId)
          .single();

        if (productError) throw productError;

        const newStock = Math.max(product.stock - purchasedQty, 0);

        const { error: updateError } = await supabase
          .from('products')
          .update({ stock: newStock })
          .eq('id', productId);

        if (updateError) throw updateError;
      }

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
        <h1 className="text-3xl font-bold mb-8">Finalizar Compra</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Endereços */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-primary" />
                Endereço de Entrega
              </h2>

              {loadingEnderecos ? (
                <p>Carregando endereços...</p>
              ) : (
                <RadioGroup
                  value={selectedAddress || ''}
                  onValueChange={(v) => setSelectedAddress(v)}
                >
                  <div className="space-y-4">
                    {enderecos.map((e) => (
                      <div
                        key={e.id}
                        className="flex items-center gap-4 p-4 border rounded-lg cursor-pointer hover:bg-accent/40"
                      >
                        <RadioGroupItem value={e.id} id={e.id} />

                        <Label htmlFor={e.id} className="cursor-pointer flex-1">
                          <p className="font-semibold">
                            {e.rua}, {e.numero} — {e.bairro}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {e.cidade} - {e.estado}, CEP {e.cep}
                          </p>

                          {e.padrao && (
                            <span className="text-primary text-xs">Endereço padrão</span>
                          )}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              )}

              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => navigate('/profile')}
              >
                Gerenciar Endereços
              </Button>
            </Card>

            {/* Forma de Pagamento */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-6">Forma de Pagamento</h2>

              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
                    <RadioGroupItem value="pix" id="pix" />
                    <Label htmlFor="pix" className="flex items-center gap-3 flex-1 cursor-pointer">
                      <QrCode className="w-6 h-6 text-primary" />
                      <div>
                        <p className="font-semibold">PIX</p>
                        <p className="text-sm text-muted-foreground">Pagamento instantâneo</p>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
                    <RadioGroupItem value="credit_card" id="credit_card" />
                    <Label htmlFor="credit_card" className="flex items-center gap-3 flex-1 cursor-pointer">
                      <CreditCard className="w-6 h-6 text-primary" />
                      <div>
                        <p className="font-semibold">Cartão de Crédito</p>
                        <p className="text-sm text-muted-foreground">Parcelamento disponível</p>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
                    <RadioGroupItem value="boleto" id="boleto" />
                    <Label htmlFor="boleto" className="flex items-center gap-3 flex-1 cursor-pointer">
                      <FileText className="w-6 h-6 text-primary" />
                      <div>
                        <p className="font-semibold">Boleto Bancário</p>
                        <p className="text-sm text-muted-foreground">Vencimento em 3 dias úteis</p>
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
              <h2 className="text-xl font-bold mb-4">Resumo do Pedido</h2>

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

              <div className="flex justify-between text-lg font-bold mb-6">
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
