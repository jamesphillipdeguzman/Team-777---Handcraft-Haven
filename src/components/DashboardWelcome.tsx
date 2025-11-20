'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

type User = {
    id: number;
    email: string;
};

export function DashboardWelcome() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [loggingOut, setLoggingOut] = useState(false);
    const router = useRouter();

    useEffect(() => {
        let isMounted = true;
        async function loadUser() {
            try {
                const res = await fetch("/api/auth/me", {
                    credentials: "include",
                });
                const data = await res.json();
                if (isMounted) {
                    setUser(data?.user ?? null);
                }
            } catch (error) {
                console.error("Failed to load user", error);
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        loadUser();
        return () => {
            isMounted = false;
        };
    }, []);

    async function handleLogout() {
        try {
            setLoggingOut(true);
            await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "include",
            });
            router.replace("/"); // redirect to home page
        } catch (error) {
            console.error("Failed to logout", error);
        } finally {
            setLoggingOut(false);
        }
    }

    const username = user?.email?.split("@")[0];

    const welcomeText = loading
        ? "Loading user..."
        : user
            ? `Welcome, ${username}!`
            : "Welcome!";

    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-border bg-card/50 p-4">
            <p className="text-lg font-semibold text-foreground">{welcomeText}</p>
            <Button
                variant="outline"
                onClick={handleLogout}
                disabled={loggingOut}
            >
                {loggingOut ? "Logging out..." : "Logout"}
            </Button>
        </div>
    );
}

