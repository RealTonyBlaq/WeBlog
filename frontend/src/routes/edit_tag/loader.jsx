import { fetchTag } from "../../api/tags"

export async function loader({ params }) {
    const { data: { tag }} = await fetchTag(params.id)

    return { tag }    
}