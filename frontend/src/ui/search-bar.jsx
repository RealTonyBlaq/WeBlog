export default function SearchBar() {
  return (
    <form action="" className="relative w-full">
      <input
        id="search"
        name="search"
        type="text"
        placeholder="Search for posts..."
        className="w-full px-4 py-2 text-sm outline-none rounded-xl sm:rounded-2xl dark:bg-dark-navy-blue/50 dark:text-white border sm:border border-arsenic/50 dark:border-white/50"
      />
      <button
        aria-label="search button"
        type="submit"
        className="absolute top-1 sm:top-0 right-0 py-2 pr-4 text-lg text-arsenic dark:text-white"
      >
        <span className="icon-[material-symbols--search]"></span>
      </button>
    </form>
  );
}
