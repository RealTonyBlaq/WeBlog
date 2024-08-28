import { fetchTags } from "../../api/tags";

export async function loader() {
  const { data: { tags }} = await fetchTags();

  return { tags };
}
