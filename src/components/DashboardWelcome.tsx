'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from "next/image";
import { Button } from '@/components/ui/button';
import AddProductForm from './dashboard/AddProductForm';
import ImageUploader from './ImageUploader';

type User = { id: number; email: string };

export type Product = {
    id: number;
    name: string;
    description: string;
    price: number;
    artisan_id: number;
    categoryIds?: number[];
};

interface DashboardWelcomeProps {
    name: string;
    profileImage?: string | null;
}

export default function DashboardWelcome({ name, profileImage }: DashboardWelcomeProps) {
    const [user, setUser] = useState<User | null>(null);
    const [artisanId, setArtisanId] = useState<number | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [mode, setMode] = useState<'add' | 'manage'>('add');
    const [loading, setLoading] = useState(true);
    const [loggingOut, setLoggingOut] = useState(false);

    const router = useRouter();

    // Load user & artisan
    useEffect(() => {
        let isMounted = true;

        async function loadDashboard() {
            try {
                const resUser = await fetch('/api/auth/me', { credentials: 'include' });
                const dataUser = await resUser.json();
                if (!isMounted) return;

                setUser(dataUser?.user ?? null);
                if (!dataUser?.user?.id) return;

                const resArtisan = await fetch(`/api/artisans/by-user/${dataUser.user.id}`);
                const dataArtisan = await resArtisan.json();
                const artisanId = dataArtisan.artisan?.id ?? null;

                setArtisanId(artisanId);

                if (artisanId) {
                    const resProducts = await fetch(`/api/products/by-artisan/${artisanId}`);
                    const dataProducts = await resProducts.json();
                    setProducts(dataProducts.products || []);
                }
            } catch (err) {
                console.error('Error loading dashboard:', err);
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        loadDashboard();
        return () => { isMounted = false; };
    }, []);

    const handleLogout = async () => {
        try {
            setLoggingOut(true);
            await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
            router.replace('/');
        } catch (err) {
            console.error('Logout failed', err);
        } finally {
            setLoggingOut(false);
        }
    };

    const handleProductSelect = async (productId: string) => {
        if (!productId) {
            setSelectedProduct(null);
            setMode('add');
            return;
        }

        const prod = products.find(p => p.id === Number(productId));
        if (!prod) return;

        try {
            const res = await fetch(`/api/products/${productId}/categories`);
            const data = await res.json();
            const categoryIds: number[] = data.categoryIds || [];

            setSelectedProduct({ ...prod, categoryIds });
            setMode('manage');
        } catch (err) {
            console.error('Failed to load product categories', err);
            setSelectedProduct({ ...prod, categoryIds: [] });
            setMode('manage');
        }
    };


    const username = user?.email?.split('@')[0];
    const welcomeText = loading ? 'Loading user...' : user ? `Welcome, ${username}!` : 'Welcome!';
    console.log(welcomeText);

    return (
        <div className="w-full flex flex-col gap-6">
            {/* Profile Welcome Section */}
            <div className="flex items-center gap-4 mb-2">
                <h2 className="text-2xl font-semibold text-gray-900">
                    Welcome, {name}
                </h2>

                {/* Profile image or placeholder */}
                {profileImage ? (
                    <Image
                        src={profileImage}
                        alt={name}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full object-cover"
                    />
                ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-white font-bold">{name[0]}</span>
                    </div>
                )}
            </div>


            {/* Header with logout */}
            <div className="flex flex-col sm:flex-row sm:items-center
                bg-gray-50 p-4 rounded-lg shadow border border-gray-200">
                {/* If NOT logged in → show Login button instead */}
                {!user ? (
                    <Button
                        variant="outline"
                        onClick={() => router.push('/login')}
                        className="mt-2 sm:mt-0"
                    >
                        Login
                    </Button>
                ) : (
                    <Button
                        variant="outline"
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className="mt-2 sm:mt-0"
                    >
                        {loggingOut ? "Logging out..." : "Logout"}
                    </Button>
                )}

            </div>


            {/* Product Selector */}
            {products.length > 0 && (
                <div className="flex items-center gap-3">
                    <label htmlFor="product-select" className="font-medium">Select Product:</label>
                    <select
                        id="product-select"
                        value={selectedProduct?.id ?? ""}
                        onChange={e => handleProductSelect(e.target.value)}
                        className="border border-gray-300 rounded px-3 py-2"
                    >
                        <option value="">-- Add New Product --</option>
                        {products.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Forms */}
            {artisanId !== null && (
                <AddProductForm
                    artisanId={artisanId}
                    mode={mode}
                    product={selectedProduct ?? undefined}
                    onSaved={(savedProduct) => {
                        setSelectedProduct(savedProduct);
                        setMode('manage');
                        setProducts(prev =>
                            prev.some(p => p.id === savedProduct.id)
                                ? prev.map(p => p.id === savedProduct.id ? savedProduct : p)
                                : [...prev, savedProduct]
                        );
                    }}
                />
            )}


            {/* Image Upload if product selected */}
            {artisanId && selectedProduct && (
                <div className="mt-6">
                    <ImageUploader
                        mode="manage"
                        product={selectedProduct}
                        artisanId={artisanId}
                        productId={selectedProduct.id}
                    />
                </div>
            )}
        </div>
    );
}
