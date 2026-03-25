import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAlerts } from "@/hooks/use-alerts";

interface AlertBellProps {
  onClick: () => void;
  className?: string;
}

export function AlertBell({ onClick, className }: AlertBellProps) {
  const { alerts } = useAlerts();
  const activeCount = alerts.filter((a) => a.active).length;

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative p-2 rounded-xl hover:bg-muted transition-all",
        className
      )}
      title="تنبيهات السيارات"
    >
      <Bell className={cn("w-5 h-5", activeCount > 0 ? "text-primary" : "text-muted-foreground")} />
      {activeCount > 0 && (
        <span className="absolute -top-1 -left-1 min-w-[18px] h-[18px] bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
          {activeCount > 9 ? "9+" : activeCount}
        </span>
      )}
    </button>
  );
}
