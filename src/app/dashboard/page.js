"use client";
import { useAuthGuard } from "../hooks/useAuthGuard";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { graphqlRequest } from "../lib/graphClient";
import { logoutUser } from "../services/authService";
import { motion } from "framer-motion";
import ApexChart from "@/components/ui/chart";
import StatCard from "@/components/ui/StatCard";
import AuditRing from "@/components/ui/AuditRing";
import LottieIcon from "@/components/ui/LottieIcon";
import { formatXP } from "@/lib/utils";

// ─── GraphQL Query ──────────────────────────────────────────
// Fetches all dashboard data in a single request:
// - User profile, XP aggregate, XP transactions, skills,
// - Pass/fail grades, XP by project, piscine results
const DASHBOARD_QUERY = `{
    user {
        id
        login
        auditRatio
    }
    transaction_aggregate(where: { type: { _eq: "xp" } }) {
        aggregate {
            sum { amount }
            count
        }
    }
    transaction(
        where: { type: { _eq: "xp" } }
        order_by: { createdAt: asc }
    ) {
        amount
        createdAt
        path
    }
    skills: transaction(
        where: { type: { _like: "skill_%" } }
        order_by: [{ type: asc }, { amount: desc }]
        distinct_on: type
    ) {
        type
        amount
    }
    pass: result_aggregate(where: { grade: { _gte: 1 } }) {
        aggregate { count }
    }
    fail: result_aggregate(where: { grade: { _lt: 1 } }) {
        aggregate { count }
    }
    xp_by_project: transaction(
        where: { type: { _eq: "xp" }, path: { _nlike: "%piscine%" } }
        order_by: { amount: desc }
    ) {
        amount
        path
    }
    piscine_results: result(
        where: { path: { _like: "%piscine-js%" } }
        order_by: { createdAt: asc }
    ) {
        grade
        path
    }
}`;

// ─── Data Transformation ────────────────────────────────────
// Converts raw transactions into cumulative chart points
function buildCumulativeXP(transactions) {
    let cumulative = 0;
    return transactions.map((t) => {
        cumulative += t.amount;
        return {
            x: new Date(t.createdAt).getTime(),
            y: cumulative,
        };
    });
}

// ─── Skills Processing ──────────────────────────────────────
// Cleans skill names: "skill_front-end" → "Front End"
function processSkills(skills) {
    return skills.map((s) => ({
        name: s.type.replace("skill_", "").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        value: s.amount,
    }));
}

// ─── XP By Project Processing ───────────────────────────────
// Extracts project name from path and pairs with XP
function buildXPByProject(transactions) {
    return transactions.slice(0, 10).map((t) => ({
        project: t.path.split("/").pop(),
        xp: t.amount,
    }));
}

// ─── Piscine Stats Processing ───────────────────────────────
// Counts pass/fail and attempts per exercise
function buildPiscineStats(results) {
    let pass = 0, fail = 0;
    const attempts = {};

    results.forEach((r) => {
        r.grade >= 1 ? pass++ : fail++;
        const exercise = r.path.split("/").pop();
        attempts[exercise] = (attempts[exercise] || 0) + 1;
    });

    return { pass, fail, attempts };
}

// ─── Chart Configuration: XP Progress ───────────────────────
function getXPChartOptions() {
    return {
        chart: {
            type: "area",
            background: "transparent",
            toolbar: { show: false },
            animations: {
                enabled: true,
                easing: "easeinout",
                speed: 1500,
                dynamicAnimation: { enabled: true, speed: 500 },
            },
        },
        theme: { mode: "dark" },
        colors: ["#a855f7"],
        stroke: { curve: "smooth", width: 3 },
        fill: {
            type: "gradient",
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.6,
                opacityTo: 0.1,
                stops: [0, 90, 100],
                colorStops: [
                    { offset: 0, color: "#a855f7", opacity: 0.6 },
                    { offset: 100, color: "#ec4899", opacity: 0.1 },
                ],
            },
        },
        xaxis: {
            type: "datetime",
            labels: { style: { colors: "#9ca3af" } },
        },
        yaxis: {
            show: true,
            tickAmount: 5,
            labels: {
                style: { colors: "#9ca3af" },
                formatter: (val) => formatXP(val),
            },
        },
        grid: { borderColor: "#1f2937", strokeDashArray: 4 },
        tooltip: {
            theme: "dark",
            x: { format: "MMM yyyy" },
            y: { formatter: (val) => formatXP(val) },
        },
        dataLabels: { enabled: false },
    };
}

