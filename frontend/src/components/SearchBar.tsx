
import {  useState } from 'react';
import '../css/SearchBar.css'
type SearchBarProps = {
    onSearch?: (query: string) => void;
    placeholder?: string;
    initialValue?: string;
    className?: string;
};

function SearchBar({ onSearch, placeholder = 'Search...', initialValue = '', className = '' }: SearchBarProps) {
    const [query, setQuery] = useState(initialValue);

    // call onSearch as the user types for active filtering
    function handleChange(value: string) {
        setQuery(value);
        onSearch?.(value);
    }

    return (
        <form
            className={`searchBar ${className}`.trim()}
            role="search"
            aria-label="Search"
        >
            {/* visually-hidden label if you want to keep accessibility without showing text; project CSS can implement `.sr-only` */}
            <label htmlFor="search-input" className="sr-only">Search</label>
            <input
                id="search-input"
                type="search"
                value={query}
                onChange={(e) => handleChange(e.target.value)}
                placeholder={placeholder}
                aria-label="Search input"
            />
        </form>
    );
}

export default SearchBar;
