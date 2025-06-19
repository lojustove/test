
import React from 'react';
import { CartItem } from '../types';
import { WHATSAPP_NUMBER, STORE_NAME } from '../constants';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveFromCart: (productId: string) => void;
}

const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose, cartItems, onUpdateQuantity, onRemoveFromCart }) => {
  if (!isOpen) return null;

  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    let message = `¡Hola ${STORE_NAME}! Quisiera realizar el siguiente pedido:\n\n`;
    cartItems.forEach(item => {
      message += `${item.name} - ${item.quantity} x $${item.price.toFixed(2)} = $${(item.quantity * item.price).toFixed(2)}\n`;
    });
    message += `\nTotal del Pedido: $${totalAmount.toFixed(2)}\n\n`;
    message += `¡Gracias!`;

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    onClose(); // Optionally close modal after redirecting
  };
  
  const CartItemRow: React.FC<{item: CartItem}> = React.memo(({ item }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-200">
      <div className="flex items-center">
        <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded-md mr-3" />
        <div>
          <h4 className="font-semibold text-gray-800 text-sm md:text-base">{item.name}</h4>
          <p className="text-xs text-gray-500">${item.price.toFixed(2)} c/u</p>
        </div>
      </div>
      <div className="flex items-center">
        <button 
          onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
          className="bg-gray-200 text-gray-700 hover:bg-gray-300 px-2 py-1 rounded-l text-sm"
          aria-label={`Reducir cantidad de ${item.name}`}
        >
          <i className="fas fa-minus"></i>
        </button>
        <span className="px-3 py-1 border-t border-b border-gray-200 text-sm text-center text-gray-800">{item.quantity}</span>
        <button 
          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
          className="bg-gray-200 text-gray-700 hover:bg-gray-300 px-2 py-1 rounded-r text-sm"
          aria-label={`Aumentar cantidad de ${item.name}`}
        >
          <i className="fas fa-plus"></i>
        </button>
        <button 
          onClick={() => onRemoveFromCart(item.id)}
          className="ml-3 text-red-500 hover:text-red-700 text-sm"
          aria-label={`Eliminar ${item.name} del carrito`}
        >
          <i className="fas fa-trash-alt"></i>
        </button>
      </div>
    </div>
  ));


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800">Tu Carrito de Compras</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl" aria-label="Cerrar carrito">
            &times;
          </button>
        </div>

        <div className="p-4 flex-grow overflow-y-auto">
          {cartItems.length === 0 ? (
            <div className="text-center py-10">
              <i className="fas fa-shopping-cart text-4xl text-gray-300 mb-4"></i>
              <p className="text-gray-500">Tu carrito está vacío.</p>
              <p className="text-sm text-gray-400">¡Añade productos para empezar!</p>
            </div>
          ) : (
            cartItems.map(item => <CartItemRow key={item.id} item={item} />)
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold text-gray-700">Total:</span>
              <span className="text-2xl font-bold text-blue-600">${totalAmount.toFixed(2)}</span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-colors duration-300 flex items-center justify-center"
            >
              <i className="fab fa-whatsapp mr-2"></i> Realizar Pedido por WhatsApp
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartModal;
