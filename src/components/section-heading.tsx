import { cn } from "@/lib/utils";
import { LinkIcon } from "lucide-react";

export function SectionHeading({
  id,
  children,
  className,
  center = true
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
  center?: boolean;
}) {
  return (
    <h2 id={id} className={cn("text-xl font-bold group", className)}>
      <a href={`#${id}`} className={`flex items-center gap-2 ${center ? "justify-center" : ""}`}>
        {children}
        <LinkIcon className="size-4 text-muted-foreground opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </a>
    </h2>
  );
}
