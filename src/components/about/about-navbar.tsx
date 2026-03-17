"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { CheckSquare, Sun, Moon } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";

export function AboutNavbar() {
  const { theme, setTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 flex h-16 items-center justify-between px-4 md:px-8 transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-sm border-b border-border"
          : "bg-transparent"
      }`}
    >
      <Link href="/about" className="flex items-center gap-2">
        <CheckSquare className="h-6 w-6 text-primary" />
        <span className="text-lg font-bold">TaskZen</span>
      </Link>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        <Link
          href="/login"
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          Log In
        </Link>

        <Link
          href="/signup"
          className={buttonVariants({ size: "sm" })}
        >
          Get Started
        </Link>
      </div>
    </header>
  );
}
