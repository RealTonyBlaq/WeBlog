import { fetchMyPost } from "../../api/posts";
import { fetchTags } from "../../api/tags";

export async function loader({ params }) {
  const { data: { tags }} = await fetchTags();
  const { data: post} = await fetchMyPost(params.id)

  return { tags, post };
}
