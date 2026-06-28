import { Package } from "lucide-react";
import type { SearchEntry } from "@/lib/searchIndex";

interface Props {
  entry: SearchEntry;
  query: string;
  isActive: boolean;
  onSelect: () => void;
  onMouseEnter: () => void;
}

function highlight(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-primary/20 text-primary rounded-[2px] font-semibold">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

const SearchSuggestionItem = ({ entry, query, isActive, onSelect, onMouseEnter }: Props) => {
  const Icon = entry.icon ?? Package;
  return (
    <div
      role="option"
      aria-selected={isActive}
      onMouseDown={(e) => { e.preventDefault(); onSelect(); }}
      onMouseEnter={onMouseEnter}
      className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors ${
        isActive ? "bg-muted" : "hover:bg-muted/60"
      }`}
    >
      <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="w-3.5 h-3.5 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground truncate">
          {highlight(entry.label, query)}
        </p>
        <p className="text-xs text-muted-foreground truncate">{entry.description}</p>
      </div>
    </div>
  );
};

export default SearchSuggestionItem;
