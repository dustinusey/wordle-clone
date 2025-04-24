"use client";

import { motion } from "framer-motion";

const Button = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-2xl transition-all duration-200 ease-in-out";

  const sizeClasses = {
    sm: "text-sm px-6 py-3",
    md: "text-base px-8 py-4",
    lg: "text-lg px-10 py-5",
  };

  const variantClasses = {
    primary:
      "bg-primary text-white hover:bg-primary-light active:bg-primary-dark dark:bg-white dark:text-primary dark:hover:bg-zinc-100 dark:active:bg-zinc-200",
    secondary:
      "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 active:bg-zinc-300 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 dark:active:bg-white/30",
    outline:
      "border border-secondary-light hover:border-primary hover:text-primary dark:border-secondary dark:hover:border-white dark:hover:text-white",
    ghost: "hover:bg-secondary-light/10 dark:hover:bg-white/10",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default Button;
