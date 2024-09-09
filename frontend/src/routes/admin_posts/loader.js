import { fetchUsers } from "../../api/users";

export async function loader() {
  const { data } = await fetchUsers();

  return { data };
}
