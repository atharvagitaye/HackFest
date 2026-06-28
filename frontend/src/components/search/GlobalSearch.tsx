import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { querySearchIndex, type SearchEntry } from "@/lib/searchIndex";
import SearchDropdown from "./SearchDropdown";

// Custom DOM event that NotificationBell listens to
const OPEN_NOTIFICATIONS_EVENT = "surplussync:open-notifications";

export function emitOpenNotifications() {
  window.dispatchEvent(new CustomEvent(OPEN_NOTIFICATIONS_EVENT));
}

const GlobalSearch = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const suggestions = querySearchIndex(query, user?.role);

  const closeDropdown = useCallback(() => {
    setOpen(false);
    setActiveIndex(0);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        closeDropdown();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [closeDropdown]);

  const navigateTo = useCallback(
    (entry: SearchEntry) => {
      setQuery("");
      closeDropdown();
      inputRef.current?.blur();

      if (entry.action === "open-notifications") {
        emitOpenNotifications();
        return;
      }
      if (entry.path) {
        navigate(entry.path);
      }
    },
    [navigate, closeDropdown]
  );

  const searchDonations = useCallback(() => {
    const q = query.trim();
    closeDropdown();
    setQuery("");
    inputRef.current?.blur();
    if (q) {
      navigate(`/donations?search=${encodeURIComponent(q)}`);
    } else {
      navigate("/donations");
    }
  }, [query, navigate, closeDropdown]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || !query) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Escape") {
      closeDropdown();
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (suggestions.length > 0 && activeIndex < suggestions.length) {
        navigateTo(suggestions[activeIndex]);
      } else {
        searchDonations();
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setActiveIndex(0);
    setOpen(val.trim().length > 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    if (suggestions.length > 0) {
      navigateTo(suggestions[activeIndex] ?? suggestions[0]);
    } else {
      searchDonations();
    }
  };

  return (
    <div ref={containerRef} className="relative hidden md:block">
      <form
        onSubmit={handleSubmit}
        className="flex items-center bg-muted rounded-lg px-3 py-1.5"
      >
        <button
          type="submit"
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
          placeholder="Search anything..."
          autoComplete="off"
          className="bg-transparent text-sm outline-none w-40 text-foreground placeholder:text-muted-foreground"
          aria-label="Global search"
          aria-autocomplete="list"
          aria-expanded={open}
          role="combobox"
        />
      </form>

      {open && query.trim() && (
        <SearchDropdown
          query={query.trim()}
          suggestions={suggestions}
          activeIndex={activeIndex}
          onSelect={navigateTo}
          onActiveChange={setActiveIndex}
          onSearchDonations={searchDonations}
        />
      )}
    </div>
  );
};

export default GlobalSearch;
