import { forwardRef, type ReactNode } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { slideUp } from "@/lib/animations";

interface CardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  hover?: boolean;
  glass?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, hover = false, glass = false, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        variants={slideUp}
        initial="hidden"
        animate="visible"
        whileHover={hover ? { scale: 1.02, y: -2 } : undefined}
        className={cn(
          "rounded-2xl p-4 transition-shadow duration-200",
          glass
            ? "glass"
            : "bg-[var(--bg-secondary)] border border-[var(--border)]",
          hover && "cursor-pointer hover:shadow-lg",
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = "Card";

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between mb-3", className)}>
      {children}
    </div>
  );
}

interface CardTitleProps {
  children: ReactNode;
  className?: string;
}

export function CardTitle({ children, className }: CardTitleProps) {
  return (
    <h3
      className={cn(
        "text-lg font-semibold text-[var(--text-primary)]",
        className
      )}
    >
      {children}
    </h3>
  );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return <div className={cn("", className)}>{children}</div>;
}
