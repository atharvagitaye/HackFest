import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { querySearchIndex, type SearchEntry } from "@/lib/searchIndex";
import SearchDropdown from "./SearchDropdown";

const OPEN_NOTIFICATIONS_EVENT = "surplussync:open-notifications";

const GlobalNavigationSearch = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // Keep a ref to the latest results so handleKeyDown never closes over stale results
  const resultsRef = useRef<SearchEntry[]>([]);

  const results = querySearchIndex(query, user?.role);
  resultsRef.current = results;

  const close = useCallback(() => {
    setOpen(false);
    setActiveIndex(0);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [close]);

  const selectEntry = useCallback(
    (entry: SearchEntry) => {
      setQuery("");
      close();
      inputRef.current?.blur();

      if (entry.action === "open-notifications") {
        window.dispatchEvent(new CustomEvent(OPEN_NOTIFICATIONS_EVENT));
        return;
      }
      if (entry.path) {
        navigate(entry.path);
      }
    },
    [navigate, close]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setActiveIndex(0);
    setOpen(val.trim().length > 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || !query.trim()) return;

    const current = resultsRef.current;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (current.length > 0 ? Math.min(i + 1, current.length - 1) : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "Enter") {
      // Always prevent the browser from submitting any ancestor form
      e.preventDefault();
      e.stopPropagation();
      if (current.length > 0) {
        // Use the ref so we always read the latest results, not a stale closure
        setActiveIndex((i) => {
          const entry = current[i] ?? current[0];
          selectEntry(entry);
          return i;
        });
      }
    }
  };

  return (
    // Wrap in a plain div — no <form> wrapper so there is no submit event path
    <div ref={containerRef} className="relative hidden md:block">
      <div className="flex items-center bg-muted rounded-lg px-3 py-1.5">
        {/* type="button" prevents any accidental form submission if this component
            is ever nested inside an outer form */}
        <button
          type="button"
          tabIndex={-1}
          aria-label="Search"
          onClick={() => inputRef.current?.focus()}
          className="shrink-0 mr-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Search className="w-4 h-4" />
        </button>
        <input
          ref={inputRef}
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (query.trim()) setOpen(true); }}
          placeholder="Go to..."
          autoComplete="off"
          spellCheck={false}
          className="bg-transparent text-sm outline-none w-40 text-foreground placeholder:text-muted-foreground"
          aria-label="Navigate to page"
          aria-autocomplete="list"
          aria-expanded={open}
          role="combobox"
        />
      </div>

      {open && query.trim() && (
        <SearchDropdown
          query={query.trim()}
          results={results}
          activeIndex={activeIndex}
          onSelect={selectEntry}
          onActiveChange={setActiveIndex}
        />
      )}
    </div>
  );
};

export default GlobalNavigationSearch;
