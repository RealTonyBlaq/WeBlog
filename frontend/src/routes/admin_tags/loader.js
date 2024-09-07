import { fetchTags } from "../../api/tags";

export async function loader() {
  const { data } = await fetchTags();

  return { data };
}
