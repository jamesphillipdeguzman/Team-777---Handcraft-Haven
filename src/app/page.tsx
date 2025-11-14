import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center">
        <h1 className="text-4xl font-bold">Welcome to Handcraft Haven</h1>
      </main>
      <Footer />
    </div>
  );
}
