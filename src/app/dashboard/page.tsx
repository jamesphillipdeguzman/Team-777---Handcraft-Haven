import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DashboardWelcome } from "@/components/DashboardWelcome";

export default function DashboardPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">
                <div className="container mx-auto px-4 py-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold">Dashboard</h1>
                    </div>

                    <DashboardWelcome />

                    <section className="rounded-lg border border-border bg-card/50 p-6">
                        <h2 className="text-xl font-semibold text-foreground">Overview</h2>
                        <p className="mt-2 text-muted-foreground">
                            You are on the dashboard page. Great!
                        </p>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
}
