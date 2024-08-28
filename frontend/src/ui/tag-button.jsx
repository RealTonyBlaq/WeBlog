export default function TagButton({ tag, onClick }) {
  return (
    <button
      onClick={() => onClick(tag.id)}
      className="px-1 py-1 flex items-center gap-1 justify-between hover:bg-white hover:text-blue-500 bg-blue-500 text-white border border-blue-500 dark:border-0 rounded"
    >
      {tag.name}
      <span className="icon-[material-symbols--close]"></span>
    </button>
  );
}
