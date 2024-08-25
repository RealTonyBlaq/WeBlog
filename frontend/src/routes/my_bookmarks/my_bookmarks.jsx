import BackToProfile from "../../ui/back-to-profile";

export default function MyBookmarksPage() {
  const posts = [];
  return (
    <div className="w-full">
      <BackToProfile />
      <div className="w-full">
        <p className="text-lg md:text-xl xl:text-2xl font-semibold pb-2 dark:text-white">
          My Bookmarks
        </p>
        <div className="w-full p-4 md:p-6 bg-white dark:bg-gunmetal dark:text-white rounded-lg">
          {posts.length ? (
            <div>Post</div>
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
