"use client";

import { createContext, useContext, ReactNode } from "react";

interface RestaurantContextType {
  restaurantName: string;
}

const RestaurantContext = createContext<RestaurantContextType | null>(null);

interface RestaurantProviderProps {
  children: ReactNode;
  restaurantName: string;
}

export function RestaurantProvider({
  children,
  restaurantName,
}: RestaurantProviderProps) {
  return (
    <RestaurantContext.Provider value={{ restaurantName }}>
      {children}
    </RestaurantContext.Provider>
  );
}

export function useRestaurant() {
  const context = useContext(RestaurantContext);
  return context;
}
