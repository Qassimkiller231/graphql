"use client";
import dynamic from "next/dynamic";

// Dynamic import — loads ApexCharts only in the browser (not server)
const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default ApexChart;