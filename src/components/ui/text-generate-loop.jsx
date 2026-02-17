"use client";
import { useEffect } from "react";
import { motion, stagger, useAnimate } from "motion/react";
import { cn } from "@/lib/utils";

export const TextGenerateLoop = ({
  words,
  className,
  filter = true,
  duration = 1,
  pauseMs = 2000,
  gapMs = 500,
}) => {
  const [scope, animate] = useAnimate();
  let wordsArray = words.split(" ");

  useEffect(() => {
    const loop = async () => {
      while (true) {
        // Forward: blur → clear
        if(!scope.current) return;
        await animate("span", {
          opacity: 1,
          filter: filter ? "blur(0px)" : "none",
        }, {
          duration: duration,
          delay: stagger(0.4),
        });

        // Pause while visible
        await new Promise((r) => setTimeout(r, pauseMs));

        // Reverse: clear → blur
        await animate("span", {
          opacity: 0,
          filter: filter ? "blur(10px)" : "none",
        }, {
          duration: duration * 0.5,
          delay: stagger(0.1, { from: "last" }),
        });

        // Gap before restarting
        await new Promise((r) => setTimeout(r, gapMs));
      }
    };

    loop();
  }, [scope.current]);

  return (
    <div className={cn("font-bold", className)}>
      <div className="mt-4">
        <div className="text-white text-2xl leading-snug tracking-wide">
          <motion.div ref={scope}>
            {wordsArray.map((word, idx) => (
              <motion.span
                key={word + idx}
                className="text-white opacity-0"
                style={{ filter: filter ? "blur(10px)" : "none" }}
              >
                {word}{" "}
              </motion.span>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};