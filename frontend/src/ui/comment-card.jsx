import { useEffect, useRef, useState } from "react";
import { useAuth } from "../lib/useAuth";
import Avatar from "./avatar";
import CommentCardSkeleton from "./skeletons/comment-card-skeleton";
import toast from "react-hot-toast";
import { commentSchema } from "../lib/utils";
import { Form, Formik } from "formik";
import { MyTextArea } from "./form-input";
import {
  fetchCommentReplies,
  likeComment,
  postComment,
  unlikeComment,
} from "../api/comments";
import { redirect } from "react-router-dom";
import { deleteComment as handleDeleteComment } from "../api/comments";

/* eslint-disable react/prop-types */
export default function CommentCard({ comment, setParent }) {
  const { user, setUser } = useAuth();

  const [commentLikes, setCommentLikes] = useState(comment.likes);

  const [replies, setReplies] = useState({
    data: [],
    length: comment.replies,
    page: 1,
    totalPages: Math.ceil(comment.replies / 2),
  });
  const [repliesLoading, setLoading] = useState(false);
  const [showReplies, setShow] = useState(true);

  const [replyComment, setReplyComment] = useState(false);

  // variable to track the initial fetching of a comment's replies
  const initialFetch = useRef(false);

  const datePublished = new Date(comment.created_at);
  const dateUpdated = new Date(comment.updated_at);

  const submitReplyHandler = async (values) => {
    if (!user) {
      toast.error("Please login to be able to comment");
      return redirect("/login");
    }
    await postComment(
      comment.post_id,
      { ...values, parent_id: comment.id },
      setReplies
    );
    setReplyComment((prev) => !prev);
  };

  const handleFetchCommentReplies = async (commentId, page) => {
    setLoading(true);
    const response = await fetchCommentReplies(commentId, page);
    if (response) {
      setReplies((prev) => ({
        ...prev,
        data: [...prev.data, ...response.data.comments],
        page: Number(response.data.page),
        totalPages: Number(response.data.total_pages),
      }));
    }
    setLoading(false);
  };

  const handleShowReplies = () => setShow((prev) => !prev);

  const handleLikeComment = async (e) => {
    e.stopPropagation();
    if (!user) {
      toast.error("Please login to be able to like this comment");
      return redirect("/login");
    }
    if (user.liked_comments.includes(comment.id)) {
      const response = await unlikeComment(comment.id);
      if (response) {
        toast.success(response.data.message);
        setUser((prev) => ({
          ...prev,
          liked_comments: response.data.comments,
        }));
        setCommentLikes((prev) => prev - 1);
      }
    } else {
      const response = await likeComment(comment.id);
      if (response) {
        toast.success(response.data.message);
        setUser((prev) => ({
          ...prev,
          liked_comments: response.data.comments,
        }));
        setCommentLikes((prev) => prev + 1);
      }
    }
  };

  const handleLoadMoreReplies = async () => {
    if (replies.page < replies.totalPages) {
      // setReplies((prev) => ({ ...prev, page: prev.page + 1 }));
      await handleFetchCommentReplies(comment.id, replies.page + 1);
    }
  };

  useEffect(() => {
    if (!initialFetch.current) {
      (async () => {
        await handleFetchCommentReplies(comment.id, 1);
      })();
    }
    initialFetch.current = true;
  }, []);

  return (
    <div className="w-full">
      <div className="relative group w-full p-4 md:p-6 dark:text-white bg-slate-100 dark:bg-gunmetal rounded-xl shadow">
        {user && comment.author_id === user.id ? (
          <button
            onClick={async () =>
              await handleDeleteComment(comment.post_id, comment.id, setParent)
            }
            className="absolute top-0 right-0 z-10 hidden group-hover:flex p-2 md:p-3 items-center justify-center"
          >
            <span className="icon-[material-symbols--delete]"></span>
          </button>
        ) : null}
        <div className="w-full flex items-center gap-1 md:gap-2">
          <Avatar author={comment.author} />
          <div className="">
            <p className="font-semibold">{`${comment.author.first_name} ${comment.author.last_name}`}</p>
            <p className="text-xs">
              {`${datePublished.getDate()}/${datePublished.getMonth()}/${datePublished.getFullYear()}`}
            </p>
          </div>
        </div>
        <p className="text-sm pl-2 pt-1 md:pl-4">{comment.content}</p>
      </div>
      <div className="w-full pl-4 md:pl-8 xl:pl-12 pt-1">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex items-center gap-1 md:gap-2">
              <button
                onClick={handleLikeComment}
                className="flex items-center justify-center"
              >
                {user && user.liked_comments.includes(comment.id) ? (
                  <span className="icon-[mdi--heart] text-red-500"></span>
                ) : (
                  <span className="icon-[material-symbols--heart-plus-outline]"></span>
                )}
              </button>
              <p className="text-sm">{commentLikes}</p>
            </div>
            <button
              onClick={() => setReplyComment((prev) => !prev)}
              className="flex items-center justify-center"
            >
              <span className="icon-[mdi--message-reply]"></span>
            </button>
            {replies.length ? (
              <div className="flex items-center gap-2 text-blue-500 font-semibold">
                <button
                  onClick={handleShowReplies}
                  className="flex items-center justify-center"
                >
                  <span
                    className={`icon-[bxs--down-arrow] ${
                      showReplies ? "rotate-180" : ""
                    } ease-linear duration-200`}
                  ></span>
                </button>
                <p>
                  {replies.length}
                  {` ${replies.length === 1 ? "reply" : "replies"}`}
                </p>
              </div>
            ) : null}
          </div>
          {datePublished.getTime() + 100 < dateUpdated.getTime() && (
            <p className="text-xs font-medium opacity-75">edited</p>
          )}
        </div>
        <Formik
          initialValues={{
            content: "",
          }}
          validationSchema={commentSchema}
          onSubmit={(values, { setSubmitting }) => {
            submitReplyHandler(values);
            setSubmitting(false);
            values.content = "";
          }}
        >
          {() => {
            return (
              <Form
                className={`w-full ${
                  replyComment ? "h-[110px]" : "h-0"
                } overflow-hidden ease-in-out duration-150 flex flex-col items-center pl-4 my-2`}
              >
                <MyTextArea
                  label=""
                  name="content"
                  type="text"
                  placeholder="Comment here......"
                  height="min-h-10"
                />
                <div className="w-full flex justify-end">
                  <button
                    type="submit"
                    className="w-16 py-1 flex items-center justify-center font-medium bg-blue-500 text-white border border-blue-500 dark:border-0 rounded-lg hover:bg-white hover:text-blue-500"
                  >
                    Reply
                  </button>
                </div>
              </Form>
            );
          }}
        </Formik>
        <div className="w-full">
          {showReplies && replies.data.length ? (
            <>
              {replies.data.map((reply, i) => (
                <CommentCard
                  key={`${i}-${reply.id}`}
                  comment={reply}
                  setParent={setReplies}
                />
              ))}
              {replies.length &&
              replies.page <= replies.totalPages &&
              repliesLoading ? (
                Array.from({ length: 2 }).map(() => (
                  <CommentCardSkeleton
                    key={`${Math.floor(1000000 * Math.random())}`}
                  />
                ))
              ) : replies.length && replies.page < replies.totalPages ? (
                <button
                  type="button"
                  onClick={handleLoadMoreReplies}
                  className="w-full py-2 flex items-center justify-center font-medium bg-blue-500 text-white border border-blue-500 dark:border-0 rounded-lg hover:bg-white hover:text-blue-500"
                >
                  Load More Replies
                </button>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
