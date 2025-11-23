/**
 * Searchable Select Component
 * Select con búsqueda integrada para fácil navegación en listas largas
 */

import { useState, useRef, useEffect } from "react";
import { IconChevronDown, IconSearch, IconX } from "@tabler/icons-react";

export interface SelectOption {
  value: string | number;
  label: string;
  description?: string;
}

interface SearchableSelectProps {
  options: SelectOption[];
  value: string | number | undefined;
  onChange: (value: string | number) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  name?: string;
  emptyMessage?: string;
}

const SearchableSelect = ({
  options,
  value,
  onChange,
  placeholder = "Seleccione una opción",
  disabled = false,
  error = false,
  name,
  emptyMessage = "No hay opciones disponibles",
}: SearchableSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filtrar opciones basado en búsqueda
  const filteredOptions = options.filter((option) => {
    if (!option.label) return false;
    const labelMatch = option.label
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const descMatch = option.description
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    return labelMatch || descMatch;
  });

  // Encontrar la opción seleccionada
  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  // Calcular posición del dropdown
  const updateDropdownPosition = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  };

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus en input de búsqueda al abrir y actualizar posición
  useEffect(() => {
    if (isOpen) {
      updateDropdownPosition();
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
      
      // Actualizar posición en scroll y resize
      const handleUpdate = () => updateDropdownPosition();
      window.addEventListener('scroll', handleUpdate, true);
      window.addEventListener('resize', handleUpdate);
      
      return () => {
        window.removeEventListener('scroll', handleUpdate, true);
        window.removeEventListener('resize', handleUpdate);
      };
    }
  }, [isOpen]);

  // Reset highlighted index cuando cambia el filtro
  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchTerm]);

  // Manejar navegación con teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        if (filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex].value);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setSearchTerm("");
        break;
    }
  };

  // Manejar selección
  const handleSelect = (optionValue: string | number) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm("");
  };

  // Limpiar selección
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined as any);
    setSearchTerm("");
  };

  return (
    <>
      <div ref={containerRef} className="relative">
        {/* Select trigger */}
        <button
          type="button"
          name={name}
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          className={`
            w-full px-3 py-2 text-left border rounded-lg 
            focus:outline-none focus:ring-1 focus:ring-[#032dff]
            transition-colors flex items-center justify-between gap-2
            ${
              disabled
                ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                : "bg-white hover:border-gray-400"
            }
            ${error ? "border-red-500" : "border-gray-300"}
          `}
        >
          <span
            className={`flex-1 truncate ${
              !selectedOption ? "text-gray-500" : "text-gray-900"
            }`}
          >
            {selectedOption?.label || placeholder}
          </span>
          <div className="flex items-center gap-1">
            {selectedOption && !disabled && (
              <span
                onClick={handleClear}
                className="p-1 hover:bg-gray-200 rounded transition cursor-pointer"
                title="Limpiar selección"
                role="button"
                tabIndex={-1}
              >
                <IconX size={16} className="text-gray-500" />
              </span>
            )}
            <IconChevronDown
              size={20}
              className={`text-gray-500 transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </button>
      </div>

      {/* Dropdown con position fixed */}
      {isOpen && (
        <div 
          className="fixed z-[9999] bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden flex flex-col max-h-[min(calc(100vh-200px),400px)]"
          style={{
            top: `${dropdownPosition.top + 4}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`
          }}
        >
          {/* Search input */}
          <div className="p-2 border-b border-gray-200 bg-gray-50 shrink-0">
            <div className="relative">
              <IconSearch
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Buscar..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none "
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded transition"
                >
                  <IconX size={14} className="text-gray-500" />
                </button>
              )}
            </div>
          </div>

          {/* Options list */}
          <div className="overflow-y-auto overflow-x-hidden flex-1 min-h-0">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500 text-sm">
                {searchTerm
                  ? `No se encontraron resultados para "${searchTerm}"`
                  : emptyMessage}
              </div>
            ) : (
              <ul className="py-1">
                {filteredOptions.map((option, index) => (
                  <li key={option.value}>
                    <button
                      type="button"
                      onClick={() => handleSelect(option.value)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      className={`
                        w-full px-4 py-2 text-left transition-colors
                        ${
                          highlightedIndex === index
                            ? "bg-[#032dff]/10"
                            : "hover:bg-gray-100"
                        }
                        ${
                          String(option.value) === String(value)
                            ? "bg-[#032dff]/5 font-medium"
                            : ""
                        }
                      `}
                    >
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-900">
                          {option.label}
                        </span>
                        {option.description && (
                          <span className="text-xs text-gray-500 mt-0.5">
                            {option.description}
                          </span>
                        )}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer con info */}
          {filteredOptions.length > 0 && (
            <div className="px-3 py-2 text-xs text-gray-500 bg-gray-50 border-t border-gray-200 shrink-0">
              {filteredOptions.length}{" "}
              {filteredOptions.length === 1 ? "opción" : "opciones"}
              {searchTerm &&
                ` encontrada${filteredOptions.length !== 1 ? "s" : ""}`}
            </div>
          )}
        </div>
      )}
    </>
  );
};
export default SearchableSelect;
