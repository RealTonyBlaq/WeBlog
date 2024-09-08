import { Link, useLoaderData, useNavigate } from "react-router-dom";
import { deleteTag, fetchTagPosts } from "../../api/tags";
import toast from "react-hot-toast";
import { AdminDisplayPosts } from "../../ui/admin-display-posts";
import { useEffect, useState } from "react";

export default function TagPage() {
  const { tag, postsData } = useLoaderData();

  const [posts, setPosts] = useState(postsData);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();
  const fetchPosts = (page) => fetchTagPosts(tag.id, page);

  const handleChange = (e) => setSearch(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetchTagPosts(tag.id, 1, search);
      if (response) {
        // console.log(response.data);
        setPosts(response.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!search) {
      (async () => {
        const response = await fetchTagPosts(tag.id);
        if (response) {
          setPosts(response.data);
        }
      })();
    }
  }, [search]);

  const handleDeleteTag = async () => {
    if (confirm("Are you sure you want to delete this tag?")) {
      const response = await deleteTag(tag.id);
      if (response) {
        toast.success(response.data.message);
        navigate(-1);
      }
    }
  };

  return (
    <div className="w-full h-full p-4 md:px-6 dark:text-white">
      <div
        onClick={() => navigate(-1)}
        className="w-16 flex items-center gap-2 font-medium md:text-lg mb-1 md:mb-2 cursor-pointer dark:text-white hover:text-blue-500"
      >
        <span className="icon-[ion--play-back] text-xl"></span> Back
      </div>
      <div className="w-full flex items-center justify-between">
        <div>
          <h1 className="font-semibold text-xl md:text-2xl xl:text-3xl">
            Tag: <span>{tag.name}</span>
          </h1>
          <p className="font-medium">ID: {tag.id}</p>
        </div>
        <div className="flex items-center gap-1 md:gap-2">
          <Link
            to={`/admin/tags/${tag.id}/edit`}
            className="flex items-center gap-1 p-1 md:px-2 font-medium bg-blue-500 text-white border border-blue-500 dark:border-0 rounded-lg hover:bg-white hover:text-blue-500"
          >
            <span className="icon-[mingcute--edit-line]"></span>
            <span className="hidden md:block">Edit</span>
          </Link>
          <button
            onClick={handleDeleteTag}
            className="flex items-center gap-1 p-1 md:px-2 font-medium bg-red-500 text-white border border-red-500 dark:border-0 rounded-lg hover:bg-white hover:text-red-500"
          >
            <span className="icon-[ic--outline-delete]"></span>
            <span className="hidden md:block">Delete</span>
          </button>
        </div>
      </div>
      <div className="w-full mt-4 md:mt-6 xl:mt-8">
        <div className="w-full mb-2 md:mb-4 flex items-center justify-between">
          <form className="relative w-full">
            <input
              id="search_user_posts"
              name="search_user_posts"
              type="text"
              value={search}
              onChange={handleChange}
              placeholder="Search for posts by title..."
              className="w-full px-4 py-2 text-sm outline-none rounded-lg md:rounded-xl dark:bg-dark-navy-blue/50 dark:text-white shadow"
            />
            <button
              onClick={handleSubmit}
              aria-label="search button"
              type="submit"
              className="absolute top-1 sm:top-0 right-0 py-2 pr-4 text-lg text-arsenic hover:text-blue-500 dark:text-white"
            >
              <span className="icon-[material-symbols--search]"></span>
            </button>
          </form>
        </div>
        <h2 className="mb-1 md:mb-2 font-medium text-lg lg:text-xl">
          Associated Posts
        </h2>
        {posts.data.length ? (
          <AdminDisplayPosts posts={posts} setPosts={setPosts} fetchData={fetchPosts} />
        ) :  !posts.data.length && search ? (
          <p>No posts match your search.</p>
        ) : (
          <p>There are no articles linked with this tag yet.</p>
        )}
      </div>
    </div>
  );
}
