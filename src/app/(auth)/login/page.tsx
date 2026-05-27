import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth/session";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
    title: "Login",
};

export default async function LoginPage() {
    const session = await getSession();

    if (session) {
        redirect("/");
    }

    return (
        <div className="w-full max-w-sm space-y-6">
            <div className="space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
                <p className="text-sm text-muted-foreground">
                    Enter your credentials to access the dashboard
                </p>
            </div>
            <LoginForm />
        </div>
    );
}