// ─── Chart Configuration: XP By Project ─────────────────────
function getProjectChartOptions(projectNames) {
    return {
        chart: {
            type: "bar",
            background: "transparent",
            toolbar: { show: false },
            animations: { enabled: true, speed: 1500 },
        },
        theme: { mode: "dark" },
        colors: ["#a855f7"],
        plotOptions: {
            bar: {
                borderRadius: 6,
                columnWidth: "55%",
                distributed: true,
            },
        },
        fill: {
            type: "gradient",
            gradient: {
                shade: "dark",
                type: "vertical",
                gradientToColors: ["#ec4899"],
                stops: [0, 100],
            },
        },
        xaxis: {
            categories: projectNames,
            labels: {
                style: { colors: "#d1d5db", fontSize: "11px" },
                rotate: -45,
                rotateAlways: true,
                trim: true,
                maxHeight: 80,
            },
        },
        yaxis: {
            labels: {
                style: { colors: "#9ca3af" },
                formatter: (val) => formatXP(val),
            },
        },
        grid: { borderColor: "#1f2937", strokeDashArray: 4 },
        tooltip: {
            theme: "dark",
            y: { formatter: (val) => formatXP(val) },
        },
        legend: { show: false },
        dataLabels: { enabled: false },
    };
}

// ─── Chart Configuration: Piscine Pass/Fail ─────────────────
function getPiscineDonutOptions() {
    return {
        chart: {
            type: "donut",
            background: "transparent",
            animations: { enabled: true, speed: 1500 },
        },
        theme: { mode: "dark" },
        colors: ["#22c55e", "#ef4444"],
        labels: ["Pass", "Fail"],
        stroke: { width: 0 },
        plotOptions: {
            pie: {
                donut: {
                    size: "70%",
                    labels: {
                        show: true,
                        name: { color: "#d1d5db" },
                        value: { color: "#ffffff", fontSize: "22px", fontWeight: "700" },
                        total: {
                            show: true,
                            label: "Total",
                            color: "#9ca3af",
                            formatter: (w) => w.globals.seriesTotals.reduce((a, b) => a + b, 0),
                        },
                    },
                },
            },
        },
        legend: {
            position: "bottom",
            labels: { colors: "#9ca3af" },
        },
        dataLabels: { enabled: false },
    };
}

