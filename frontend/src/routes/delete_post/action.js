import { redirect } from "react-router-dom"
import { deleteMyPost } from "../../api/posts";

export async function action({ params }) {
        await deleteMyPost(params.id)
        return redirect(`/dashboard/my_posts`)
}