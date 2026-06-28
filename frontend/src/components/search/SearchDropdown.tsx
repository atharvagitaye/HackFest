import type { SearchEntry } from "@/lib/searchIndex";
import SearchResultItem from "./SearchResultItem";

interface Props {
  query: string;
  results: SearchEntry[];
  activeIndex: number;
  onSelect: (entry: SearchEntry) => void;
  onActiveChange: (index: number) => void;
}

const SearchDropdown = ({ query, results, activeIndex, onSelect, onActiveChange }: Props) => {
  return (
    <div
      role="listbox"
      aria-label="Navigation suggestions"
      className="absolute top-full mt-1.5 right-0 w-72 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden"
    >
      {results.length > 0 ? (
        <>
          <div className="px-3 pt-2 pb-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Navigate to
            </p>
          </div>
          <div className="pb-1">
            {results.map((entry, i) => (
              <SearchResultItem
                key={entry.id}
                entry={entry}
                query={query}
                isActive={i === activeIndex}
                // Pass entry as argument — no intermediate closure over index
                onSelect={onSelect}
                onMouseEnter={() => onActiveChange(i)}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="px-4 py-5 text-center">
          <p className="text-sm text-muted-foreground">No matching pages found.</p>
        </div>
      )}
    </div>
  );
};

export default SearchDropdown;
