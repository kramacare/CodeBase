import { cn } from "@/lib/utils";

interface AuthCardProps {
  children: React.ReactNode;
  className?: string;
}

const AuthCard = ({ children, className }: AuthCardProps) => (
  <div
    className={cn(
      "w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-soft",
      className
    )}
  >
    {children}
  </div>
);

export default AuthCard;
