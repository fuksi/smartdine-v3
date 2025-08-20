"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

export interface Customer {
  id: string;
  phone: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
}

interface CustomerAuthContextType {
  customer: Customer | null;
  isLoading: boolean;
  login: (token: string, customer: Customer) => void;
  logout: () => void;
  updateCustomer: (customer: Customer) => void;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | null>(null);

interface CustomerAuthProviderProps {
  children: ReactNode;
}

export function CustomerAuthProvider({ children }: CustomerAuthProviderProps) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const token = localStorage.getItem("customer_token");
    if (token) {
      fetchCustomerInfo(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchCustomerInfo = async (token: string) => {
    try {
      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCustomer(data.customer);
      } else {
        // Invalid token, clear it
        localStorage.removeItem("customer_token");
      }
    } catch (error) {
      console.error("Failed to fetch customer info:", error);
      localStorage.removeItem("customer_token");
    } finally {
      setIsLoading(false);
    }
  };

  const login = (token: string, customerData: Customer) => {
    localStorage.setItem("customer_token", token);
    setCustomer(customerData);
  };

  const logout = async () => {
    const token = localStorage.getItem("customer_token");
    if (token) {
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error("Logout error:", error);
      }
    }

    localStorage.removeItem("customer_token");
    setCustomer(null);
  };

  const updateCustomer = (customerData: Customer) => {
    setCustomer(customerData);
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        isLoading,
        login,
        logout,
        updateCustomer,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error(
      "useCustomerAuth must be used within a CustomerAuthProvider"
    );
  }
  return context;
}
