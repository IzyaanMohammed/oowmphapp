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
      className={cn("transition-transform duration-200 hover:scale-105", props.className)}
      {...props}
    >
      <rect width="32" height="32" rx="0" fill="black" />
      <path
        d="M7 10V22M7 10H11L14.5 16L18 10H22V22"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
}
