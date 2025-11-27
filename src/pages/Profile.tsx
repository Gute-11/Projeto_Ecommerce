import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { User, MapPin, Pencil, Trash, Star } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth(); //herda dados e comportamentos do AuthProvider
  const navigate = useNavigate();
  
  const [name, setName] = useState('');// atributos
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Endereços
  const [enderecos, setEnderecos] = useState<any[]>([]);
  const [loadingEnderecos, setLoadingEnderecos] = useState(true);
  const [novoEndereco, setNovoEndereco] = useState(false);

  // Form de endereço
  const [formEndereco, setFormEndereco] = useState({
    cep: '',
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
  });

  // Carregar dados do usuário

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    loadProfile();
    loadEnderecos();
  }, [user]);

  // Perfil
  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user!.id)
        .single();

      if (error) throw error;

      if (data) {
        setName(data.name || ''); //função encapsulada de alterar nome
        setEmail(data.email || ''); // encapsulado
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ name })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast.error('Erro ao atualizar perfil');
    } finally {
      setSaving(false);
    }
  };

  // Endereços
  const loadEnderecos = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('enderecos')
        .select('*')
        .eq('user_id', user.id)
        .order('padrao', { ascending: false });

      if (error) throw error;

      setEnderecos(data || []);
    } catch (error) {
      console.error('Erro ao carregar endereços:', error);
      toast.error('Erro ao carregar endereços');
    } finally {
      setLoadingEnderecos(false);
    }
  };

  const handleAddEndereco = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('enderecos')
        .insert({
          user_id: user.id,
          ...formEndereco,
        });

      if (error) throw error;

      toast.success('Endereço adicionado!');
      setNovoEndereco(false);
      setFormEndereco({
        cep: '',
        rua: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
      });
      loadEnderecos();
    } catch (error) {
      console.error('Erro ao adicionar endereço:', error);
      toast.error('Erro ao adicionar endereço');
    }
  };

  const handleDeleteEndereco = async (id: string) => {
    try {
      const { error } = await supabase
        .from('enderecos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Endereço removido');
      loadEnderecos();
    } catch (error) {
      toast.error('Erro ao excluir endereço');
    }
  };

  const handleSetPadrao = async (id: string) => {
    try {
      // redefine todos os outros
      await supabase
        .from('enderecos')
        .update({ padrao: false })
        .eq('user_id', user!.id);

      // define o novo padrão
      await supabase
        .from('enderecos')
        .update({ padrao: true })
        .eq('id', id);

      toast.success('Endereço padrão atualizado!');
      loadEnderecos();
    } catch {
      toast.error('Erro ao definir endereço padrão');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Carregando perfil...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Meu Perfil</h1>

        <div className="max-w-3xl space-y-10">
          {/* Perfil */}
          <Card className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{name}</h2>
                <p className="text-muted-foreground">{email}</p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label>Nome completo</Label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={email} disabled className="bg-muted" />
                <p className="text-sm text-muted-foreground">
                  O email não pode ser alterado
                </p>
              </div>

              <Button type="submit" disabled={saving} className="w-full">
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </form>
          </Card>

          {/* Endereços */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-primary" />
              Meus Endereços
            </h2>

            {/* Lista de endereços */}
            {loadingEnderecos ? (
              <p>Carregando endereços...</p>
            ) : enderecos.length === 0 ? (
              <p className="text-muted-foreground">Nenhum endereço cadastrado.</p>
            ) : (
              <div className="space-y-4">
                {enderecos.map((e) => (
                  <div
                    key={e.id}
                    className="border p-4 rounded-lg flex justify-between items-center"
                  >
                    <div>
                      <p className="font-semibold">
                        {e.rua}, {e.numero} — {e.bairro}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {e.cidade} - {e.estado}, CEP {e.cep}
                      </p>

                      {e.padrao && (
                        <span className="text-primary text-sm flex gap-1 items-center mt-1">
                          <Star size={14} /> Endereço padrão
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {!e.padrao && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetPadrao(e.id)}
                        >
                          Tornar padrão
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteEndereco(e.id)}
                      >
                        <Trash className="w-5 h-5 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Botão para novo endereço */}
            <Button className="w-full mt-6" onClick={() => setNovoEndereco(!novoEndereco)}>
              Adicionar novo endereço
            </Button>

            {/* Formulário de novo endereço */}
            {novoEndereco && (
              <div className="mt-6 space-y-4">
                {Object.entries(formEndereco).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <Label className="capitalize">{key}</Label>
                    <Input
                      value={value}
                      onChange={(e) =>
                        setFormEndereco({ ...formEndereco, [key]: e.target.value })
                      }
                      required={['cep', 'rua', 'numero', 'cidade', 'estado'].includes(
                        key
                      )}
                    />
                  </div>
                ))}

                <Button className="w-full" onClick={handleAddEndereco}>
                  Salvar Endereço
                </Button>
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Profile;
