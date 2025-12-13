import React, { useState, useRef, useEffect } from 'react';
import { MapPin, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  excludeLocation?: string;
}

const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  value,
  onChange,
  placeholder = "Search location...",
  label,
  excludeLocation
}) => {
  const { locations } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filteredLocations = locations
    .filter(loc => 
      loc.toLowerCase().includes(inputValue.toLowerCase()) &&
      loc !== excludeLocation
    )
    .slice(0, 5);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (location: string) => {
    setInputValue(location);
    onChange(location);
    setIsOpen(false);
  };

  const handleClear = () => {
    setInputValue('');
    onChange('');
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      {label && (
        <label className="block text-sm font-medium text-foreground mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
        <Input
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="pl-12 pr-10"
        />
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      
      {isOpen && filteredLocations.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-card border border-border rounded-xl shadow-card overflow-hidden animate-scale-in opacity-100">
          {filteredLocations.map((location, index) => (
            <button
              key={location}
              type="button"
              onClick={() => handleSelect(location)}
              className={cn(
                "w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-accent/10 transition-colors",
                index !== filteredLocations.length - 1 && "border-b border-border/50"
              )}
            >
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">{location}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationAutocomplete;
