import { fetchUser, fetchUserPosts } from "../../api/users";

export async function loader({ params }) {
    const { data: { user }} = await fetchUser(params.id)
    const { data: postsData} = await fetchUserPosts(params.id)

    return { user, postsData}
}
