"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "../services/authService";

/**
 * Hook that protects a page — redirects to login if not authenticated
 * @returns {{ isChecking: boolean }} - true while verifying auth status
 */
export function useAuthGuard() {
    const [isChecking, setIsChecking] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (!isLoggedIn()) {
            // Not logged in → redirect to login page
            router.replace("/");
        } else {
            // Logged in → allow access
            setIsChecking(false);
        }
    }, [router]);

    return { isChecking };
}

/**
 * Hook that redirects away from login if already authenticated
 * @returns {{ isChecking: boolean }}
 */
export function useRedirectIfAuth() {
    const [isChecking, setIsChecking] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (isLoggedIn()) {
            // Already logged in → skip login, go to dashboard
            router.replace("/dashboard");
        } else {
            // Not logged in → show login page
            setIsChecking(false);
        }
    }, [router]);

    return { isChecking };
}