'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import AddProductForm from './dashboard/AddProductForm';
import ImageUploader from './ImageUploader';

type User = {
    id: number;
    email: string;
    artisan?: {
        id: number;
        name?: string | null;
        bio?: string;
        profile_image?: string | null;
    } | null;
};

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
        return () => {
            isMounted = false;
        };
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

    const handleProductSelect = (productId: string) => {
        if (!productId) {
            setSelectedProduct(null);
            setMode('add');
            return;
        }

        const prod = products.find(p => p.id === Number(productId));
        if (!prod) return;

        setSelectedProduct({ ...prod, categoryIds: prod.categoryIds || [] });
        setMode('manage');
    };

    const displayName = user?.artisan?.name || name || user?.email.split('@')[0] || 'User';
    const profileImgSrc = user?.artisan?.profile_image || profileImage || null;

    return (
        // Main container with background color
        <main className="min-h-screen bg-background text-foreground font-sans px-4 py-6">
            <div className="max-w-7xl mx-auto flex flex-col gap-6">
                {/* Profile Welcome */}
                <div className="flex items-center gap-4 mb-2">
                    <h2 className="text-2xl font-semibold font-heading text-foreground">
                        Welcome, {displayName}!
                    </h2>

                    {profileImgSrc ? (
                        <Image
                            src={profileImgSrc}
                            alt={displayName}
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                            <span className="text-accent-foreground font-bold">{displayName[0]}</span>
                        </div>
                    )}
                </div>

                {/* Logout / Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center bg-card p-4 rounded-lg shadow border border-border gap-4">
                    {!user ? (
                        <Button variant="outline" onClick={() => router.push('/login')}>
                            Login
                        </Button>
                    ) : (
                        <Button variant="outline" onClick={handleLogout} disabled={loggingOut}>
                            {loggingOut ? 'Logging out...' : 'Logout'}
                        </Button>
                    )}
                </div>

                {/* Product Selector */}
                {products.length > 0 && (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <label htmlFor="product-select" className="font-medium">
                            Select Product:
                        </label>
                        <select
                            id="product-select"
                            value={selectedProduct?.id ?? ''}
                            onChange={e => handleProductSelect(e.target.value)}
                            className="border border-border rounded px-3 py-2 bg-card text-foreground"
                        >
                            <option value="">-- Add New Product --</option>
                            {products.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Add/Manage Product Form */}
                {artisanId !== null && (
                    <AddProductForm
                        artisanId={artisanId}
                        mode={mode}
                        product={selectedProduct ?? undefined}
                        onSaved={savedProduct => {
                            setSelectedProduct(savedProduct);
                            setMode('manage');
                            setProducts(prev =>
                                prev.some(p => p.id === savedProduct.id)
                                    ? prev.map(p => (p.id === savedProduct.id ? savedProduct : p))
                                    : [...prev, savedProduct]
                            );
                        }}
                    />
                )}

                {/* Image Uploader */}
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
        </main>
    );
}
