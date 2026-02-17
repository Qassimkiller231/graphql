"use client";
import { useState, useEffect } from "react";
import Lottie from "lottie-react";

/**
 * Loads a Lottie animation from a remote URL and renders it.
 * Falls back to a static emoji if the fetch fails.
 */
export default function LottieIcon({ url, fallback = "✨", size = 40, loop = true }) {
    const [animationData, setAnimationData] = useState(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        let cancelled = false;
        fetch(url)
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch");
                return res.json();
            })
            .then((data) => {
                if (!cancelled) setAnimationData(data);
            })
            .catch(() => {
                if (!cancelled) setError(true);
            });
        return () => { cancelled = true; };
    }, [url]);

    if (error || !animationData) {
        return (
            <span style={{ fontSize: `${size}px`, lineHeight: 1 }}>
                {fallback}
            </span>
        );
    }

    return (
        <Lottie
            animationData={animationData}
            loop={loop}
            style={{ width: size, height: size }}
        />
    );
}
