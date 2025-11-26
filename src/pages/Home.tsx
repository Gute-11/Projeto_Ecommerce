import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ShoppingBag, Shield, Truck, CreditCard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/shop');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">FlexHub</h1>
          </div>
          <div className="flex gap-4">
            <Button asChild variant="outline">
              <Link to="/auth">Entrar</Link>
            </Button>
            <Button asChild>
              <Link to="/auth">Criar Conta</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Bem-vindo ao FlexHub
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Os melhores produtos eletrônicos com as melhores ofertas. 
            Faça seu cadastro e comece a comprar agora!
          </p>
          <Button asChild size="lg" className="text-lg">
            <Link to="/auth">Começar Agora</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 container mx-auto px-4">
        <h3 className="text-3xl font-bold text-center text-foreground mb-12">
          Por que escolher a FlexHub?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck className="w-8 h-8 text-primary" />
            </div>
            <h4 className="text-xl font-semibold text-foreground mb-2">Entrega Rápida</h4>
            <p className="text-muted-foreground">
              Receba seus produtos em até 48 horas em todo o Brasil
            </p>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-accent" />
            </div>
            <h4 className="text-xl font-semibold text-foreground mb-2">Compra Segura</h4>
            <p className="text-muted-foreground">
              Proteção completa em todas as transações
            </p>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-success" />
            </div>
            <h4 className="text-xl font-semibold text-foreground mb-2">Pagamento Flexível</h4>
            <p className="text-muted-foreground">
              PIX, cartão de crédito ou boleto bancário
            </p>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">
            Pronto para começar suas compras?
          </h3>
          <p className="text-xl mb-8 opacity-90">
            Crie sua conta gratuitamente e aproveite nossas ofertas
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link to="/auth">Criar Conta Grátis</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 FlexHub. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
