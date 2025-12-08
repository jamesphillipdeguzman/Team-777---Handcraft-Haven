'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data?.error || "Unable to log in. Please try again.");
            return;
        }

        // Cookie is already set by the server as HttpOnly
        // No need to set it client-side
        alert(data?.message || "Login successful!");

        if (data.role === "artisan") {
            router.replace("/dashboard");
        } else {
            router.replace("/account");
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <form
                onSubmit={handleSubmit}
                className="bg-card p-8 rounded-lg shadow-md w-full max-w-sm flex flex-col gap-4"
            >
                <h1 className="text-2xl font-heading text-foreground text-center">Login</h1>

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="border border-border p-2 rounded focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="border border-border p-2 rounded focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                />
                <button
                    type="submit"
                    className="bg-primary text-primary-foreground p-2 rounded hover:bg-primary-foreground hover:text-primary transition-colors"
                >
                    Login
                </button>

                <p className="text-sm text-center">
                    Don&apos;t have an account? <Link href="/signup">Sign Up</Link>
                </p>
            </form>
        </div>
    );
}