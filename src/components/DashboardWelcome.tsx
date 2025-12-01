'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import AddProductForm from './dashboard/AddProductForm';
import ImageUploader from './ImageUploader';

type User = { id: number; email: string };
type Product = {
    id: number;
    name: string;
    description: string;
    price: number;
    artisan_id: number;
};



export default function DashboardWelcome() {
    const [user, setUser] = useState<User | null>(null);
    const [artisanId, setArtisanId] = useState<number | null>(null);
    const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [loggingOut, setLoggingOut] = useState(false);

    const router = useRouter();

    // Load user and artisan
    useEffect(() => {
        let isMounted = true;

        async function loadDashboard() {
            try {
                // 1. Load user
                const resUser = await fetch('/api/auth/me', { credentials: 'include' });
                const dataUser = await resUser.json();
                if (!isMounted) return;
                setUser(dataUser?.user ?? null);

                if (!dataUser?.user?.id) return;

                // 2. Load artisan
                const resArtisan = await fetch(`/api/artisans/by-user/${dataUser.user.id}`);
                const dataArtisan = await resArtisan.json();
                const artisanId = dataArtisan.artisan?.id ?? null;
                setArtisanId(artisanId);
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

    const username = user?.email?.split('@')[0];
    const welcomeText = loading ? 'Loading user...' : user ? `Welcome, ${username}!` : 'Welcome!';


    return (
        <div className="max-w-5xl mx-auto p-6 flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gray-50 p-4 rounded-lg shadow">
                <p className="text-lg font-semibold text-gray-800">{welcomeText}</p>
                <Button
                    variant="outline"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="mt-2 sm:mt-0"
                >
                    {loggingOut ? 'Logging out...' : 'Logout'}
                </Button>
            </div>

            {/* Add Product Form */}
            {artisanId && (
                <AddProductForm
                    artisanId={artisanId}
                    onSaved={(newProduct: Product) => {
                        // Select the newly added product in ImageUploader
                        setSelectedProductId(newProduct.id);
                    }}
                />
            )}

            {/* Image Uploader */}
            {artisanId && (
                <div className="mt-6">
                    <ImageUploader
                        mode="manage"
                        artisanId={artisanId}
                        productId={selectedProductId ?? undefined}
                    />
                </div>
            )}
        </div>
    );
}
