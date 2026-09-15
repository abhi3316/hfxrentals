import React, { useState, useEffect, useRef } from 'react';
import { MapPin, X, Loader2, Compass } from 'lucide-react';
import { searchHalifaxAddresses, type AddressSuggestion } from '../utils/addressService';

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelectSuggestion?: (suggestion: AddressSuggestion) => void;
  placeholder?: string;
  required?: boolean;
  id?: string;
  disabled?: boolean;
}

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  value,
  onChange,
  onSelectSuggestion,
  placeholder = 'e.g. 1459 Robie St, Halifax',
  required = false,
  id = 'address-autocomplete',
  disabled = false
}) => {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<any>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions with debouncing
  useEffect(() => {
    if (!value || value.trim().length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      setIsLoading(false);
      return;
    }

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const results = await searchHalifaxAddresses(value);
        setSuggestions(results);
        setIsOpen(results.length > 0);
        setHighlightedIndex(-1);
      } catch (e) {
        console.warn('Address search error:', e);
      } finally {
        setIsLoading(false);
      }
    }, 220); // 220ms debounce for snappy responsiveness

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [value]);

  const handleSelect = (item: AddressSuggestion) => {
    onChange(item.streetAddress || item.fullAddress);
    if (onSelectSuggestion) {
      onSelectSuggestion(item);
    }
    setIsOpen(false);
    setSuggestions([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        handleSelect(suggestions[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    onChange('');
    setSuggestions([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="address-autocomplete-wrapper" style={{ position: 'relative', width: '100%' }}>
      <div className="address-input-container" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <MapPin
          size={17}
          style={{
            position: 'absolute',
            left: 12,
            color: value ? 'var(--emerald-400)' : 'var(--slate-500)',
            pointerEvents: 'none',
            transition: 'color 0.2s ease'
          }}
        />

        <input
          ref={inputRef}
          id={id}
          type="text"
          value={value}
          disabled={disabled}
          required={required}
          autoComplete="off"
          placeholder={placeholder}
          onChange={e => onChange(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          style={{
            width: '100%',
            padding: '10px 38px 10px 38px',
            background: 'var(--navy-900)',
            border: isOpen ? '1px solid var(--emerald-500)' : '1px solid var(--slate-700)',
            borderRadius: 'var(--radius-md)',
            color: '#fff',
            fontSize: '0.92rem',
            outline: 'none',
            boxShadow: isOpen ? '0 0 0 3px rgba(0, 168, 150, 0.2)' : 'none',
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
          }}
        />

        <div style={{ position: 'absolute', right: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
          {isLoading && (
            <Loader2
              size={16}
              className="animate-spin"
              style={{ color: 'var(--emerald-400)', animation: 'spin 1s linear infinite' }}
            />
          )}

          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear address input"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--slate-400)',
                cursor: 'pointer',
                padding: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%'
              }}
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Autocomplete Dropdown List */}
      {isOpen && suggestions.length > 0 && (
        <ul
          role="listbox"
          className="address-suggestions-dropdown"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            background: '#0a192f',
            border: '1px solid rgba(0, 168, 150, 0.35)',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.5)',
            maxHeight: 280,
            overflowY: 'auto',
            padding: '6px',
            margin: 0,
            listStyle: 'none',
            zIndex: 9999,
            backdropFilter: 'blur(12px)'
          }}
        >
          {suggestions.map((item, index) => {
            const isSelected = index === highlightedIndex;
            return (
              <li
                key={item.id}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(item)}
                onMouseEnter={() => setHighlightedIndex(index)}
                style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: isSelected ? 'rgba(0, 168, 150, 0.18)' : 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  borderBottom: index < suggestions.length - 1 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
                  transition: 'background 0.15s ease'
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: isSelected ? 'var(--emerald-500)' : 'rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: 2,
                    color: isSelected ? '#071321' : 'var(--emerald-400)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <MapPin size={14} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>
                      {item.streetAddress}
                    </span>
                    {item.neighborhood && (
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 999,
                          background: 'rgba(0, 168, 150, 0.2)',
                          color: 'var(--emerald-400)',
                          border: '1px solid rgba(0, 168, 150, 0.3)'
                        }}
                      >
                        {item.neighborhood}
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: '0.78rem', color: 'var(--slate-400)', marginTop: 2 }}>
                    {item.city}, NS {item.postalCode ? `• ${item.postalCode}` : ''}
                  </div>
                </div>

                <Compass size={14} style={{ color: 'var(--slate-500)', marginTop: 8, flexShrink: 0 }} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
