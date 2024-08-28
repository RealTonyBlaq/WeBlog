import { fetchMyPosts } from "../../api/posts";


export async function loader() { 
    const postsData = await fetchMyPosts();
    
    return postsData
  }
