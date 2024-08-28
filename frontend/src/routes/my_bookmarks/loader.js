import { fetchMyBookmarks } from "../../api/posts";


export async function loader() { 
    const postsData = await fetchMyBookmarks();
    return postsData
  }
