import { useState } from 'react';

const FILTERS = [
  { key: 'roomTypes', label: 'Room type' },
  { key: 'sources', label: 'Source' },
  { key: 'statuses', label: 'Status' },
];

const statusLabel = (status) => status.replaceAll('_', ' ');

export default function FilterBar({ filters, options, onToggle, onSearch, onClear }) {
  const [openKey, setOpenKey] = useState(null);
  const hasFilters =
    filters.roomTypes.length ||
    filters.sources.length ||
    filters.statuses.length ||
    filters.searchQuery.trim();

  return (
    <div className="filter-bar">
      {FILTERS.map((filter) => {
        const selected = filters[filter.key];
        const label = selected.length ? `${filter.label}: ${selected.length}` : filter.label;

        return (
          <div className="filter-group" key={filter.key}>
            <button
              className={`filter-btn ${selected.length ? 'active' : ''}`}
              type="button"
              onClick={() => setOpenKey(openKey === filter.key ? null : filter.key)}
              aria-expanded={openKey === filter.key}
            >
              <span className="filter-icon" aria-hidden="true">
                v
              </span>
              {label}
            </button>
            {openKey === filter.key ? (
              <div className="filter-dropdown">
                {options[filter.key].map((option) => (
                  <label className="filter-option" key={option}>
                    <input
                      type="checkbox"
                      checked={selected.includes(option)}
                      onChange={() => onToggle(filter.key, option)}
                    />
                    <span>{filter.key === 'statuses' ? statusLabel(option) : option}</span>
                  </label>
                ))}
              </div>
            ) : null}
          </div>
        );
      })}

      <label className="search-wrapper">
        <span className="search-icon" aria-hidden="true">
          S
        </span>
        <span className="sr-only">Search guests</span>
        <input
          className="search-input"
          type="search"
          value={filters.searchQuery}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Search guest"
        />
      </label>

      {hasFilters ? (
        <button className="clear-filters-btn" type="button" onClick={onClear}>
          Clear
        </button>
      ) : null}
    </div>
  );
}
