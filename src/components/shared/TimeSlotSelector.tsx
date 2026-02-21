import type { TimeSlot } from "@/data/mockData";
import { cn } from "@/lib/utils";

interface TimeSlotSelectorProps {
  slots: TimeSlot[];
  selected?: string;
  onSelect: (slotId: string) => void;
}

const TimeSlotSelector = ({ slots, selected, onSelect }: TimeSlotSelectorProps) => (
  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
    {slots.map((slot) => (
      <button
        key={slot.id}
        disabled={!slot.available}
        onClick={() => onSelect(slot.id)}
        className={cn(
          "rounded-lg border px-3 py-2 text-sm font-medium transition-all",
          slot.available
            ? selected === slot.id
              ? "border-primary bg-primary text-primary-foreground shadow-sm"
              : "border-border bg-card text-foreground hover:border-primary hover:bg-primary/5"
            : "cursor-not-allowed border-border bg-muted text-muted-foreground/50 line-through"
        )}
      >
        {slot.time}
      </button>
    ))}
  </div>
);

export default TimeSlotSelector;
