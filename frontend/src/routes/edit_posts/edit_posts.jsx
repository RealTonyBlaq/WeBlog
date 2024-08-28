import { useLoaderData } from "react-router-dom";
import EditPost from "../../ui/edit-post";

export default function EditPostPage() {
  const { tags, post: { post } } = useLoaderData();
  console.log(post);

  return <EditPost tags={tags} post={post} />
}