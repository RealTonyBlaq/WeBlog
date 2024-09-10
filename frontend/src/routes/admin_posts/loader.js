import { fetchPosts } from "../../api/posts";

export async function loader() {
  const { data, page, total_pages } = await fetchPosts();

  return { data, page, total_pages };
}
