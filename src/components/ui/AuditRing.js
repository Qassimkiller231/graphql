"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

// ─── AuditRing Component ────────────────────────────────────
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

    const clampedRatio = Math.min(ratio, 2);
    const fillPercent = clampedRatio / 2;
    const offset = circumference * (1 - fillPercent);

    const getColor = (r) => {
        if (r < 0.6) return "#ef4444";
        if (r < 0.9) return "#f97316";
        if (r < 1.1) return "#eab308";
        if (r < 1.5) return "#22c55e";
        return "#10b981";
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
                position: "relative",
                overflow: "hidden",
            }}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            whileHover={{
                scale: 1.04,
                boxShadow: `0 0 30px ${color}30, 0 8px 32px rgba(0,0,0,0.3)`,
            }}
            transition={{
                duration: 0.6,
                delay: delay,
                ease: [0.22, 1, 0.36, 1],
            }}
        >
            {/* Ambient glow orb */}
            <motion.div
                style={{
                    position: "absolute",
                    width: "100px",
                    height: "100px",
                    borderRadius: "50%",
                    background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
                    filter: "blur(25px)",
                    pointerEvents: "none",
                    zIndex: 0,
                }}
                animate={{
                    x: ["-30%", "40%", "10%", "-30%"],
                    y: ["-20%", "20%", "50%", "-20%"],
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* Label */}
            <p style={{
                color: "#6b7280",
                fontSize: "13px",
                fontWeight: "500",
                textTransform: "uppercase",
                letterSpacing: "1.5px",
                marginBottom: "16px",
                position: "relative",
                zIndex: 1,
            }}>
                Audit Ratio
            </p>

            {/* SVG Ring with pulsing glow */}
            <motion.div
                style={{ position: "relative", width: size, height: size, zIndex: 1 }}
                animate={{
                    filter: [
                        `drop-shadow(0 0 6px ${color}40)`,
                        `drop-shadow(0 0 14px ${color}60)`,
                        `drop-shadow(0 0 6px ${color}40)`,
                    ],
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            >
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
                    <motion.span
                        style={{
                            fontSize: "36px",
                            fontWeight: "700",
                            color: color,
                            lineHeight: 1,
                        }}
                        animate={{
                            textShadow: [
                                `0 0 20px ${color}30`,
                                `0 0 30px ${color}60`,
                                `0 0 20px ${color}30`,
                            ],
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    >
                        {ratio.toFixed(1)}
                    </motion.span>
                    <span style={{
                        fontSize: "11px",
                        color: "#6b7280",
                        marginTop: "4px",
                    }}>
                        {ratio >= 1 ? "Above average" : "Needs improvement"}
                    </span>
                </div>
            </motion.div>
        </motion.div>
    );
}
