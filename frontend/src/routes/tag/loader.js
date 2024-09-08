import { fetchTag, fetchTagPosts } from "../../api/tags";

export async function loader({ params }) {
    const { data: { tag }} = await fetchTag(params.id)
    const { data: postsData } = await fetchTagPosts(params.id)

    return { tag, postsData }
}
