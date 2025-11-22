import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Package } from 'lucide-react';
import { Product } from '@/models/Product';
import { Link } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: string) => void;
}

const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
      <Link to={`/product/${product.id}`}>
        <div className="aspect-square overflow-hidden bg-muted">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </Link>
      <CardContent className="p-4">
        <Link to={`/product/${product.id}`}>
          <Badge variant="secondary" className="mb-2">
            {product.category}
          </Badge>
          <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
            {product.name}
          </h3>
          <p className="text-2xl font-bold text-primary">
            {product.getFormattedPrice()}
          </p>
        </Link>
        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
          <Package className="w-4 h-4" />
          <span>{product.stock} em estoque</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          onClick={() => onAddToCart(product.id)}
          disabled={!product.isAvailable()}
          className="w-full"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {product.isAvailable() ? 'Adicionar ao Carrinho' : 'Sem Estoque'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
