import { useLoaderData } from "react-router-dom";
import { fetchPosts } from "../../api/posts";
import DisplayPosts from "../../ui/display-posts";

export default function LatestPostsPage() {
  const { posts } = useLoaderData();

  return <DisplayPosts posts={posts} fetchData={fetchPosts} />;
}
