import { fetchPostComments } from "../../api/comments";
import { fetchPost } from "../../api/posts";

export async function loader({ params }) { 
    const post = await fetchPost(params.id);
    const comments = await fetchPostComments(params.id)
    
    return { post, comments: comments.data }
  }
