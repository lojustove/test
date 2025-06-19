
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Product, CartItem } from './types';
import { STORE_NAME } from './constants';
import ProductCard from './components/ProductCard';
import CartModal from './components/CartModal';
import { useDebounce } from './hooks/useDebounce';
// Removed: import productsData from './data/products.json';

// Loading spinner component (simple version)
const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
  </div>
);

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  const debouncedSearchTerm = useDebounce<string>(searchTerm, 300);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Simulate a small delay for WebView to handle potential rapid rendering
        // and for visual feedback of loading
        await new Promise(resolve => setTimeout(resolve, 500));

        const response = await fetch('./data/products.json'); // Fetch relative to index.html
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        setProducts(data as Product[]);
      } catch (e: unknown) {
        console.error("Error loading products:", e);
        if (e instanceof Error) {
          setError(`No se pudieron cargar los productos: ${e.message}`);
        } else {
          setError("No se pudieron cargar los productos. Ocurrió un error desconocido.");
        }
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const categories = useMemo(() => {
    if (products.length === 0 && !isLoading) return ['Todos']; // Handle case where products haven't loaded or failed
    const uniqueCategories = new Set(products.map(p => p.category));
    return ['Todos', ...Array.from(uniqueCategories)];
  }, [products, isLoading]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory = selectedCategory === 'Todos' || product.category === selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                            product.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, debouncedSearchTerm]);

  const handleAddToCart = useCallback((product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  }, []);

  const handleUpdateQuantity = useCallback((productId: string, quantity: number) => {
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId ? { ...item, quantity: Math.max(0, quantity) } : item
      ).filter(item => item.quantity > 0) // Remove if quantity is 0
    );
  }, []);

  const handleRemoveFromCart = useCallback((productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  }, []);

  const cartItemCount = useMemo(() => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  }, [cart]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight mb-2 sm:mb-0">{STORE_NAME}</h1>
          <div className="flex items-center space-x-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white bg-opacity-20 placeholder-gray-300 text-white focus:outline-none focus:ring-2 focus:ring-blue-300 focus:bg-opacity-30 transition-all"
                aria-label="Buscar productos"
              />
              <i className="fas fa-search absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300"></i>
            </div>
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-full transition-colors duration-300"
              aria-label="Ver carrito"
            >
              <i className="fas fa-shopping-cart text-xl"></i>
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center" aria-hidden="true">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        {/* Category Filters */}
        <div className="mb-6 flex flex-wrap gap-2 justify-center" role="toolbar" aria-label="Filtros de categoría">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300
                ${selectedCategory === category ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-blue-100 shadow-sm'}`}
              aria-pressed={selectedCategory === category}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <div role="alert" className="text-center py-10 px-4">
             <i className="fas fa-exclamation-triangle text-4xl text-red-400 mb-4"></i>
            <p className="text-red-600 text-lg">Error al cargar productos</p>
            <p className="text-sm text-gray-500">{error}</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <i className="fas fa-search-minus text-4xl text-gray-400 mb-4"></i>
            <p className="text-gray-600 text-lg">No se encontraron productos.</p>
            <p className="text-sm text-gray-500">Intenta ajustar tu búsqueda o filtros.</p>
          </div>
        )}
      </main>

      {/* Cart Modal */}
      {isCartOpen && /* Conditionally render modal for performance */ (
        <CartModal
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cartItems={cart}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveFromCart={handleRemoveFromCart}
        />
      )}

      {/* Footer */}
      <footer className="bg-gray-800 text-white text-center py-6">
        <p>&copy; {new Date().getFullYear()} {STORE_NAME}. Todos los derechos reservados.</p>
        <p className="text-sm text-gray-400">Desarrollado con <i className="fas fa-heart text-red-500" aria-label="amor"></i> para ti.</p>
      </footer>
    </div>
  );
};

export default App;
