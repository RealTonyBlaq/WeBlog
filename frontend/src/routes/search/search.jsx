import { useLoaderData } from "react-router-dom";
import { queryPosts } from "../../api/posts";
import DisplayPosts from "../../ui/display-posts";

export default function QueryPostsPage() {
  const { posts } = useLoaderData();

  return <DisplayPosts posts={posts} fetchData={queryPosts} />;
}
