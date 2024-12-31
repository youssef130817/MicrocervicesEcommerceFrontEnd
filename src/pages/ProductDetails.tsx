import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { productService } from '@/services';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useCart } from "@/hooks/useCart";

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const response = await productService.getProduct(id!);
      return response.data;
    },
    enabled: !!id,
  });

  const handleAddToCart = () => {
    if (!product) return;
    
    addToCart.mutate({
      productId: product.id,
      quantity: 1
    });
  };

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-8">
          <div className="container">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Product</h1>
              <p className="text-gray-600">The product could not be loaded. Please try again later.</p>
              <Button onClick={() => navigate('/products')} className="mt-4">
                Back to Products
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-8">
          <div className="container">
            <div className="animate-pulse">
              <div className="h-96 bg-gray-200 rounded-lg mb-8" />
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/2" />
                <div className="h-4 bg-gray-200 rounded w-1/4" />
                <div className="h-24 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-8">
          <div className="container">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Product Not Found</h1>
              <p className="text-gray-600">The product you're looking for doesn't exist.</p>
              <Button onClick={() => navigate('/products')} className="mt-4">
                Back to Products
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-8">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              {product.images.length > 0 ? (
                <img
                  src={product.images[0].imageUrl}
                  alt={product.name}
                  className="h-full w-full object-cover object-center"
                />
              ) : (
                <img
                  src={`https://source.unsplash.com/featured/?product&${product.id}`}
                  alt={product.name}
                  className="h-full w-full object-cover object-center"
                />
              )}
            </div>
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold">{product.name}</h1>
                {product.category && (
                  <p className="text-gray-500 mt-1">{product.category.name}</p>
                )}
              </div>
              <p className="text-3xl tracking-tight text-gray-900">
                {product.price} MAD
              </p>
              <p className="text-gray-600">{product.description}</p>
              <p className="text-sm text-gray-500">Stock: {product.stock} units</p>
              <Button
                className="w-full mt-4"
                onClick={handleAddToCart}
              >
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
