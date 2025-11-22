-- Criar tabela de perfis de usuários
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de produtos
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de carrinho
CREATE TABLE public.cart (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Criar tabela de itens do carrinho
CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL REFERENCES public.cart(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(cart_id, product_id)
);

-- Criar tabela de pedidos
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  total DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de itens do pedido
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para users (usuários podem ver e editar apenas seus próprios dados)
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas RLS para products (todos podem ver produtos)
CREATE POLICY "Anyone can view products" ON public.products
  FOR SELECT USING (true);

-- Políticas RLS para cart (usuários podem ver apenas seu próprio carrinho)
CREATE POLICY "Users can view own cart" ON public.cart
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cart" ON public.cart
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart" ON public.cart
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart" ON public.cart
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para cart_items (através do cart)
CREATE POLICY "Users can view own cart items" ON public.cart_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.cart 
      WHERE cart.id = cart_items.cart_id 
      AND cart.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own cart items" ON public.cart_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cart 
      WHERE cart.id = cart_items.cart_id 
      AND cart.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own cart items" ON public.cart_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.cart 
      WHERE cart.id = cart_items.cart_id 
      AND cart.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own cart items" ON public.cart_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.cart 
      WHERE cart.id = cart_items.cart_id 
      AND cart.user_id = auth.uid()
    )
  );

-- Políticas RLS para orders (usuários podem ver apenas seus próprios pedidos)
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas RLS para order_items (através do order)
CREATE POLICY "Users can view own order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own order items" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- Função para criar perfil automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'),
    NEW.email
  );
  RETURN NEW;
END;
$$;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Inserir alguns produtos de exemplo
INSERT INTO public.products (name, description, price, stock, category, image_url) VALUES
  ('Smartphone Premium', 'Celular de última geração com câmera de 108MP', 2999.90, 15, 'Eletrônicos', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500'),
  ('Notebook Gamer', 'Notebook potente para jogos e trabalho', 5499.90, 8, 'Eletrônicos', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500'),
  ('Fone Bluetooth', 'Fone de ouvido sem fio com cancelamento de ruído', 599.90, 25, 'Acessórios', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'),
  ('Smart Watch', 'Relógio inteligente com monitor cardíaco', 899.90, 12, 'Acessórios', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'),
  ('Câmera Digital', 'Câmera profissional 4K', 3499.90, 5, 'Eletrônicos', 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500'),
  ('Tablet Pro', 'Tablet com tela de 12 polegadas', 1999.90, 10, 'Eletrônicos', 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500'),
  ('Teclado Mecânico', 'Teclado RGB para gamers', 399.90, 20, 'Acessórios', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500'),
  ('Mouse Gamer', 'Mouse com sensor óptico de alta precisão', 249.90, 30, 'Acessórios', 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500');