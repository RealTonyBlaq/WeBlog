import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import TagButton from "../../ui/tag-button";
import { deleteTag, fetchTags } from "../../api/tags";
import { ThreeCircles } from "react-loader-spinner";
import toast from "react-hot-toast";

export default function AdminTagsPage() {
  const [tagsData, setTagsData] = useState({
    data: [],
    page: 1,
    totalPages: 1,
  });
  const [search, setSearch] = useState("");
  const [isLoading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setSearch(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetchTags(1, search);
      if (response) {
        setTagsData((prev) => ({
          ...prev,
          data: response.data.tags,
          totalPages: response.data.total_pages,
        }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleClickTag = async (tag_id) => {
    if (confirm("Are you sure you want to delete this tag?")) {
      const response = await deleteTag(tag_id);
      if (response) {
        toast.success(response.data.message);
        setTagsData((prev) => ({
          ...prev,
          data: prev.data.filter((tag) => tag.id != tag_id),
        }));
      }
    }
  };

  const handlePage = (number) => {
    if (number < 0) {
      if (tagsData.page + number >= 1) {
        setTagsData((prev) => ({ ...prev, page: prev.page + number }));
      }
    } else {
      if (tagsData.page < tagsData.totalPages) {
        setTagsData((prev) => ({ ...prev, page: prev.page + number }));
      }
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const response = await fetchTags(tagsData.page, search);
        if (response) {
          setTagsData((prev) => ({
            ...prev,
            data: response.data.tags,
            page: Number(response.data.page),
            totalPages: Number(response.data.total_pages),
          }));
        }
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    })();
  }, [tagsData.page]);

  if (!tagsData.data.length)
    return (
      <div className="w-full h-full p-4 md:px-6 bg-white dark:bg-dark-navy-blue dark:text-white rounded-md shadow">
        <h1 className="font-medium text-xl md:text-2xl xl:text-3xl">Tags</h1>
        <div className="w-full h-56 flex items-center justify-center">
          <p>
            There are currently no tags.{" "}
            <Link
              to={"/admin/create_tag"}
              className="text-blue-500 hover:underline"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    );

  return (
    <div className="w-full p-4 md:px-6 bg-white dark:bg-dark-navy-blue dark:text-white rounded-md shadow">
      <h1 className="font-medium text-xl md:text-2xl xl:text-3xl">Tags</h1>
      <div className="w-full flex items-center justify-between mt-4 md:mt-6">
        <form className="relative w-full max-w-md">
          <input
            id="search_tags"
            name="search_tags"
            type="text"
            value={search}
            onChange={handleChange}
            placeholder="Search for tags..."
            className="w-full px-4 py-2 text-sm outline-none rounded-lg md:rounded-xl dark:bg-dark-navy-blue/50 dark:text-white border sm:border border-arsenic/50"
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
        <Link
          to={"/admin/create_tag"}
          className="w-28 py-1.5 flex items-center justify-center font-medium bg-blue-500 text-white border border-blue-500 dark:border-0 rounded-lg hover:bg-white hover:text-blue-500"
        >
          Create Tag
        </Link>
      </div>
      <div className="w-full p-2 md:p-3">
        {isLoading ? (
          <div className="w-full h-56 md:h-72 flex items-center justify-center">
            <ThreeCircles
              visible={true}
              height="100"
              width="100"
              color="#3b82f6"
              ariaLabel="three-circles-loading"
              wrapperStyle={{}}
              wrapperClass=""
            />
          </div>
        ) : (
          <>
            {!tagsData.data.length && search ? (
                <div className="w-full h-56 flex items-center justify-center">
                  <p>There are currently no tags matching your search.</p>
                </div>
            ) : (
              <div className="w-full flex items-center flex-wrap gap-1 md:gap-2 mb-4 md:mb-6">
                {tagsData.data.map((tag) => (
                  <TagButton key={tag.id} tag={tag} onClick={handleClickTag} />
                ))}
              </div>
            )}
          </>
        )}
        <div className="w-full flex items-center justify-center gap-2 md:gap-4">
          {tagsData.page - 2 > 0 && (
            <button
              onClick={() => handlePage(-2)}
              className="flex items-center py-2 px-3 rounded font-medium bg-blue-50 dark:bg-black hover:bg-blue-200 dark:hover:text-black"
            >
              {tagsData.page - 2}
            </button>
          )}
          {tagsData.page - 1 > 0 && (
            <button
              onClick={() => handlePage(-1)}
              className="flex items-center py-2 px-3 rounded font-medium bg-blue-50 dark:bg-black hover:bg-blue-200 dark:hover:text-black"
            >
              {tagsData.page - 1}
            </button>
          )}
          <p className="font-bold">{tagsData.page}</p>
          {tagsData.page + 1 <= tagsData.totalPages && (
            <button
              onClick={() => handlePage(1)}
              className="flex items-center py-2 px-3 rounded font-medium bg-blue-50 dark:bg-black hover:bg-blue-200 dark:hover:text-black"
            >
              {tagsData.page + 1}
            </button>
          )}
          {tagsData.page + 2 <= tagsData.totalPages && (
            <button
              onClick={() => handlePage(1)}
              className="flex items-center py-2 px-3 rounded font-medium bg-blue-50 dark:bg-black hover:bg-blue-200 dark:hover:text-black"
            >
              {tagsData.page + 2}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
