import { useLoaderData } from "react-router-dom";
import EditPost from "../../ui/edit-post";

export default function CreatePostPage() {
  const { tags } = useLoaderData();

  return <EditPost tags={tags} />
}
