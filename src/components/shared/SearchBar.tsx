import { Search, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  location?: string;
}

const SearchBar = ({ value, onChange, location }: SearchBarProps) => (
  <div className="sticky top-16 z-40 border-b border-border bg-background/95 px-4 py-3 backdrop-blur-md md:px-0">
    <div className="mx-auto flex max-w-3xl items-center gap-2">
      {location && (
        <span className="flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
          <MapPin className="h-3 w-3" />
          {location}
        </span>
      )}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by area, clinic name, or doctor"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-9"
        />
      </div>
    </div>
  </div>
);

export default SearchBar;
