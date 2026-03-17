import { CheckSquare } from "lucide-react";

export function AboutFooter() {
  return (
    <footer className="border-t border-border py-8 px-4 text-center">
      <div className="flex items-center justify-center gap-2 mb-2">
        <CheckSquare className="h-5 w-5 text-primary" />
        <span className="font-semibold">TaskZen</span>
      </div>
      <p className="text-sm text-muted-foreground">
        Built with Next.js, Tailwind CSS &amp; Framer Motion &middot;{" "}
        {new Date().getFullYear()}
      </p>
    </footer>
  );
}
