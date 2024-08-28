import { queryPosts } from "../../api/posts";

export async function loader({ request }) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q") || "";
  const posts = await queryPosts(q);

  return { posts };
}
