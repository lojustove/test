
import React from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = React.memo(({ product, onAddToCart }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col transition-transform duration-300 hover:shadow-xl hover:scale-105">
      <img 
        src={product.imageUrl} 
        alt={product.name} 
        className="w-full h-48 object-cover" 
        onError={(e) => (e.currentTarget.src = 'https://picsum.photos/400/300?grayscale')} // Fallback image
      />
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-gray-800 mb-1 truncate" title={product.name}>{product.name}</h3>
        <p className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full self-start mb-2">{product.category}</p>
        <p className="text-sm text-gray-600 mb-3 flex-grow min-h-[40px]">{product.description.substring(0, 60)}{product.description.length > 60 ? '...' : ''}</p>
        <div className="flex justify-between items-center mt-auto">
          <p className="text-xl font-bold text-blue-600">${product.price.toFixed(2)}</p>
          <button
            onClick={() => onAddToCart(product)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-300 text-sm flex items-center"
            aria-label={`Añadir ${product.name} al carrito`}
          >
            <i className="fas fa-cart-plus mr-2"></i> Añadir
          </button>
        </div>
      </div>
    </div>
  );
});

export default ProductCard;
