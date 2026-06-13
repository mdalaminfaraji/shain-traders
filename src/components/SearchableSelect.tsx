"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Check, Plus } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  allowCustom?: boolean;
  label?: string;
  required?: boolean;
  disabled?: boolean;
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select option...",
  allowCustom = false,
  label,
  required = false,
  disabled = false,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter options based on search query
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(search.toLowerCase())
  );

  // Check if search query exactly matches an existing option
  const exactMatch = options.some(
    (option) => option.label.toLowerCase() === search.trim().toLowerCase()
  );

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    setSearch("");
  };

  const selectedOption = options.find((opt) => opt.value === value);
  const displayLabel = selectedOption ? selectedOption.label : value || "";

  return (
    <div className="relative w-full" ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-muted mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full bg-background border border-border rounded-lg px-4 py-2 flex items-center justify-between text-left focus:outline-none focus:ring-1 focus:ring-accent transition-all duration-200 ${
          disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-white/5 active:scale-[0.99]"
        }`}
      >
        <span className={displayLabel ? "text-foreground" : "text-muted"}>
          {displayLabel || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-muted transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-2xl overflow-hidden backdrop-blur-md animate-in fade-in duration-100">
          {/* Search Input */}
          <div className="relative border-b border-border p-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-background/50 border border-border rounded-md pl-9 pr-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
              autoFocus
            />
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto p-1 space-y-0.5">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between ${
                    value === option.value
                      ? "bg-white text-black font-semibold"
                      : "text-foreground hover:bg-white/10"
                  }`}
                >
                  <span>{option.label}</span>
                  {value === option.value && <Check className="w-4 h-4" />}
                </button>
              ))
            ) : (
              !allowCustom && (
                <div className="px-3 py-2 text-xs text-muted text-center">No options found.</div>
              )
            )}

            {/* Custom Input Option */}
            {allowCustom && search.trim() !== "" && !exactMatch && (
              <button
                type="button"
                onClick={() => handleSelect(search.trim())}
                className="w-full text-left px-3 py-2 rounded-md text-sm border border-dashed border-border text-accent hover:bg-accent hover:text-white transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add custom: "{search.trim()}"</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
