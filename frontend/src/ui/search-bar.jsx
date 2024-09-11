import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SearchBar() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => setSearch(e.target.value);

  const handleSubmit = (e) => {
    e.preventDefault()
    navigate(`/search?q=${search}`);
  }
  return (
    <form className="relative w-full">
      <input
        id={`search_${Math.floor(100000 * Math.random())}`}
        name={`search_${Math.floor(100000 * Math.random())}`}
        type="text"
        value={search}
        onChange={handleChange}
        placeholder="Search for posts by title..."
        className="w-full px-4 py-2 text-sm outline-none rounded-xl sm:rounded-2xl dark:bg-dark-navy-blue/50 dark:text-white border sm:border border-arsenic/50 dark:border-white/50"
      />
      <button
        onClick={handleSubmit}
        aria-label="search button"
        type="submit"
        className="absolute top-1 sm:top-0 right-0 py-1 md:py-2 pr-2 md:pr-4 text-lg text-arsenic dark:text-white"
      >
        <span className="icon-[material-symbols--search]"></span>
      </button>
    </form>
  );
}
