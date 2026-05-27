"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { loginSchema, type LoginInput } from "@/validations/auth";

export function LoginForm() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
    });

    async function onSubmit(data: LoginInput) {
        setError(null);

        const result = await signIn("credentials", {
            email: data.email,
            password: data.password,
            redirect: false,
        });

        if (result?.error) {
            setError("Invalid email or password");
            return;
        }

        router.push("/");
        router.refresh();
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <label
                    htmlFor="email"
                    className="text-sm font-medium leading-none"
                >
                    Email
                </label>
                <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...register("email")}
                />
                {errors.email && (
                    <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <label
                    htmlFor="password"
                    className="text-sm font-medium leading-none"
                >
                    Password
                </label>
                <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...register("password")}
                />
                {errors.password && (
                    <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
            </div>

            {error && (
                <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {error}
                </div>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
        </form>
    );
}
