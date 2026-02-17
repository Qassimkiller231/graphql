"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "../services/authService";

/**
 * Custom React hook that manages the entire login flow
 * Returns state values and handlers for the login form
 */
export function useLogin() {
    // Form field state
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");

    // UI state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Next.js router for navigation
    const router = useRouter();

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();     // Stop the form from refreshing the page
        setLoading(true);       // Show loading spinner
        setError(null);         // Clear any previous errors

        try {
            // Call the auth service (which saves the token)
            await loginUser(identifier, password);

            // If we reach here, login succeeded → go to dashboard
            router.push("/dashboard");
        } catch (err) {
            // If loginUser threw an error, show it to the user
            setError(err.message);
        } finally {
            // Always stop the loading spinner, whether success or fail
            setLoading(false);
        }
    };

    // Return everything the page needs
    return {
        // Form values (the page binds these to inputs)
        identifier,
        setIdentifier,
        password,
        setPassword,

        // UI state (the page uses these to show spinner/errors)
        loading,
        error,

        // Action (the page calls this on form submit)
        handleSubmit,
    };
}