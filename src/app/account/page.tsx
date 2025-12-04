import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LogoutButton } from "@/components/account/LogoutButton";
import AccountSettingsForm from "@/components/account/AccountSettingsForm";
import { isLoggedIn } from "@/lib/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function AccountPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!isLoggedIn(token)) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold">My Account</h1>
          <p className="mt-4 text-gray-600">
            Manage your account settings and preferences
          </p>
          <AccountSettingsForm />
          <hr className="my-4" />
          <div className="mt-6">
            <LogoutButton />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}