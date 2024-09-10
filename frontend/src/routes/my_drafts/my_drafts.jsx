import { Link, useLoaderData } from "react-router-dom";
import BackToProfile from "../../ui/back-to-profile";
import DisplayPosts from "../../ui/display-posts";
import { fetchMyPosts } from "../../api/posts";

export default function MyDraftsPage() {
  const { data: posts } = useLoaderData();

  return (
    <div className="w-full">
      <BackToProfile />
      <div className="w-full grid gap-4 md:gap-6 xl:gap-8">
        <div className="w-full">
          <p className="text-lg md:text-xl xl:text-2xl font-semibold pb-2 dark:text-white">
            My Drafts
          </p>
          <div className="w-full p-4 dark:text-white rounded-lg">
            {posts.data.length ? (
              <DisplayPosts posts={posts} fetchData={fetchMyPosts} />
            ) : (
              <div className="w-full h-40 font-medium flex flex-col items-center justify-center gap-2 md:gap-4">
                <p className="">
                  You do not have any drafts (unpublished articles) at the
                  moment
                </p>
                <Link
                  to={"/dashboard/create_post"}
                  className="px-4 py-2 bg-blue-700 hover:bg-white text-white hover:text-blue-700 border border-blue-700 dark:border-0 rounded-lg"
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
