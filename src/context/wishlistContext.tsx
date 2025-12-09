"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";

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
    isInWishlist: (id: number) => boolean;
    loading: boolean;
};

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = "wishlist";

export function WishlistProvider({ children }: { children: ReactNode }) {
    const [wishlist, setWishlist] = useState<Product[]>([]);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);

    // Check authentication status
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch("/api/auth/status");
                const data = await res.json();
                setIsLoggedIn(data.loggedIn === true);
            } catch {
                setIsLoggedIn(false);
            }
        };
        checkAuth();
    }, []);

    // Load wishlist based on auth status
    useEffect(() => {
        if (isLoggedIn === null) return; // Wait for auth check

        const loadWishlist = async () => {
            setLoading(true);

            if (isLoggedIn) {
                // User is logged in - fetch from database
                try {
                    const res = await fetch("/api/wishlist");
                    if (res.ok) {
                        const data = await res.json();
                        setWishlist(data.items || []);

                        // Sync any localStorage items to database (for items added as guest)
                        const localItems = getLocalStorageWishlist();
                        if (localItems.length > 0) {
                            await syncLocalToDatabase(localItems);
                            clearLocalStorageWishlist();
                            // Refetch to get updated list
                            const refreshRes = await fetch("/api/wishlist");
                            if (refreshRes.ok) {
                                const refreshData = await refreshRes.json();
                                setWishlist(refreshData.items || []);
                            }
                        }
                    }
                } catch (error) {
                    console.error("Error loading wishlist from database:", error);
                    // Fallback to localStorage
                    setWishlist(getLocalStorageWishlist());
                }
            } else {
                // Guest user - use localStorage
                setWishlist(getLocalStorageWishlist());
            }

            setLoading(false);
        };

        loadWishlist();
    }, [isLoggedIn]);

    // Save to localStorage for guests
    useEffect(() => {
        if (isLoggedIn === false && typeof window !== "undefined") {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(wishlist));
        }
    }, [wishlist, isLoggedIn]);

    const getLocalStorageWishlist = (): Product[] => {
        if (typeof window === "undefined") return [];
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    };

    const clearLocalStorageWishlist = () => {
        if (typeof window !== "undefined") {
            localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
    };

    const syncLocalToDatabase = async (items: Product[]) => {
        for (const item of items) {
            try {
                await fetch("/api/wishlist", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ product_id: item.id }),
                });
            } catch (error) {
                console.error("Error syncing item to database:", error);
            }
        }
    };

    const addToWishlist = useCallback(async (product: Product) => {
        // Optimistically update UI
        setWishlist((prev) => {
            if (prev.some((p) => p.id === product.id)) return prev;
            return [...prev, product];
        });

        if (isLoggedIn) {
            // Sync to database
            try {
                await fetch("/api/wishlist", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ product_id: product.id }),
                });
            } catch (error) {
                console.error("Error adding to wishlist:", error);
                // Revert on error
                setWishlist((prev) => prev.filter((p) => p.id !== product.id));
            }
        }
    }, [isLoggedIn]);

    const removeFromWishlist = useCallback(async (id: number) => {
        // Optimistically update UI
        const previousWishlist = wishlist;
        setWishlist((prev) => prev.filter((p) => p.id !== id));

        if (isLoggedIn) {
            // Sync to database
            try {
                const res = await fetch(`/api/wishlist/${id}`, {
                    method: "DELETE",
                });
                if (!res.ok) {
                    // Revert on error
                    setWishlist(previousWishlist);
                }
            } catch (error) {
                console.error("Error removing from wishlist:", error);
                // Revert on error
                setWishlist(previousWishlist);
            }
        }
    }, [isLoggedIn, wishlist]);

    const isInWishlist = useCallback((id: number) => {
        return wishlist.some((p) => p.id === id);
    }, [wishlist]);

    return (
        <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist, loading }}>
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const context = useContext(WishlistContext);
    if (!context) throw new Error("useWishlist must be used inside a WishlistProvider");
    return context;
}
