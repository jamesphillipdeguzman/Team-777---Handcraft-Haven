import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LoginForm from "@/components/account/LoginForm";

export default async function LoginPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (token) {
        redirect("/account");
    }

    return <LoginForm />;
}