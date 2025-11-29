import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import DashboardWelcome from "@/components/DashboardWelcome";

export default function DashboardPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />

            <main className="flex-1">
                <div className="container mx-auto px-4 py-8 space-y-8">
                    {/* Page Header */}
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold">Dashboard</h1>
                    </div>

                    {/* Overview Section */}
                    <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="text-xl font-semibold text-gray-800">Overview</h2>
                        <p className="mt-2 text-gray-600">
                            Welcome to your dashboard! Here you can manage your products, upload images, and monitor your artisan account.
                        </p>
                    </section>

                    {/* Main Dashboard Components */}
                    <section className="space-y-6">
                        <DashboardWelcome />
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
}
