import type { SearchEntry } from "@/lib/searchIndex";

interface Props {
  entry: SearchEntry;
  query: string;
  isActive: boolean;
  // Receives the entry directly — no wrapping closure at the call site
  onSelect: (entry: SearchEntry) => void;
  onMouseEnter: () => void;
}

function highlight(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-primary/20 text-primary rounded-[2px] font-semibold not-italic">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

const SearchResultItem = ({ entry, query, isActive, onSelect, onMouseEnter }: Props) => {
  const Icon = entry.icon;
  return (
    <div
      role="option"
      aria-selected={isActive}
      // Use onMouseDown + preventDefault so the input doesn't blur before we
      // capture the click, which previously allowed a stale form-submit path
      // to fire first. We call onSelect(entry) here — entry is the prop passed
      // directly to this component, never derived from an index or closure.
      onMouseDown={(e) => {
        e.preventDefault();   // keep input focus; prevent any ancestor form submit
        onSelect(entry);      // entry is this component's own prop — always correct
      }}
      onMouseEnter={onMouseEnter}
      className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors select-none ${
        isActive ? "bg-muted" : "hover:bg-muted/60"
      }`}
    >
      <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
        isActive ? "bg-primary/15" : "bg-primary/10"
      }`}>
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

export default SearchResultItem;
