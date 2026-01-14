import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { bounceIn, ripple } from "@/lib/animations";

interface AnimatedCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  color?: string;
  size?: "sm" | "md" | "lg";
  showConfetti?: boolean;
  disabled?: boolean;
  className?: string;
}

const sizes = {
  sm: { box: "w-5 h-5", icon: 12 },
  md: { box: "w-7 h-7", icon: 16 },
  lg: { box: "w-9 h-9", icon: 20 },
};

const confettiColors = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f97316",
  "#22c55e",
  "#eab308",
];

function Confetti({ x, y }: { x: number; y: number }) {
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    angle: (i * 30 * Math.PI) / 180,
    distance: 30 + Math.random() * 20,
    color: confettiColors[i % confettiColors.length],
    size: 4 + Math.random() * 4,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-sm"
          style={{
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            left: "50%",
            top: "50%",
          }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
          animate={{
            x: Math.cos(particle.angle) * particle.distance,
            y: Math.sin(particle.angle) * particle.distance - 10,
            opacity: 0,
            scale: 0,
            rotate: Math.random() * 360,
          }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

export function AnimatedCheckbox({
  checked,
  onChange,
  color = "var(--accent)",
  size = "md",
  showConfetti = true,
  disabled = false,
  className,
}: AnimatedCheckboxProps) {
  const [showParticles, setShowParticles] = useState(false);
  const [rippleKey, setRippleKey] = useState(0);

  const handleClick = useCallback(() => {
    if (disabled) return;

    if (!checked && showConfetti) {
      setShowParticles(true);
      setTimeout(() => setShowParticles(false), 700);
    }
    setRippleKey((k) => k + 1);
    onChange(!checked);
  }, [checked, disabled, onChange, showConfetti]);

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.1 }}
      whileTap={{ scale: disabled ? 1 : 0.9 }}
      className={cn(
        "relative rounded-lg border-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500",
        sizes[size].box,
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      style={{
        borderColor: checked ? color : "var(--border)",
        backgroundColor: checked ? color : "transparent",
      }}
    >
      {/* Ripple effect */}
      <AnimatePresence>
        <motion.div
          key={rippleKey}
          variants={ripple}
          initial="hidden"
          animate="visible"
          className="absolute inset-0 rounded-lg"
          style={{ backgroundColor: color }}
        />
      </AnimatePresence>

      {/* Checkmark */}
      <AnimatePresence>
        {checked && (
          <motion.div
            variants={bounceIn}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute inset-0 flex items-center justify-center"
          >
            <Check
              size={sizes[size].icon}
              className="text-white"
              strokeWidth={3}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confetti */}
      <AnimatePresence>
        {showParticles && <Confetti x={0} y={0} />}
      </AnimatePresence>
    </motion.button>
  );
}
