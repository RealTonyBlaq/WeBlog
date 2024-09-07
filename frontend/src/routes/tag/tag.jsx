import { Link, useLoaderData, useNavigate } from "react-router-dom";
import DisplayPosts from "../../ui/display-posts";
import { deleteTag, fetchTagPosts } from "../../api/tags";
import toast from "react-hot-toast";

export default function TagPage() {
  const { tag, posts } = useLoaderData();

  const navigate = useNavigate(-1);
  const fetchPosts = (page) => fetchTagPosts(tag.id, page);

  const handleDeleteTag = async () => {
    if (confirm("Are you sure you want to delete this tag?")) {
      const response = await deleteTag(tag.id);
      if (response) {
        toast.success(response.data.message);
        navigate(-1)
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
            <Link to={`/admin/tags/${tag.id}/edit`} className="flex items-center gap-1 p-1 md:px-2 font-medium bg-blue-500 text-white border border-blue-500 dark:border-0 rounded-lg hover:bg-white hover:text-blue-500"><span className="icon-[mingcute--edit-line]"></span><span className="hidden md:block">Edit</span></Link>
            <button onClick={handleDeleteTag} className="flex items-center gap-1 p-1 md:px-2 font-medium bg-red-500 text-white border border-red-500 dark:border-0 rounded-lg hover:bg-white hover:text-red-500"><span className="icon-[ic--outline-delete]"></span><span className="hidden md:block">Delete</span></button>
        </div>
      </div>
      <div className="w-full mt-4 md:mt-6 xl:mt-8">
        <h2 className="mb-1 md:mb-2 font-medium text-lg lg:text-xl">Associated Posts</h2>
        {
            posts.data.length ? <DisplayPosts posts={posts} fetchData={fetchPosts} />
            : <p>There are no articles linked with this tag yet.</p>
        }
      </div>
    </div>
  );
}
