/* eslint-disable react/prop-types */
import { Form, useNavigate } from "react-router-dom";
import { addToBookmark, removeFromBookmark } from "../api/posts";
import { useAuth } from "../lib/useAuth";
import toast from "react-hot-toast";

export default function PostCard({
  id,
  author,
  title,
  header_url,
  no_of_comments,
  no_of_bookmarks,
  tags,
  author_avatar,
}) {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const handleBookmark = async (e) => {
    e.stopPropagation();
    if (user.bookmarks.includes(id)) {
      const response = await removeFromBookmark(id);
      if (response) {
        toast.success(response.data.message);
        setUser((prev) => ({
          ...prev,
          bookmarks: prev.bookmarks.filter((post_id) => post_id != id),
        }));
      }
    } else {
      const response = await addToBookmark(id);
      if (response) {
        toast.success(response.data.message);
        setUser((prev) => ({ ...prev, bookmarks: [...prev.bookmarks, id] }));
      }
    }
  };

  return (
    <div
      onClick={() => navigate(`/posts/${id}`)}
      className="w-full min-h-20 hover:bg-slate-100 dark:hover:bg-black bg-white dark:bg-dark-navy-blue text-arsenic dark:text-white rounded-md shadow cursor-pointer"
    >
      {header_url ? (
        <img
          src={`/${header_url}`}
          alt="post image"
          className="w-full h-40 rounded-t-md"
        />
      ) : null}
      <div className="w-full p-4 md:p-6">
        <div className="w-full">
          {author_avatar ? (
            <img
              src={`/${author_avatar}`}
              alt="author avatar"
              className="w-12 h-12 rounded-full"
            />
          ) : null}
          <p className="text-sm md:text-base font-medium">{user && author === user.id ? `${user.first_name} ${user.last_name}` : author}</p>
        </div>
        <div className="w-full">
          <p className="md:text-lg xl:text-xl font-semibold">{title}</p>
          <div className="text-sm">
            {tags.length
              ? tags.map((tag, i) => (
                  <span key={`${id + i + tag}`}>#{tag} </span>
                ))
              : null}
          </div>
        </div>
        <div className="w-full flex items-center justify-between">
          <div className="mt-2 md:mt-4 flex items-center gap-2 md:gap-4">
            <p className="font-medium text-sm">{no_of_comments || 0} Comments</p>
            <p className="font-medium text-sm">{no_of_bookmarks || 0} Bookmarks</p>
          </div>
          {user ? (
            <div className="flex items-center gap-1 md:gap-2 text-lg">
              {user.id === author && (
                <>
                  <Form action={`/dashboard/my_posts/${id}/edit`}>
                    <button
                      type="submit"
                      className="hover:bg-blue-500 p-1 rounded-full hover:text-slate-100"
                    >
                      <span className="icon-[lucide--edit] block"></span>
                    </button>
                  </Form>
                  <Form action={`/dashboard/my_posts/${id}/delete`} method="post">
                    <button
                    type="submit"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (
                          !confirm("Are you sure you want to delete this post?")
                        ) {
                          e.preventDefault();
                        }
                      }}
                      className="hover:bg-blue-500 p-1 rounded-full hover:text-slate-100"
                    >
                      <span className="icon-[ic--outline-delete] block"></span>
                    </button>
                  </Form>
                </>
              )}
              <button
                onClick={handleBookmark}
                className="hover:bg-blue-500 p-1 rounded-full hover:text-slate-100"
              >
                {user.bookmarks.includes(id) ? (
                  <span className="icon-[material-symbols--bookmark] block"></span>
                ) : (
                  <span className="icon-[material-symbols--bookmark-outline] block"></span>
                )}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
