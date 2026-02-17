"use client";
import { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";

// ─── CountUp Animation ──────────────────────────────────────
function useCountUp(target, duration = 2000, decimals = 0) {
    const [value, setValue] = useState(0);
    const startTime = useRef(null);

    useEffect(() => {
        if (!target && target !== 0) return;

        const animate = (timestamp) => {
            if (!startTime.current) startTime.current = timestamp;
            const progress = Math.min((timestamp - startTime.current) / duration, 1);
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
export default function StatCard({ label, value, format, color, delay = 0, icon }) {
    const animated = useCountUp(value, 2200, format ? 0 : 0);
    const displayValue = format ? format(animated) : animated.toLocaleString();

    // Mouse tilt tracking
    const cardRef = useRef(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const rotateX = useTransform(mouseY, [-0.5, 0.5], [8, -8]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], [-8, 8]);

    const handleMouse = (e) => {
        const rect = cardRef.current.getBoundingClientRect();
        mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
        mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
    };

    const handleMouseLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
    };

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
            onMouseMove={handleMouse}
            onMouseLeave={handleMouseLeave}
        >
            {/* Ambient glow orb — floats around behind content */}
            <motion.div
                style={{
                    position: "absolute",
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    background: `radial-gradient(circle, ${color}25 0%, transparent 70%)`,
                    filter: "blur(20px)",
                    pointerEvents: "none",
                    zIndex: 0,
                }}
                animate={{
                    x: ["-20%", "60%", "20%", "-20%"],
                    y: ["-10%", "30%", "70%", "-10%"],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* Icon with float + pulse */}
            {icon && (
                <motion.div
                    style={{
                        fontSize: "32px",
                        marginBottom: "12px",
                        filter: `drop-shadow(0 0 10px ${color}60)`,
                        position: "relative",
                        zIndex: 1,
                    }}
                    animate={{
                        y: [0, -4, 0],
                        filter: [
                            `drop-shadow(0 0 8px ${color}40)`,
                            `drop-shadow(0 0 16px ${color}70)`,
                            `drop-shadow(0 0 8px ${color}40)`,
                        ],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                >
                    {icon}
                </motion.div>
            )}

            {/* Label */}
            <p style={{
                color: "#6b7280",
                fontSize: "13px",
                fontWeight: "500",
                textTransform: "uppercase",
                letterSpacing: "1.5px",
                marginBottom: "10px",
                position: "relative",
                zIndex: 1,
            }}>
                {label}
            </p>

            {/* Animated Value with subtle pulse */}
            <motion.p
                style={{
                    fontSize: "32px",
                    fontWeight: "700",
                    color: color,
                    lineHeight: 1.1,
                    position: "relative",
                    zIndex: 1,
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
                {displayValue}
            </motion.p>
        </motion.div>
    );
}
