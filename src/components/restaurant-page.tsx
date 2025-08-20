"use client";

import { useState, useEffect, useRef } from "react";
import { ProductCard } from "@/components/product-card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { SerializedProduct } from "@/lib/types";
import { RestaurantProvider } from "@/lib/restaurant-context";
import { useCartStore } from "@/lib/store/cart";

interface Category {
  id: string;
  name: string;
  description: string | null;
  products: SerializedProduct[];
}

interface Location {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  merchant: {
    name: string;
  };
  menu: {
    categories: Category[];
  };
}

interface RestaurantPageProps {
  location: Location;
  merchantSlug: string;
  locationSlug: string;
}

export function RestaurantPage({
  location,
  merchantSlug,
  locationSlug,
}: RestaurantPageProps) {
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [showStickyNav, setShowStickyNav] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const categoryRefs = useRef<{ [key: string]: HTMLElement | null }>({});
  const stickyNavRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const { setLocation } = useCartStore();

  // Set current location in cart store when component mounts
  useEffect(() => {
    setLocation(location.id, merchantSlug, locationSlug);
  }, [location.id, merchantSlug, locationSlug, setLocation]);

  // Filter products based on search query
  const filteredCategories = location.menu.categories
    .map((category) => ({
      ...category,
      products: category.products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((category) => category.products.length > 0);

  // Handle scroll and intersection observer
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -60% 0px",
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveCategory(entry.target.id);
        }
      });
    }, observerOptions);

    // Observe all category sections
    Object.values(categoryRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    // Handle sticky navigation visibility
    const handleScroll = () => {
      if (headerRef.current) {
        const headerBottom =
          headerRef.current.offsetTop + headerRef.current.offsetHeight;
        const scrollY = window.scrollY;
        setShowStickyNav(scrollY > headerBottom - 100);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check initial state

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, [filteredCategories]);

  const scrollToCategory = (categoryId: string) => {
    const element = categoryRefs.current[categoryId];
    if (element) {
      const headerHeight = 120; // Account for sticky top bar + category nav
      const elementTop = element.offsetTop - headerHeight;
      window.scrollTo({
        top: elementTop,
        behavior: "smooth",
      });
    }
  };

  return (
    <RestaurantProvider restaurantName={location.merchant.name}>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 pb-24 md:pb-8 md:pt-24">
          {/* Header */}
          <div ref={headerRef} className="mb-8">
            <h1 className="text-3xl font-bold mb-2 hidden md:block">
              {location.merchant.name} - {location.name}
            </h1>
            <h1 className="text-2xl font-bold mb-2 md:hidden">
              {location.merchant.name}
            </h1>
            <p className="text-muted-foreground hidden md:block">
              {location.address}
            </p>
            {location.phone && (
              <p className="text-muted-foreground hidden md:block">
                {location.phone}
              </p>
            )}

            {/* Search Bar */}
            <div className="mt-6 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-3 w-3" />
              <Input
                type="text"
                placeholder={`Search in ${location.merchant.name}`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white shadow-sm border-0 rounded-full"
              />
            </div>
          </div>

          {/* Sticky Category Navigation */}
          <div
            ref={stickyNavRef}
            className={`sticky top-16 z-40 bg-background/95 backdrop-blur-sm border-b transition-all duration-300 ${
              showStickyNav
                ? "opacity-100 translate-y-0"
                : "opacity-0 -translate-y-2 pointer-events-none"
            } md:hidden`}
          >
            <div className="container mx-auto px-4">
              <div className="flex space-x-2 py-3 overflow-x-auto scrollbar-hide">
                {location.menu.categories.map((category) => {
                  const hasProducts = filteredCategories.find(
                    (c) => c.id === category.id
                  );
                  if (!hasProducts) return null;

                  return (
                    <button
                      key={category.id}
                      onClick={() => scrollToCategory(category.id)}
                      className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        activeCategory === category.id
                          ? "bg-[hsl(var(--brand-primary))] text-white"
                          : "bg-white text-gray-600 hover:bg-gray-100 shadow-sm"
                      }`}
                    >
                      {category.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Menu Content */}
          <div className="space-y-8">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
                <section
                  key={category.id}
                  id={category.id}
                  ref={(el) => {
                    categoryRefs.current[category.id] = el;
                  }}
                >
                  <div className="mb-6">
                    <h2 className="text-2xl font-semibold mb-2">
                      {category.name}
                    </h2>
                    {category.description && (
                      <p className="text-muted-foreground">
                        {category.description}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {category.products.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        locationId={location.id}
                        merchantSlug={merchantSlug}
                        locationSlug={locationSlug}
                      />
                    ))}
                  </div>
                </section>
              ))
            ) : searchQuery ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No items found matching &quot;{searchQuery}&quot;
                </p>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  This restaurant doesn&apos;t have any menu items available at
                  the moment.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </RestaurantProvider>
  );
}