// ─── Dashboard Component ────────────────────────────────────
export default function Dashboard() {
    const { isChecking } = useAuthGuard();
    const [userData, setUserData] = useState(null);
    const [xpData, setXpData] = useState(null);
    const [skills, setSkills] = useState(null);
    const [showAllSkills, setShowAllSkills] = useState(false);
    const [projectData, setProjectData] = useState(null);
    const [piscineStats, setPiscineStats] = useState(null);
    const [isMobile, setIsMobile] = useState(false);

    // Track viewport for responsive chart heights
    useEffect(() => {
        const mq = window.matchMedia("(max-width: 480px)");
        setIsMobile(mq.matches);
        const handler = (e) => setIsMobile(e.matches);
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, []);

    // Fetch all dashboard data after auth check
    useEffect(() => {
        if (isChecking) return;

        async function fetchDashboardData() {
            try {
                const data = await graphqlRequest(DASHBOARD_QUERY);
                setUserData(data);
                setXpData(buildCumulativeXP(data.transaction));
                setSkills(processSkills(data.skills));
                setProjectData(buildXPByProject(data.xp_by_project));
                setPiscineStats(buildPiscineStats(data.piscine_results));
            } catch (err) {
                console.error("Failed to fetch dashboard data:", err);
            }
        }

        fetchDashboardData();
    }, [isChecking]);

    if (isChecking) return null;

    const visibleSkills = showAllSkills ? skills : skills?.slice(0, 5);

    return (
        <div className="dashboard-container">
            {/* Header row — welcome + sign out */}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: isMobile ? "flex-start" : "center",
                flexDirection: isMobile ? "column" : "row",
                gap: isMobile ? "16px" : "0",
                marginBottom: "28px",
            }}>
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    style={{ textAlign: isMobile ? "center" : "left", width: isMobile ? "100%" : "auto" }}
                >
                    <div style={{ display: "inline-block", verticalAlign: "middle", marginRight: "8px" }}>
                        <LottieIcon
                            url="https://fonts.gstatic.com/s/e/notoemoji/latest/1f44b/lottie.json"
                            fallback="\u{1F44B}"
                            size={36}
                        />
                    </div>
                    <h1 style={{
                        display: "inline",
                        fontSize: "28px",
                        fontWeight: "800",
                        background: "linear-gradient(135deg, #a855f7, #ec4899)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                    }}>
                        {userData ? `Welcome, ${userData.user[0].login}` : "Loading..."}
                    </h1>
                    {userData && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            style={{
                                color: "#6b7280",
                                fontSize: "14px",
                                marginTop: "6px",
                            }}
                        >
                            Here&apos;s your progress overview
                        </motion.p>
                    )}
                </motion.div>

                {/* Sign Out Button */}
                <motion.button
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    whileHover={{
                        scale: 1.05,
                        boxShadow: "0 0 20px rgba(239, 68, 68, 0.3)",
                    }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                        logoutUser();
                        window.location.href = "/";
                    }}
                    style={{
                        padding: "10px 24px",
                        borderRadius: "100px",
                        background: "rgba(239, 68, 68, 0.1)",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                        color: "#f87171",
                        fontSize: "14px",
                        fontWeight: "600",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        transition: "all 0.3s ease",
                        alignSelf: isMobile ? "center" : "flex-start",
                    }}
                >
                    <span style={{ fontSize: "16px" }}>↪</span>
                    Sign Out
                </motion.button>
            </div>

            {/* Stats — three cards */}
            {userData && (
                <div className="stats-grid">
                    <StatCard
                        label="Total XP"
                        value={userData.transaction_aggregate.aggregate.sum.amount}
                        format={formatXP}
                        color="#a855f7"
                        icon={
                            <LottieIcon
                                url="https://fonts.gstatic.com/s/e/notoemoji/latest/26a1/lottie.json"
                                fallback="⚡"
                                size={36}
                            />
                        }
                        delay={0.1}
                    />
                    <StatCard
                        label="Pass Rate"
                        value={Math.round((userData.pass.aggregate.count / (userData.pass.aggregate.count + userData.fail.aggregate.count)) * 100)}
                        format={(v) => `${v}%`}
                        color="#22c55e"
                        icon={
                            <LottieIcon
                                url="/animations/pass-rate.json"
                                fallback="🎯"
                                size={36}
                            />
                        }
                        delay={0.15}
                    />
                    <AuditRing
                        ratio={userData.user[0].auditRatio}
                        delay={0.2}
                    />
                </div>
            )}

            {/* Skills — top 5 with show more */}
            {skills && (
                <div style={{ marginBottom: "40px" }}>
                    <motion.p
                        style={{
                            color: "#6b7280",
                            fontSize: "13px",
                            fontWeight: "500",
                            textTransform: "uppercase",
                            letterSpacing: "1.5px",
                            marginBottom: "16px",
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        Skills
                    </motion.p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                        {visibleSkills.map((skill, i) => (
                            <motion.div
                                key={skill.name}
                                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{
                                    delay: 0.4 + i * 0.05,
                                    type: "spring",
                                    stiffness: 200,
                                    damping: 15,
                                }}
                                whileHover={{
                                    scale: 1.2,
                                    y: -8,
                                    boxShadow: `0 8px 30px rgba(168, 85, 247, 0.5)`,
                                    zIndex: 10,
                                }}
                                style={{
                                    padding: "10px 20px",
                                    borderRadius: "100px",
                                    background: `rgba(168, 85, 247, ${0.05 + (skill.value / 100) * 0.15})`,
                                    border: `1px solid rgba(168, 85, 247, ${0.1 + (skill.value / 100) * 0.3})`,
                                    fontSize: "14px",
                                    color: "#d8b4fe",
                                    cursor: "default",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    whiteSpace: "nowrap",
                                    transition: "background 0.3s ease",
                                }}
                            >
                                <span>{skill.name}</span>
                                <span style={{
                                    fontSize: "12px",
                                    color: "#a855f7",
                                    fontWeight: "700",
                                }}>
                                    {skill.value}%
                                </span>
                            </motion.div>
                        ))}

                        {/* Show More / Show Less toggle */}
                        {skills.length > 5 && (
                            <motion.button
                                onClick={() => setShowAllSkills(!showAllSkills)}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.7 }}
                                whileHover={{ scale: 1.1 }}
                                style={{
                                    padding: "10px 20px",
                                    borderRadius: "100px",
                                    background: "rgba(255,255,255,0.05)",
                                    border: "1px solid rgba(255,255,255,0.15)",
                                    fontSize: "13px",
                                    color: "#9ca3af",
                                    cursor: "pointer",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {showAllSkills ? "Show less" : `+${skills.length - 5} more`}
                            </motion.button>
                        )}
                    </div>
                </div>
            )}

            {/* Charts Grid — XP Progress + XP By Project side by side */}
            <div className="charts-grid">
                {/* XP Progress Chart */}
                {xpData && (
                    <div className="chart-card">
                        <h2 style={{ fontSize: "18px", marginBottom: "16px" }}>XP Progress Over Time</h2>
                        <ApexChart
                            type="area"
                            height={isMobile ? 250 : 350}
                            options={getXPChartOptions()}
                            series={[{ name: "Cumulative XP", data: xpData }]}
                        />
                    </div>
                )}

                {/* XP By Project Chart */}
                {projectData && (
                    <div className="chart-card">
                        <h2 style={{ fontSize: "18px", marginBottom: "16px" }}>XP By Project</h2>
                        <ApexChart
                            type="bar"
                            height={isMobile ? 280 : 350}
                            options={getProjectChartOptions(projectData.map((p) => p.project))}
                            series={[{ name: "XP", data: projectData.map((p) => p.xp) }]}
                        />
                    </div>
                )}
            </div>

            {/* Piscine Stats — Pass/Fail Donut + Attempts Bar */}
            {piscineStats && (
                <div className="charts-grid">
                    {/* Pass/Fail Donut */}
                    <div className="chart-card">
                        <h2 style={{ fontSize: "18px", marginBottom: "16px" }}>Piscine JS — Pass / Fail</h2>
                        <ApexChart
                            type="donut"
                            height={isMobile ? 220 : 300}
                            options={getPiscineDonutOptions()}
                            series={[piscineStats.pass, piscineStats.fail]}
                        />
                    </div>

                    {/* Attempts Per Exercise — Radar */}
                    <div className="chart-card">
                        <h2 style={{ fontSize: "18px", marginBottom: "16px" }}>Piscine JS — Attempts</h2>
                        <ApexChart
                            type="radar"
                            height={isMobile ? 280 : 380}
                            options={{
                                chart: {
                                    type: "radar",
                                    background: "transparent",
                                    toolbar: { show: false },
                                    animations: { enabled: true, speed: 1500 },
                                },
                                theme: { mode: "dark" },
                                colors: ["#a855f7"],
                                stroke: { width: 2, colors: ["#a855f7"] },
                                fill: {
                                    opacity: 0.3,
                                    colors: ["#a855f7"],
                                },
                                markers: {
                                    size: 3,
                                    colors: ["#a855f7"],
                                    strokeColors: "#1f2937",
                                    strokeWidth: 1,
                                },
                                xaxis: {
                                    categories: Object.keys(piscineStats.attempts).slice(0, 15),
                                    labels: {
                                        style: {
                                            colors: Array(15).fill("#9ca3af"),
                                            fontSize: "10px",
                                        },
                                    },
                                },
                                yaxis: { show: false },
                                plotOptions: {
                                    radar: {
                                        polygons: {
                                            strokeColors: "#1f2937",
                                            connectorColors: "#1f2937",
                                            fill: { colors: ["transparent"] },
                                        },
                                    },
                                },
                                tooltip: { theme: "dark" },
                                dataLabels: { enabled: false },
                            }}
                            series={[{
                                name: "Attempts",
                                data: Object.values(piscineStats.attempts).slice(0, 15),
                            }]}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}