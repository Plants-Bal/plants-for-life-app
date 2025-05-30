import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Your global styles
import App from './App'; // Import the App component

// Import your context providers
import { AuthProvider } from './contexts/AuthContext'; // Example path
import { NavigationProvider } from './contexts/NavigationContext';
import { ProductProvider } from './contexts/ProductContext';
import { CartProvider } from './contexts/CartContext';

// Import DndProvider if you're using react-dnd
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <NavigationProvider>
        <ProductProvider>
          <CartProvider>
            <DndProvider backend={HTML5Backend}>
              <App />
            </DndProvider>
          </CartProvider>
        </ProductProvider>
      </NavigationProvider>
    </AuthProvider>
  </React.StrictMode>
);