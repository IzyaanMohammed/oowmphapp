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
      className={cn("transition-transform duration-200 hover:scale-105 shrink-0", props.className)}
      {...props}
    >
      <rect width="32" height="32" fill="black" />
      <path
        d="M7 23V9H10.5L16 17.5L21.5 9H25V23H21.5V13.5L16.8 20.5H15.2L10.5 13.5V23H7Z"
        fill="white"
      />
    </svg>
  );
}

