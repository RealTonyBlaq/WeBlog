import { useLoaderData } from "react-router-dom";
import BackToProfile from "../../ui/back-to-profile";
import { fetchMyBookmarks } from "../../api/posts";
import DisplayPosts from "../../ui/display-posts";

export default function MyBookmarksPage() {
  const {
    data: posts,
  } = useLoaderData();

  return (
    <div className="w-full">
      <BackToProfile />
      <div className="w-full">
        <p className="text-lg md:text-xl xl:text-2xl font-semibold pb-2 dark:text-white">
          My Bookmarks
        </p>
        <div className="w-full p-4 md:p-6 rounded-lg">
          {posts.data.length ? (
            <DisplayPosts posts={posts} fetchData={fetchMyBookmarks} />
          ) : (
            <div className="w-full h-40 font-medium dark:text-white flex flex-col items-center justify-center gap-2 md:gap-4">
              <p className="">
                You do not have any bookmarked articles at the moment
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
