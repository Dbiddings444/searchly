
import React, {  useState } from 'react';
import '../css/SearchBar.css'
type SearchBarProps = {
    onSearch?: (query: string) => void;
    placeholder?: string;
    initialValue?: string;
    className?: string;
};

function SearchBar({ onSearch, placeholder = 'Search...', initialValue = '', className = '' }: SearchBarProps) {
    const [query, setQuery] = useState(initialValue);

    function handleSubmit(e?: React.FormEvent<HTMLFormElement>) {
        e?.preventDefault();
        const trimmed = query.trim();
        if (!trimmed) return;
        onSearch?.(trimmed);
    }

    return (
        <form
            className={`searchBar ${className}`.trim()}
            onSubmit={handleSubmit}
            role="search"
            aria-label="Search"
        >
            {/* visually-hidden label if you want to keep accessibility without showing text; project CSS can implement `.sr-only` */}
            <label htmlFor="search-input" className="sr-only">Search</label>
            <input
                id="search-input"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                aria-label="Search input"
            />
            <button type="submit" disabled={!query.trim()}>Search</button>
        </form>
    );
}

export default SearchBar;
