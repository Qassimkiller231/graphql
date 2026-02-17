"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const Label = React.forwardRef(({ className, ...props }, ref) => (
  <motion.label
    ref={ref}
    whileHover={{
      scale: 1.05,
      color: "#c084fc",
      textShadow: "0 0 12px rgba(192, 132, 252, 0.6)",
      y: -1,
    }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
    className={cn(
      "text-sm font-medium text-white leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-default inline-block origin-left",
      className
    )}
    {...props}
  />
));
Label.displayName = "Label";

export { Label };

