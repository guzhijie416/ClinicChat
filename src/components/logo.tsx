import { cn } from "@/lib/utils";

export const Logo = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("h-6 w-6", className)}
    {...props}
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    <path d="M14.5 9.5a2.5 2.5 0 0 1-5 0V7A2.5 2.5 0 0 1 12 4.5v0A2.5 2.5 0 0 1 14.5 7V12"></path>
    <circle cx="8" cy="15" r="1"></circle>
    <path d="M8 14v-2.5"></path>
  </svg>
);
