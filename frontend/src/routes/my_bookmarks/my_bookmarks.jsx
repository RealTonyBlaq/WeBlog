import { useLoaderData } from "react-router-dom";
import BackToProfile from "../../ui/back-to-profile";
import PostCard from "../../ui/post-card";

export default function MyBookmarksPage() {
  const { data: { bookmarks: posts}} = useLoaderData();

  return (
    <div className="w-full">
      <BackToProfile />
      <div className="w-full">
        <p className="text-lg md:text-xl xl:text-2xl font-semibold pb-2 dark:text-white">
          My Bookmarks
        </p>
        <div className="w-full p-4 md:p-6 bg-white dark:bg-gunmetal dark:text-white rounded-lg">
          {posts.length ? (
            <div className="w-full grid gap-3 md:gap-4 xl:gap-6">
            {posts.map((post, index) => (
              <PostCard
                key={`${post.id + index + post.author + post.title}`}
                id={post.id}
                author={post.author || post.author_id}
                tags={post.tags}
                title={post.title}
                header_url={post.header_url}
                no_of_comments={post.no_of_comments}
                no_of_bookmarks={post.no_of_bookmarks}
              />
            ))}
          </div>
          ) : (
            <div className="w-full h-40 font-medium flex flex-col items-center justify-center gap-2 md:gap-4">
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
