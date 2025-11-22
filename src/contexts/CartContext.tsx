import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { CartItem } from '@/models/CartItem';
import { toast } from 'sonner';

interface CartContextType {
  cartItems: CartItem[];
  loading: boolean;
  addToCart: (productId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotal: () => number;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshCart = async () => {
    if (!user) {
      setCartItems([]);
      return;
    }

    setLoading(true);
    try {
      // Busca ou cria o carrinho do usuário
      let { data: cart } = await supabase
        .from('cart')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!cart) {
        const { data: newCart } = await supabase
          .from('cart')
          .insert({ user_id: user.id })
          .select('id')
          .single();
        cart = newCart;
      }

      if (cart) {
        // Busca os itens do carrinho com detalhes dos produtos
        const { data: items } = await supabase
          .from('cart_items')
          .select(`
            *,
            products (*)
          `)
          .eq('cart_id', cart.id);

        if (items) {
          setCartItems(items.map(item => new CartItem(item)));
        }
      }
    } catch (error) {
      console.error('Erro ao carregar carrinho:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, [user]);

  const addToCart = async (productId: string) => {
    if (!user) {
      toast.error('Faça login para adicionar ao carrinho');
      return;
    }

    try {
      // Busca ou cria o carrinho
      let { data: cart } = await supabase
        .from('cart')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!cart) {
        const { data: newCart } = await supabase
          .from('cart')
          .insert({ user_id: user.id })
          .select('id')
          .single();
        cart = newCart;
      }

      if (!cart) {
        toast.error('Erro ao criar carrinho');
        return;
      }

      // Verifica se o produto já está no carrinho
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('cart_id', cart.id)
        .eq('product_id', productId)
        .single();

      if (existingItem) {
        // Incrementa a quantidade
        await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + 1 })
          .eq('id', existingItem.id);
      } else {
        // Adiciona novo item
        await supabase
          .from('cart_items')
          .insert({
            cart_id: cart.id,
            product_id: productId,
            quantity: 1,
          });
      }

      toast.success('Produto adicionado ao carrinho!');
      await refreshCart();
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error);
      toast.error('Erro ao adicionar produto ao carrinho');
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;

    try {
      await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId);

      await refreshCart();
    } catch (error) {
      console.error('Erro ao atualizar quantidade:', error);
      toast.error('Erro ao atualizar quantidade');
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      toast.success('Produto removido do carrinho');
      await refreshCart();
    } catch (error) {
      console.error('Erro ao remover do carrinho:', error);
      toast.error('Erro ao remover produto do carrinho');
    }
  };

  const clearCart = async () => {
    if (!user) return;

    try {
      const { data: cart } = await supabase
        .from('cart')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (cart) {
        await supabase
          .from('cart_items')
          .delete()
          .eq('cart_id', cart.id);

        await refreshCart();
      }
    } catch (error) {
      console.error('Erro ao limpar carrinho:', error);
    }
  };

  const getTotal = () => {
    return cartItems.reduce((total, item) => total + item.getSubtotal(), 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getTotal,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart deve ser usado dentro de um CartProvider');
  }
  return context;
};
