import { useEffect, useState } from "react";
import { useOutsideClick } from "../../lib/useOutsideClick";
import { fetchPosts } from "../../api/posts";
import PostCard from "../../ui/post-card";
import PostCardSkeleton from "../../ui/skeletons/post-card-skeleton";

export default function AdminPostsPage() {
  const [postsData, setpostsData] = useState({
    data: [],
    page: 1,
    totalPages: 1,
  });
  const [search, setSearch] = useState("");
  const [searchBy, setSearchBy] = useState("title");
  const [isLoading, setLoading] = useState(false);
  const [showSearchByList, setShowSearchByList] = useState(false);

  const searchByList = ["id", "title"];

  const handleChange = (e) => setSearch(e.target.value);

  const handleSearchByChange = (value) => setSearchBy(value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetchPosts(1, search, searchBy);
      if (response) {
        console.log(response);

        setpostsData((prev) => ({
          ...prev,
          data: response.data,
          page: Number(response.page),
          totalPages: Number(response.total_pages),
        }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleShowSearchByList = () => setShowSearchByList(true);
  const handleHideSearchByList = () => setShowSearchByList(false);

  const ref = useOutsideClick(handleHideSearchByList);

  const handlePage = (number) => {
    if (number < 0) {
      if (postsData.page + number >= 1) {
        setpostsData((prev) => ({ ...prev, page: prev.page + number }));
      }
    } else {
      if (postsData.page < postsData.totalPages) {
        setpostsData((prev) => ({ ...prev, page: prev.page + number }));
      }
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const response = await fetchPosts(postsData.page, search);
        if (response) {
          setpostsData((prev) => ({
            ...prev,
            data: response.data,
            page: Number(response.page),
            totalPages: Number(response.total_pages),
          }));
        }
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    })();
  }, [postsData.page]);

  useEffect(() => {
    if (!search) {
      (async () => {
        const response = await fetchPosts();
        if (response) {
          setpostsData((prev) => ({
            ...prev,
            data: response.data,
            page: Number(response.page),
            totalPages: Number(response.total_pages),
          }));
        }
      })();
    }
  }, [search]);

  if (!postsData.data.length && !search && !isLoading)
    return (
      <div className="w-full h-full p-4 md:px-6 dark:text-white">
        <h1 className="font-medium text-xl md:text-2xl xl:text-3xl">Posts</h1>
        <div className="w-full h-56 flex items-center justify-center">
          <p>There are currently no articles.</p>
        </div>
      </div>
    );

  return (
    <div className="w-full p-4 md:px-6 dark:text-white">
      <h1 className="font-medium text-xl md:text-2xl xl:text-3xl">Posts</h1>
      <div className="w-full flex items-center justify-between gap-1">
        <form className="relative w-full max-w-md">
          <input
            id="search_posts"
            name="search_posts"
            type="text"
            value={search}
            onChange={handleChange}
            placeholder="Search for articles..."
            className="w-full px-2 py-1 md:px-4 md:py-2 text-sm outline-none rounded md:rounded-xl dark:bg-dark-navy-blue/50 dark:text-white shadow"
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
        <div className="relative flex items-center gap-2 md:gap-4">
          <p
            onClick={handleShowSearchByList}
            className="w-20 md:w-40 text-sm bg-white dark:bg-dark-navy-blue px-2 py-1 md:px-4 md:py-2 shadow cursor-pointer font-semibold flex items-center justify-between rounded md:rounded-xl capitalize"
          >
            By {searchBy}
            <span className="icon-[fluent--arrow-bidirectional-up-down-12-filled]"></span>
          </p>
          <ul
            ref={ref}
            className={`w-20 md:w-40 ${
              showSearchByList
                ? "absolute -bottom-[96px] left-0 z-10"
                : "hidden"
            } p-2 md:p-3 bg-slate-50 dark:bg-dark-navy-blue shadow rounded-lg`}
          >
            {searchByList.map((option) => (
              <li
                key={option}
                onClick={() => {
                  handleSearchByChange(option);
                  handleHideSearchByList();
                }}
                className="flex items-center justify-between cursor-pointer font-medium py-1 px-2 hover:bg-arsenic hover:text-white rounded capitalize"
              >
                {option}{" "}
                {option === searchBy ? (
                  <span className="icon-[charm--tick-double]"></span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="w-full p-2 md:p-3">
        {isLoading ? (
          <div className="w-full flex items-center flex-wrap gap-2 md:gap-4 mb-4 md:mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <PostCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <>
            {!postsData.data.length && search ? (
              <div className="w-full h-56 flex items-center justify-center">
                <p>There are currently no articles matching your search.</p>
              </div>
            ) : (
              <div className="w-full flex items-center flex-wrap gap-2 md:gap-4 mb-4 md:mb-6">
                {postsData.data.map((post) => (
                  <PostCard
                    key={post.id}
                    id={post.id}
                    author={post.author}
                    authorId={post.authorId}
                    title={post.title}
                    header_url={post.header_url}
                    no_of_comments={post.no_of_comments}
                    no_of_likes={post.no_of_likes}
                    tags={post.tags}
                    author_avatar={post.author_avatar}
                    is_published={post.is_published}
                    // deletePost={}
                  />
                ))}
              </div>
            )}
          </>
        )}
        <div className="w-full flex items-center justify-center gap-2 md:gap-4">
          {postsData.page - 2 > 0 && (
            <button
              onClick={() => handlePage(-2)}
              className="flex items-center py-2 px-3 rounded font-medium bg-blue-50 dark:bg-black hover:bg-blue-200 dark:hover:text-black"
            >
              {postsData.page - 2}
            </button>
          )}
          {postsData.page - 1 > 0 && (
            <button
              onClick={() => handlePage(-1)}
              className="flex items-center py-2 px-3 rounded font-medium bg-blue-50 dark:bg-black hover:bg-blue-200 dark:hover:text-black"
            >
              {postsData.page - 1}
            </button>
          )}
          <p className="font-bold">{postsData.page}</p>
          {postsData.page + 1 <= postsData.totalPages && (
            <button
              onClick={() => handlePage(1)}
              className="flex items-center py-2 px-3 rounded font-medium bg-blue-50 dark:bg-black hover:bg-blue-200 dark:hover:text-black"
            >
              {postsData.page + 1}
            </button>
          )}
          {postsData.page + 2 <= postsData.totalPages && (
            <button
              onClick={() => handlePage(1)}
              className="flex items-center py-2 px-3 rounded font-medium bg-blue-50 dark:bg-black hover:bg-blue-200 dark:hover:text-black"
            >
              {postsData.page + 2}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
