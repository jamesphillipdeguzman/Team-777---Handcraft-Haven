'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import Image from 'next/image';

interface Artisan {
    id: number;
    name: string;
    bio?: string;
    profile_image?: string | null;
}

export default function ArtisanProfilePage() {
    const { id } = useParams();

    const [artisan, setArtisan] = useState<Artisan | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        // setError(null);

        fetch(`/api/artisans/${id}`)
            .then((res) => {
                if (!res.ok) {
                    setArtisan(null);
                    setError(
                        res.status === 404
                            ? 'Artisan not found.'
                            : 'Failed to load artisan profile.'
                    );
                    setLoading(false);
                    return null;
                }
                return res.json();
            })
            .then((data) => {
                if (!data) return;
                setArtisan(data.artisan || null);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setError('Failed to load artisan profile.');
                setLoading(false);
            });
    }, [id]);

    if (loading) {
        return (
            <div className="flex min-h-screen flex-col">
                <Navbar />
                <main className="flex-1 flex items-center justify-center">
                    <p>Loading artisan...</p>
                </main>
                <Footer />
            </div>
        );
    }

    if (error || !artisan) {
        return (
            <div className="flex min-h-screen flex-col">
                <Navbar />
                <main className="flex-1 flex items-center justify-center">
                    <p>{error || 'Artisan not found.'}</p>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">
                <div className="container mx-auto px-4 py-8 flex flex-col items-center">
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
                </div>
            </main>
            <Footer />
        </div>
    );
}
