import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from "react-router-dom";

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
  image_url?: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category: '',
    image_url: '',
  });

  // Buscar produtos
  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Erro ao carregar produtos');
      console.error(error);
    } else {
      setProducts(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Deletar produto
  const deleteProduct = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este produto?')) return;

    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      toast.error('Erro ao deletar produto');
      console.error(error);
    } else {
      toast.success('Produto deletado');
      fetchProducts();
    }
  };

  // Adicionar produto
  const addProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.from('products').insert([newProduct]);
    if (error) {
      toast.error('Erro ao adicionar produto');
      console.error(error);
    } else {
      toast.success('Produto adicionado com sucesso');
      setNewProduct({ name: '', description: '', price: 0, stock: 0, category: '', image_url: '' });
      fetchProducts();
    }
  };

  // Atualizar preço ou estoque de um produto existente
  const updateProduct = async (id: string, field: 'price' | 'stock', value: number) => {
    const { error } = await supabase
      .from('products')
      .update({ [field]: value })
      .eq('id', id);

    if (error) {
      toast.error('Erro ao atualizar produto');
      console.error(error);
    } else {
      toast.success('Produto atualizado');
      fetchProducts();
    }
  };

  return (
    <div className="container mx-auto p-4">

      <button
        onClick={() => navigate("/shop")}
        className="mb-4 flex items-center gap-2 text-primary hover:underline"
      >
        <span className="text-lg">←</span> Voltar para a loja
      </button>

      <h1 className="text-3xl font-bold mb-4">Painel Admin</h1>

      {/* Formulário de adição de produto */}
      <h2 className="text-2xl font-semibold mb-2">Adicionar Produto</h2>
      <form onSubmit={addProduct} className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-medium mb-1">Nome do Produto</label>
          <input
            type="text"
            placeholder="Nome"
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            required
            className="border p-2 rounded w-full"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Descrição</label>
          <input
            type="text"
            placeholder="Descrição"
            value={newProduct.description}
            onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
            className="border p-2 rounded w-full"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Preço (R$)</label>
          <input
            type="number"
            placeholder="Preço"
            value={newProduct.price}
            onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
            required
            className="border p-2 rounded w-full"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Estoque</label>
          <input
            type="number"
            placeholder="Estoque"
            value={newProduct.stock}
            onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
            required
            className="border p-2 rounded w-full"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Categoria</label>
          <input
            type="text"
            placeholder="Categoria"
            value={newProduct.category}
            onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
            className="border p-2 rounded w-full"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">URL da Imagem</label>
          <input
            type="text"
            placeholder="URL da imagem"
            value={newProduct.image_url}
            onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
            className="border p-2 rounded w-full"
          />
        </div>

        <div className="md:col-span-2">
          <button type="submit" className="bg-primary text-white px-4 py-2 rounded">
            Adicionar Produto
          </button>
        </div>
      </form>

      {/* Tabela de produtos */}
      <h2 className="text-2xl font-semibold mb-2">Produtos</h2>
      {loading ? (
        <p>Carregando...</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Nome</th>
              <th className="p-2 border">Preço</th>
              <th className="p-2 border">Estoque</th>
              <th className="p-2 border">Categoria</th>
              <th className="p-2 border">Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.map((prod) => (
              <tr key={prod.id}>
                <td className="p-2 border">{prod.name}</td>
                <td className="p-2 border">
                  <input
                    type="number"
                    value={prod.price}
                    onChange={(e) => updateProduct(prod.id, 'price', Number(e.target.value))}
                    className="border p-1 rounded w-20"
                  />
                </td>
                <td className="p-2 border">
                  <input
                    type="number"
                    value={prod.stock}
                    onChange={(e) => updateProduct(prod.id, 'stock', Number(e.target.value))}
                    className="border p-1 rounded w-16"
                  />
                </td>
                <td className="p-2 border">{prod.category}</td>
                <td className="p-2 border space-x-2">
                  <button
                    onClick={() => deleteProduct(prod.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Deletar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminDashboard;
