import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';
import { Alert } from 'react-native';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const cart = await AsyncStorage.getItem('GoMarketPlace:cart');

      if (cart) {
        setProducts(JSON.parse(cart));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async (product: Omit<Product, 'quantity'>) => {
      const productExist = products.find(item => item.id === product.id);

      if (productExist) {
        productExist.quantity += 1;

        const exitentProducts = products.filter(
          item => item.id !== productExist.id,
        );

        setProducts([...exitentProducts, productExist]);
      } else {
        const newProd = {
          ...product,
          quantity: 1,
        };

        setProducts([...products, newProd]);
      }

      await AsyncStorage.setItem(
        'GoMarketPlace:cart',
        JSON.stringify(products),
      );

      Alert.alert(
        'Produto adicionado',
        'Produto adicionado com sucesso ao carrinho de compras.',
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const filteredProduct = products.find(v => v.id === id);

      if (filteredProduct) {
        filteredProduct.quantity += 1;
        setProducts(
          products.map(v => {
            if (v.id === id) {
              return filteredProduct;
            }
            return v;
          }),
        );
      }

      await AsyncStorage.setItem(
        'GoMarketPlace:cart',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const filteredProduct = products.find(v => v.id === id);

      if (filteredProduct) {
        if (filteredProduct.quantity === 1) {
          const updatedProducts = products.filter(v => v.id !== id);
          setProducts(updatedProducts);
        } else {
          filteredProduct.quantity -= 1;

          setProducts(
            products.map(v => {
              if (v.id === id) {
                return filteredProduct;
              }
              return v;
            }),
          );
        }
      }

      await AsyncStorage.setItem(
        'GoMarketPlace:cart',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
