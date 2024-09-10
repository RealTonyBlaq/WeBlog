import { useLoaderData, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { deleteUser, fetchUserPosts, makeUserAdmin } from "../../api/users";
import { useRef, useState } from "react";
import { AdminDisplayPosts } from "../../ui/admin-display-posts";

export default function UserPage() {
  const { user, postsData } = useLoaderData();

  const [posts, setPosts] = useState(postsData);
  const [is_admin, setIsAdmin] = useState(user.is_admin);
  const [search, setSearch] = useState("");

  // set a variable to track when the user has triggered a search
  const hasSearched = useRef(false)

  const handleChange = async (e) => {
    setSearch(e.target.value);
    // if search is true but the input element is empty,
    // trigger a fetch if the user had made a search
    if (search && e.target.value === '' && hasSearched.current) {
      hasSearched.current = false
      const response = await fetchUserPosts(user.id);
      if (response) {
        setPosts(response.data);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    hasSearched.current = true
    try {
      const response = await fetchUserPosts(user.id, 1, search);
      if (response) {
        // console.log(response.data);
        setPosts(response.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const navigate = useNavigate();
  const fetchPosts = (page) => fetchUserPosts(user.id, page, search);

  const handleSetAdmin = async () => {
    if (
      confirm(
        "Are you sure you want to give this user administrative privileges?"
      )
    ) {
      const response = await makeUserAdmin(user.id);
      if (response) {
        toast.success(response.data.message);
        setIsAdmin(true);
      }
    }
  };

  const handleDeleteUser = async (userId) => {
    if (confirm("Are you sure you want to delete this user?")) {
      const response = await deleteUser(userId);
      if (response) {
        toast.success(response.data.message);
        navigate("/admin/users");
      }
    }
  };

  return (
    <div className="w-full h-full p-4 md:px-6 dark:text-white">
      <div
        onClick={() => navigate(-1)}
        className="w-16 flex items-center gap-2 font-medium text-sm md:text-base mb-1 md:mb-2 cursor-pointer dark:text-white hover:text-blue-500"
      >
        <span className="icon-[ion--play-back] text-xl"></span> Back
      </div>
      <div className="w-full md:flex items-center justify-between">
        <div>
          <h1 className="font-semibold text-xl md:text-2xl xl:text-3xl">
            {`${user.first_name} ${user.last_name}`}
          </h1>
          <p className="text-sm md:text-base font-medium">
            Email: {user.email}
          </p>
          <p className="text-sm md:text-base font-medium">ID: {user.id}</p>
        </div>
        <div className="flex items-center gap-1 md:gap-2">
          {is_admin ? (
            <p className="font-semibold flex items-center gap-1 md:gap-2">
              <span className="icon-[ri--admin-fill]"></span>
              <span className="hidden md:block">Administrator</span>
            </p>
          ) : (
            <button
              onClick={handleSetAdmin}
              className="flex items-center gap-1 p-1 md:px-2 font-medium bg-blue-500 text-white border border-blue-500 dark:border-0 rounded-lg hover:bg-white hover:text-blue-500"
            >
              <span className="icon-[ri--admin-fill]"></span>
              <span className="hidden md:block">Make Admin</span>
            </button>
          )}
          <button
            onClick={handleDeleteUser}
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
              className="w-full px-2 py-1 md:px-4 md:py-2 text-sm outline-none rounded-lg md:rounded-xl dark:bg-dark-navy-blue/50 dark:text-white shadow"
            />
            <button
              onClick={handleSubmit}
              aria-label="search button"
              type="submit"
              className="absolute top-1 sm:top-0 right-0 md:py-2 pr-1 md:pr-4 text-lg text-arsenic hover:text-blue-500 dark:text-white"
            >
              <span className="icon-[material-symbols--search]"></span>
            </button>
          </form>
        </div>
        <h2 className="mb-1 md:mb-2 font-medium text-lg lg:text-xl">
          Associated Posts
        </h2>
        {posts.data.length ? (
          <AdminDisplayPosts
            posts={posts}
            setPosts={setPosts}
            fetchData={fetchPosts}
          />
        ) : !posts.data.length && search ? (
          <p>No posts match your search.</p>
        ) : (
          <p>There are no articles linked with this user yet.</p>
        )}
      </div>
    </div>
  );
}
