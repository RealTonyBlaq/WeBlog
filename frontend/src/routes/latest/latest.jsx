import { useLoaderData } from "react-router-dom";
import { fetchPosts } from "../../api/posts";
import DisplayPosts from "../../ui/display-posts";

export default function LatestPostsPage() {
  const { posts } = useLoaderData();

  return (
    <div className="w-full max-w-2xl xl:max-w-4xl mx-auto p-4 sm:px-8 md:py-4 md:px-12 lg:px-20 xl:py-12 xl:px-24">
      <DisplayPosts posts={posts} fetchData={fetchPosts} />
    </div>
  );
}
