import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/useAuth";

export default function TagButton({ tag, onClick }) {
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <div onClick={
      () => {
        if (user.is_admin) {
          navigate(`/admin/tags/${tag.id}`)
        }
      }
    } className="px-1 py-1 flex items-center gap-1 justify-between hover:bg-white hover:text-blue-500 bg-blue-500 text-white border border-blue-500 dark:border-0 rounded cursor-pointer">
      {tag.name} <span>({tag.no_posts})</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClick(tag.id);
        }}
        className="icon-[material-symbols--close] hover:text-red-500"
      ></button>
    </div>
  );
}
