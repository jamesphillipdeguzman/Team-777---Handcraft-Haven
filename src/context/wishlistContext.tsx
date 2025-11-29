"use client";

import {createContext, useContext, useEffect, useState, ReactNode} from "react";

type Product = {
    id: number;
    name: string;
    description: string;
    price: number;
    image_url?: string;
    category?: string;
};

type WishlistContextType = {
    wishlist: Product[];
    addToWishlist: (product: Product) => void;
    removeFromWishlist: (id: number) => void;
};

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({children}: {children: ReactNode}) {
    const [wishlist, setWishlist] = useState<Product[]>([]);

    //load localStorage when app starts
    useEffect(() => {
        const stored = localStorage.getItem("wishlist");
        if (stored) setWishlist(JSON.parse(stored));
    }, []);

    //Always save in LocalStorage when wishlist changes
    useEffect(() => {
        localStorage.setItem("wishlist", JSON.stringify(wishlist));
    }, [wishlist]);

    const addToWishlist = (product: Product) => {
        setWishlist((prev) => {
            if (prev.find((p) => p.id === product.id)) return prev; 
            return [...prev, product];
        });
    };

    const removeFromWishlist = (id:number) => {
        setWishlist((prev) => prev.filter((p) => p.id !== id));
    };

    return (
        <WishlistContext.Provider value={{wishlist, addToWishlist, removeFromWishlist}}>
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist(){
    const context = useContext(WishlistContext);
    if (!context) throw new Error("useWishlist most be used inside of WishlistProvider");
    return context;
}