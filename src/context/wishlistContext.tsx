"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Product = {
    id: number;
    name: string;
    description: string;
    price: number;
    image_url?: string;
    category?: string;
    artisan_name?: string | null;
};

type WishlistContextType = {
    wishlist: Product[];
    addToWishlist: (product: Product) => void;
    removeFromWishlist: (id: number) => void;
};

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
    const [wishlist, setWishlist] = useState<Product[]>(() => {
        // Initialize from localStorage immediately (lazy init)
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem("wishlist");
            return stored ? JSON.parse(stored) : [];
        }
        return [];
    });

    // Save to localStorage whenever wishlist changes
    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("wishlist", JSON.stringify(wishlist));
        }
    }, [wishlist]);

    const addToWishlist = (product: Product) => {
        setWishlist((prev) => {
            if (prev.some((p) => p.id === product.id)) return prev;
            return [...prev, product];
        });
    };

    const removeFromWishlist = (id: number) => {
        setWishlist((prev) => prev.filter((p) => p.id !== id));
    };

    return (
        <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const context = useContext(WishlistContext);
    if (!context) throw new Error("useWishlist must be used inside a WishlistProvider");
    return context;
}
