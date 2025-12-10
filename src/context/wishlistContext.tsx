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

    // -------------------------------
    // Helper functions
    // -------------------------------
    const getLocalStorageWishlist = (): Product[] => {
        if (typeof window === "undefined") return [];
        try {
            const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (!stored) return [];
            const parsed = JSON.parse(stored);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    };

    const setLocalStorageWishlist = (items: Product[]) => {
        if (typeof window === "undefined") return;
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
        } catch { }
    };

    const clearLocalStorageWishlist = () => {
        if (typeof window !== "undefined") {
            localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
        setWishlist([]);
    };

    const syncLocalToDatabase = async (items: Product[]) => {
        if (!items.length) return;
        try {
            await Promise.all(
                items.map(item =>
                    fetch("/api/wishlist", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ product_id: item.id }),
                    })
                )
            );
        } catch (error) {
            console.error("Error syncing wishlist items to database:", error);
        }
    };

    // -------------------------------
    // Check auth status
    // -------------------------------
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

    // -------------------------------
    // Load wishlist based on auth status
    // -------------------------------
    useEffect(() => {
        if (isLoggedIn === null) return;

        const loadWishlist = async () => {
            setLoading(true);

            if (isLoggedIn) {
                // Logged-in: fetch DB wishlist
                try {
                    const res = await fetch("/api/wishlist");
                    if (res.ok) {
                        const data = await res.json();
                        let dbWishlist: Product[] = data.items || [];

                        // Merge localStorage items if any
                        const localItems = getLocalStorageWishlist();
                        if (localItems.length > 0) {
                            await syncLocalToDatabase(localItems);
                            clearLocalStorageWishlist();
                            dbWishlist = [...dbWishlist, ...localItems];
                        }

                        setWishlist(dbWishlist);
                    } else {
                        setWishlist(getLocalStorageWishlist());
                    }
                } catch {
                    setWishlist(getLocalStorageWishlist());
                }
            } else {
                // Guest: use localStorage
                setWishlist(getLocalStorageWishlist());
            }

            setLoading(false);
        };

        loadWishlist();
    }, [isLoggedIn]);

    // -------------------------------
    // Save to localStorage for guests
    // -------------------------------
    useEffect(() => {
        if (isLoggedIn === false) {
            setLocalStorageWishlist(wishlist);
        }
    }, [wishlist, isLoggedIn]);

    // -------------------------------
    // Wishlist actions
    // -------------------------------
    const addToWishlist = useCallback(
        async (product: Product) => {
            // Prevent duplicates
            setWishlist(prev => {
                if (prev.some(p => p.id === product.id)) return prev;
                return [...prev, product];
            });

            if (isLoggedIn) {
                try {
                    await fetch("/api/wishlist", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ product_id: product.id }),
                    });
                } catch {
                    // Revert on error
                    setWishlist(prev => prev.filter(p => p.id !== product.id));
                }
            }
        },
        [isLoggedIn]
    );

    const removeFromWishlist = useCallback(
        async (id: number) => {
            const previousWishlist = wishlist;
            setWishlist(prev => prev.filter(p => p.id !== id));

            if (isLoggedIn) {
                try {
                    const res = await fetch(`/api/wishlist/${id}`, { method: "DELETE" });
                    if (!res.ok) setWishlist(previousWishlist);
                } catch {
                    setWishlist(previousWishlist);
                }
            }
        },
        [isLoggedIn, wishlist]
    );

    const isInWishlist = useCallback((id: number) => wishlist.some(p => p.id === id), [wishlist]);

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
