import { Link } from "react-router-dom";
import BackToProfile from "../../ui/back-to-profile";

export default function MyPostsPage() {
  const posts = [];
  return (
    <div className="w-full">
      <BackToProfile />
      <div className="w-full grid gap-4 md:gap-6 xl:gap-8">
        <div className="w-full grid md:grid-cols-2 gap-4 md:gap-6">
          <div className="w-full p-4 md:p-6 bg-white dark:bg-gunmetal dark:text-white rounded-lg">
            <p className="text-xl md:text-3xl xl:text-4xl font-semibold pb-1">
              0
            </p>
            <p className="text-sm font-light opacity-75">Total post likes</p>
          </div>
          <div className="w-full p-4 md:p-6 bg-white dark:bg-gunmetal dark:text-white rounded-lg">
            <p className="text-xl md:text-3xl xl:text-4xl font-semibold pb-1">
              0
            </p>
            <p className="text-sm font-light opacity-75">Total post comments</p>
          </div>
        </div>
        <div className="w-full">
          <p className="text-lg md:text-xl xl:text-2xl font-semibold pb-2 dark:text-white">
            My Posts
          </p>
          <div className="w-full p-4 md:p-6 bg-white dark:bg-gunmetal dark:text-white rounded-lg">
            {posts.length ? (
              <div>Post</div>
            ) : (
              <div className="w-full h-40 font-medium flex flex-col items-center justify-center gap-2 md:gap-4">
                <p className="">You do not have any articles at the moment</p>
                <Link
                  to={""}
                  className="px-4 py-2 bg-blue-500 text-white border border-blue-500 dark:border-0 rounded-lg"
                >
                  Write your first post now
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
