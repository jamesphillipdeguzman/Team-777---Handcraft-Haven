'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import Image from 'next/image';
import Link from 'next/link';

interface Artisan {
    id: number;
    name: string;
    bio?: string;
    profile_image?: string | null;
}

interface Product {
    id: number;
    name: string;
    price: number;
    image_url?: string | null;
}

export default function ArtisanProfilePage() {
    const { id } = useParams();

    const [artisan, setArtisan] = useState<Artisan | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading(true);
        setError(null);

        fetch(`/api/artisans/${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setArtisan(data.artisan);
                    setProducts(data.products || []);
                } else {
                    setError(data.error || 'Failed to load artisan.');
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError('Failed to load artisan.');
                setLoading(false);
            });
    }, [id]);

    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />

            <main className="flex-1">
                <div className="container mx-auto px-4 py-8 flex flex-col items-center">
                    {loading && <p>Loading...</p>}
                    {error && <p className="text-red-500">{error}</p>}

                    {artisan && (
                        <>
                            {artisan.profile_image ? (
                                <Image
                                    src={artisan.profile_image}
                                    alt={artisan.name}
                                    width={128}
                                    height={128}
                                    className="w-32 h-32 rounded-full mb-4 object-cover"
                                />
                            ) : (
                                <div className="w-32 h-32 rounded-full bg-muted mb-4 flex items-center justify-center">
                                    <span className="text-2xl font-bold text-muted-foreground">
                                        {artisan.name[0]}
                                    </span>
                                </div>
                            )}
                            <h1 className="text-3xl font-bold">{artisan.name}</h1>
                            {artisan.bio && (
                                <p className="text-center mt-2 text-muted-foreground">{artisan.bio}</p>
                            )}
                        </>
                    )}

                    <div className="w-full mt-8">
                        <span className="text-2xl font-bold text-gray-800 mb-4 block">
                            My Products
                        </span>

                        {!loading && products.length === 0 && (
                            <p className="text-center text-muted-foreground">
                                No products available for this artisan.
                            </p>
                        )}

                        {products.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {products.map(product => {
                                    const imageUrl = product.image_url || null;

                                    return (
                                        <div
                                            key={product.id}
                                            className="border rounded-lg p-4 flex flex-col items-center"
                                        >
                                            <Link href={`/products/${product.id}`} className="flex flex-col items-center">
                                                <div className="w-36 h-36 relative mb-2">
                                                    {imageUrl ? (
                                                        <Image
                                                            src={imageUrl}
                                                            alt={product.name}
                                                            fill
                                                            className="object-cover rounded"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-muted flex items-center justify-center rounded">
                                                            <span className="text-muted-foreground text-lg font-bold">
                                                                {product.name[0]}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                <h3 className="mt-2 font-medium">{product.name}</h3>
                                            </Link>
                                            <p className="text-sm text-muted-foreground">${Number(product.price).toFixed(2)}</p>
                                        </div>
                                    );
                                })}


                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
