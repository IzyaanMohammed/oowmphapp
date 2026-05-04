import type { SVGProps } from "react";
import { cn } from "@/lib/utils";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("transition-transform duration-300 hover:scale-110", props.className)}
      {...props}
    >
      <rect width="32" height="32" rx="8" fill="currentColor" className="text-primary" />
      <path
        d="M8 10V22M8 10H12L15 16L18 10H22V22"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
