import { useLoaderData } from "react-router-dom";
import EditTag from "../../ui/edit-tag";

export default function EditTagPage() {
    const { tag } = useLoaderData()

    return <EditTag tag={tag} />
}