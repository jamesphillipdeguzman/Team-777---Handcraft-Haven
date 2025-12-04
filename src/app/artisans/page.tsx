"use client";

import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';

interface Artisan {
    id: number;
    name: string;
    bio?: string;
    profile_image?: string | null;
}

export default function ArtisansPage() {
    const [artisans, setArtisans] = useState<Artisan[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/artisans')
            .then(res => res.json())
            .then(data => {
                setArtisans(data.artisans || []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    return (
        <div>
            <Navbar />
            <main className="flex-1">
                <div className="container mx-auto px-4 py-8">
                    <h1 className="text-3xl font-bold mb-2">Artisans</h1>
                    <p className="text-muted-foreground mb-6">
                        Browse our collection of talented artisans.
                    </p>

                    {loading ? (
                        <p>Loading artisans...</p>
                    ) : artisans.length === 0 ? (
                        <p>No artisans found.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {artisans.map((artisan) => (
                                <div key={artisan.id} className="border rounded-lg p-4 flex flex-col items-center">
                                    {artisan.profile_image ? (
                                        <Image
                                            src={artisan.profile_image}
                                            alt={artisan.name}
                                            width={96}
                                            height={96}
                                            className="w-24 h-24 rounded-full mb-2 object-cover"
                                        />
                                    ) : (
                                        <div className="w-24 h-24 rounded-full bg-muted mb-2 flex items-center justify-center">
                                            <span className="text-xl font-bold text-muted-foreground">{artisan.name[0]}</span>
                                        </div>
                                    )}
                                    <h2 className="text-lg font-semibold">{artisan.name}</h2>
                                    {artisan.bio && <p className="text-sm text-muted-foreground text-center">{artisan.bio}</p>}
                                    <Link href={`/artisans/${artisan.id}`}>
                                        <Button variant="outline" className="mt-2 w-full">View Profile</Button>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
