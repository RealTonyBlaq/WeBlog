import { fetchPosts } from "../../api/posts";

export async function loader() {
    const posts = await fetchPosts();
    
    return { posts }
  }
