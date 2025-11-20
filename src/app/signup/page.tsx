'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const router = useRouter();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const res = await fetch("/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

const data = await res.json();

if (res.ok) {
    alert(data.message || "Account created successfully!");
    router.push("/login");
} else {
    alert(data.error || "Signup failed. Please try again.");
}
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <form
                onSubmit={handleSubmit}
                className="bg-card p-8 rounded-lg shadow-md w-full max-w-sm flex flex-col gap-4">
                <h1 className="text-2xl font-heading text-foreground text-center">Sign Up</h1>

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
                    Sign Up
                </button>
            </form>
        </div>

    );
}
