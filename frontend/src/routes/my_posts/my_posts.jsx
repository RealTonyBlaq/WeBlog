import { Link, useLoaderData } from "react-router-dom";
import BackToProfile from "../../ui/back-to-profile";
import DisplayPosts from "../../ui/display-posts";
import { fetchMyPosts } from "../../api/posts";
import { useMemo } from "react";

export default function MyPostsPage() {
  const { data: posts} = useLoaderData();

  const no_of_bookmarks = useMemo(() => posts.data.reduce((acc, post) => acc + post.no_of_bookmarks, 0), [posts]) 
  const no_of_comments = useMemo(() => posts.data.reduce((acc, post) => acc + post.no_of_comments, 0), [posts])
  
  return (
    <div className="w-full">
      <BackToProfile />
      <div className="w-full grid gap-4 md:gap-6 xl:gap-8">
        <div className="w-full flex items-center md:grid md:grid-cols-2 gap-4 md:gap-6">
          <div className="w-full p-4 md:p-6 bg-white dark:bg-gunmetal dark:text-white rounded-lg">
            <p className="text-xl md:text-3xl xl:text-4xl font-semibold pb-1">
              {no_of_bookmarks}
            </p>
            <p className="text-xs md:text-sm font-light opacity-75">Total post bookmarks</p>
          </div>
          <div className="w-full p-4 md:p-6 bg-white dark:bg-gunmetal dark:text-white rounded-lg">
            <p className="text-xl md:text-3xl xl:text-4xl font-semibold pb-1">
              {no_of_comments}
            </p>
            <p className="text-xs md:text-sm font-light opacity-75">Total post comments</p>
          </div>
        </div>
        <div className="w-full">
          <p className="text-lg md:text-xl xl:text-2xl font-semibold pb-2 dark:text-white">
            My Posts
          </p>
          <div className="w-full p-4 dark:text-white rounded-lg">
            { posts.data.length ? (
              <DisplayPosts posts={posts} fetchData={fetchMyPosts} />
            ) : (
              <div className="w-full h-40 font-medium flex flex-col items-center justify-center gap-2 md:gap-4">
                <p className="">You do not have any published articles at the moment</p>
                <Link
                  to={"/dashboard/create_post"}
                  className="px-4 py-2 bg-blue-500 text-white border border-blue-500 dark:border-0 rounded-lg"
                >
                  Write your first article now
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
