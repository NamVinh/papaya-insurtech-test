import { useState, useRef, useEffect } from 'react';
import { icd10Codes } from '../../data/icd10Codes';

export default function ICD10Search({ value, onChange, error }) {
  const [query, setQuery] = useState(value ? `${value.code} — ${value.description}` : '');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const containerRef = useRef(null);
  const timerRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleInput(e) {
    const q = e.target.value;
    setQuery(q);
    onChange(null); // clear selection when typing
    clearTimeout(timerRef.current);
    if (q.trim().length < 1) {
      setResults([]);
      setOpen(false);
      return;
    }
    // Debounce 150ms
    timerRef.current = setTimeout(() => {
      const lower = q.toLowerCase();
      const filtered = icd10Codes.filter(
        (c) => c.code.toLowerCase().includes(lower) || c.description.toLowerCase().includes(lower)
      );
      setResults(filtered.slice(0, 10));
      setOpen(filtered.length > 0);
      setActiveIdx(-1);
    }, 150);
  }

  function select(item) {
    setQuery(`${item.code} — ${item.description}`);
    onChange(item);
    setOpen(false);
    setActiveIdx(-1);
  }

  function handleKeyDown(e) {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIdx >= 0 && results[activeIdx]) select(results[activeIdx]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        aria-haspopup="listbox"
        value={query}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={() => query && results.length > 0 && setOpen(true)}
        placeholder="Type code or diagnosis name..."
        className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? 'border-red-400' : 'border-gray-300'
        }`}
      />
      {open && results.length > 0 && (
        <ul
          role="listbox"
          className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {results.map((item, idx) => (
            <li
              key={item.code}
              role="option"
              aria-selected={idx === activeIdx}
              onMouseDown={() => select(item)}
              onMouseEnter={() => setActiveIdx(idx)}
              className={`px-4 py-2.5 text-sm cursor-pointer ${
                idx === activeIdx ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="font-mono font-medium">{item.code}</span>
              <span className="text-gray-400 mx-2">—</span>
              {item.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
