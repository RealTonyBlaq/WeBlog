/* eslint-disable react/prop-types */
import { Form, useLocation, useNavigate } from "react-router-dom";
import {
  addToBookmark,
  deletePost as delPost,
  removeFromBookmark,
} from "../api/posts";
import { useAuth } from "../lib/useAuth";
import toast from "react-hot-toast";
import DOMPurify from "dompurify";
import { marked } from "marked";

export default function PostCard({
  id,
  author,
  authorId,
  title,
  header_url,
  no_of_comments,
  no_of_likes,
  tags,
  author_avatar,
  is_published,
  deletePost,
}) {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const { pathname } = useLocation();

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
      onClick={() => {
        if (is_published) {
          return navigate(`/posts/${id}`);
        }
        navigate(`/dashboard/my_posts/${id}/edit`);
      }}
      className="w-full min-h-20 hover:bg-slate-100 dark:hover:bg-black bg-white dark:bg-dark-navy-blue text-arsenic dark:text-white rounded-md shadow cursor-pointer"
    >
      {header_url ? (
        <img
          src={`/${header_url}`}
          alt="post image"
          className="w-full h-20 md:h-40 rounded-t-md"
        />
      ) : null}
      <div className="w-full p-4 md:p-6">
        <div className="w-full">
          {author_avatar ? (
            <img
              src={`/${author_avatar}`}
              alt="author avatar"
              className="w-10 h-10 md:w-12 md:h-12 rounded-full"
            />
          ) : null}
          <p className="text-sm md:text-base font-medium">
            {user && author === user.id
              ? `${user.first_name} ${user.last_name}`
              : author}
          </p>
        </div>
        <div className="w-full">
          <div
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(marked.parse(title)),
            }}
            className="post_card_markdown"
          ></div>
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
            <p className="font-medium text-sm">
              {no_of_comments || 0} Comments
            </p>
            <p className="font-medium text-sm">{no_of_likes || 0} Likes</p>
          </div>
          {user ? (
            <div className="flex items-center gap-1 md:gap-2 text-lg">
              {authorId &&
                user.id === authorId &&
                pathname.startsWith("/dashboard") && (
                  <>
                    <Form action={`/dashboard/my_posts/${id}/edit`}>
                      <button
                        aria-label="edit post"
                        type="submit"
                        className="hover:bg-blue-500 p-1 rounded-full hover:text-slate-100"
                      >
                        <span
                          aria-hidden
                          className="icon-[lucide--edit] block"
                        ></span>
                      </button>
                    </Form>
                    <Form
                      action={`/dashboard/my_posts/${id}/delete`}
                      method="post"
                    >
                      <button
                        aria-label="delete post"
                        type="submit"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (
                            !confirm(
                              "Are you sure you want to delete this post?"
                            )
                          ) {
                            e.preventDefault();
                          }
                        }}
                        className="hover:bg-blue-500 p-1 rounded-full hover:text-slate-100"
                      >
                        <span
                          aria-hidden
                          className="icon-[ic--outline-delete] block"
                        ></span>
                      </button>
                    </Form>
                  </>
                )}
              {user && user.is_admin && pathname.startsWith("/admin") && (
                <button
                  aria-label="delete this post"
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (confirm("Are you sure you want to delete this post?")) {
                      const response = await delPost(id);
                      if (response) {
                        toast.success(response.data.message);
                        deletePost(id);
                      }
                    }
                  }}
                  className="hover:bg-blue-500 p-1 rounded-full hover:text-slate-100"
                >
                  <span
                    aria-hidden
                    className="icon-[ic--outline-delete] block"
                  ></span>
                </button>
              )}
              {is_published && !user.is_admin && (
                <button
                  aria-label={`${
                    user && user.bookmarks.includes(id)
                      ? "remove from"
                      : "add to"
                  } bookmarks`}
                  onClick={handleBookmark}
                  className="hover:bg-blue-500 p-1 rounded-full hover:text-slate-100"
                >
                  {user.bookmarks.includes(id) ? (
                    <span
                      aria-hidden
                      className="icon-[material-symbols--bookmark] block"
                    ></span>
                  ) : (
                    <span
                      aria-hidden
                      className="icon-[material-symbols--bookmark-outline] block"
                    ></span>
                  )}
                </button>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
