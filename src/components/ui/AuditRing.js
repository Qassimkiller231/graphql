"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

// ─── AuditRing Component ────────────────────────────────────
// Renders an animated SVG circular gauge for the audit ratio
// Props:
//   ratio - number (e.g., 1.2 means you give 1.2x more than you receive)
//   size  - pixel width/height of the ring
//   delay - entrance animation delay
export default function AuditRing({ ratio, size = 160, delay = 0 }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), delay * 1000 + 100);
        return () => clearTimeout(timer);
    }, [delay]);

    // Ring math
    const strokeWidth = 10;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    // Clamp ratio to 0–2 range for the fill (2.0 = full circle)
    const clampedRatio = Math.min(ratio, 2);
    const fillPercent = clampedRatio / 2;
    const offset = circumference * (1 - fillPercent);

    // Color based on ratio: red (< 0.5) → yellow (1.0) → green (> 1.5)
    const getColor = (r) => {
        if (r < 0.6) return "#ef4444";   // Red — bad
        if (r < 0.9) return "#f97316";   // Orange — meh
        if (r < 1.1) return "#eab308";   // Yellow — okay
        if (r < 1.5) return "#22c55e";   // Green — good
        return "#10b981";                  // Emerald — great
    };

    const color = getColor(ratio);

    return (
        <motion.div
            className="stat-card"
            style={{
                "--card-color": color,
                "--card-color-faint": `${color}18`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
            }}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
                duration: 0.6,
                delay: delay,
                ease: [0.22, 1, 0.36, 1],
            }}
        >
            {/* Label */}
            <p style={{
                color: "#6b7280",
                fontSize: "13px",
                fontWeight: "500",
                textTransform: "uppercase",
                letterSpacing: "1.5px",
                marginBottom: "16px",
            }}>
                Audit Ratio
            </p>

            {/* SVG Ring */}
            <div style={{ position: "relative", width: size, height: size }}>
                <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
                    {/* Background track */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="rgba(255,255,255,0.06)"
                        strokeWidth={strokeWidth}
                    />
                    {/* Animated fill arc */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke={color}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={mounted ? offset : circumference}
                        style={{
                            transition: "stroke-dashoffset 2s cubic-bezier(0.22, 1, 0.36, 1), stroke 0.5s ease",
                            filter: `drop-shadow(0 0 8px ${color}80)`,
                        }}
                    />
                </svg>

                {/* Center text */}
                <div style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                }}>
                    <span style={{
                        fontSize: "36px",
                        fontWeight: "700",
                        color: color,
                        textShadow: `0 0 20px ${color}40`,
                        lineHeight: 1,
                    }}>
                        {ratio.toFixed(1)}
                    </span>
                    <span style={{
                        fontSize: "11px",
                        color: "#6b7280",
                        marginTop: "4px",
                    }}>
                        {ratio >= 1 ? "Above average" : "Needs improvement"}
                    </span>
                </div>
            </div>
        </motion.div>
    );
}
