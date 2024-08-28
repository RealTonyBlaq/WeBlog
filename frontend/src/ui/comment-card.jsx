import { useState } from "react";
import { useAuth } from "../lib/useAuth";
import { Oval } from "react-loader-spinner";

/* eslint-disable react/prop-types */
export default function CommentCard({ comment, deleteComment }) {
  const { user } = useAuth();
  const [isLoading, setLoading] = useState(false);
  const datePublished = new Date(comment.created_at);

  return (
    <div className="relative group w-full p-4 md:px-6 dark:text-white bg-slate-100 dark:bg-gunmetal rounded-md">
      {user && comment.author_id === user.id ? (
        <button
          onClick={async () => {
            setLoading(true);
            await deleteComment(comment.id);
            setLoading(false)
          }}
          className="absolute top-0 right-0 z-10 hidden group-hover:flex p-2 md:p-3 items-center justify-center"
        >
          {!isLoading ? (
            <span className="icon-[material-symbols--delete]"></span>
          ) : (
            <Oval
              visible={true}
              height="16"
              width="16"
              color="#4fa94d"
              ariaLabel="oval-loading"
              wrapperStyle={{}}
              wrapperClass=""
            />
          )}
        </button>
      ) : null}
      <div className="w-full flex items-center gap-1 md:gap-2">
        {comment.author.avatar_url && (
          <img
            src={comment.author.avatar_url}
            alt="header image"
            className="w-12 h-12 rounded-full"
          />
        )}
        <p className="font-semibold">{`${comment.author.first_name} ${comment.author.last_name}`}</p>
        <p>
          {`${datePublished.getDate()}/${datePublished.getMonth()}/${datePublished.getFullYear()}`}
        </p>
      </div>
      <p className="text-sm">{comment.content}</p>
    </div>
  );
}
