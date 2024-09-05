import { fetchMyDrafts } from "../../api/posts";


export async function loader() { 
    const postsData = await fetchMyDrafts();
    
    return postsData
  }
