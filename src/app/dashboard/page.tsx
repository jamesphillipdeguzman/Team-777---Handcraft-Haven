'use client';

import { useEffect, useState } from 'react';
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import DashboardWelcome from "@/components/DashboardWelcome";

export default function DashboardPage() {
    const [name, setName] = useState('');
    const [profileImage, setProfileImage] = useState<string | null>(null);

    useEffect(() => {
        async function loadUser() {
            try {
                const resUser = await fetch('/api/auth/me', { credentials: 'include' });
                const dataUser = await resUser.json();
                if (!dataUser?.user) return;

                // Extract username from email
                const username = dataUser.user.email?.split('@')[0] || '';
                setName(username);

                // Fetch artisan profile by user ID
                const resArtisan = await fetch(`/api/artisans/by-user/${dataUser.user.id}`);
                const dataArtisan = await resArtisan.json();
                if (dataArtisan?.artisan?.profile_image) {
                    setProfileImage(dataArtisan.artisan.profile_image);
                }
            } catch (err) {
                console.error('Failed to load user or artisan', err);
            }
        }

        loadUser();
    }, []);

    return (
        <div className="flex min-h-screen flex-col bg-gray-50">
            <Navbar />

            <main className="flex-1">
                <div className="container mx-auto px-4 py-8 space-y-8">

                    {/* Page Header */}
                    <div className="flex items-center justify-between border-b pb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                            <p className="text-gray-600 mt-1">
                                Welcome back! Manage your artisan shop here.
                            </p>
                        </div>
                    </div>

                    {/* Overview Section */}
                    <section className="rounded-xl border border-gray-300 bg-white p-6 shadow-sm">
                        <h2 className="text-xl font-semibold text-gray-800">Overview</h2>
                        <p className="mt-2 text-gray-600 leading-relaxed">
                            This section gives you a quick snapshot of your artisan activity, including
                            your latest updates, product management tools, and uploaded images.
                        </p>
                    </section>

                    {/* Main Dashboard Components */}
                    <section className="space-y-6">
                        <DashboardWelcome name={name} profileImage={profileImage} />
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
}
