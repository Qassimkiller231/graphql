"use client";
import { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";

// ─── CountUp Animation ──────────────────────────────────────
// Animates a number from 0 to target using requestAnimationFrame
function useCountUp(target, duration = 2000, decimals = 0) {
    const [value, setValue] = useState(0);
    const startTime = useRef(null);

    useEffect(() => {
        if (!target && target !== 0) return;

        const animate = (timestamp) => {
            if (!startTime.current) startTime.current = timestamp;
            const progress = Math.min((timestamp - startTime.current) / duration, 1);

            // Ease-out cubic: fast start, smooth landing
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(eased * target);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
        return () => { startTime.current = null; };
    }, [target, duration]);

    return decimals > 0 ? value.toFixed(decimals) : Math.floor(value);
}

// ─── StatCard Component ─────────────────────────────────────
// Props:
//   label    - "Total XP"
//   value    - the raw number
//   format   - function to format the display (e.g., formatXP)
//   color    - accent color hex (e.g., "#a855f7")
//   delay    - stagger delay for entrance animation
//   icon     - emoji or icon string
export default function StatCard({ label, value, format, color, delay = 0, icon }) {
    const animated = useCountUp(value, 2200, format ? 0 : 0);
    const displayValue = format ? format(animated) : animated.toLocaleString();

    // Mouse tilt tracking
    const cardRef = useRef(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const rotateX = useTransform(mouseY, [-0.5, 0.5], [6, -6]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], [-6, 6]);

    const handleMouse = (e) => {
        const rect = cardRef.current.getBoundingClientRect();
        mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
        mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
    };

    const handleMouseLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
    };

    // Set CSS custom properties for card color theming
    const cardStyle = {
        "--card-color": color,
        "--card-color-faint": `${color}18`,
        perspective: "800px",
    };

    return (
        <motion.div
            ref={cardRef}
            className="stat-card"
            style={{
                ...cardStyle,
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
            }}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
                duration: 0.6,
                delay: delay,
                ease: [0.22, 1, 0.36, 1],
            }}
            onMouseMove={handleMouse}
            onMouseLeave={handleMouseLeave}
        >
            {/* Icon */}
            {icon && (
                <div style={{
                    fontSize: "32px",
                    marginBottom: "12px",
                    filter: `drop-shadow(0 0 8px ${color}60)`,
                }}>
                    {icon}
                </div>
            )}

            {/* Label */}
            <p style={{
                color: "#6b7280",
                fontSize: "13px",
                fontWeight: "500",
                textTransform: "uppercase",
                letterSpacing: "1.5px",
                marginBottom: "10px",
            }}>
                {label}
            </p>

            {/* Animated Value */}
            <p style={{
                fontSize: "32px",
                fontWeight: "700",
                color: color,
                textShadow: `0 0 20px ${color}40`,
                lineHeight: 1.1,
            }}>
                {displayValue}
            </p>
        </motion.div>
    );
}
