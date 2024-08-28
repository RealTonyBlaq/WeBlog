import DOMPurify from "dompurify";
import { marked } from "marked";
import { redirect, useLoaderData } from "react-router-dom";
import { MyTextArea } from "../../ui/form-input";
import { Bars } from "react-loader-spinner";
import { commentSchema } from "../../lib/utils";
import { Form, Formik } from "formik";
import { useEffect, useState } from "react";
import {
  addToBookmark,
  deleteComment,
  fetchPostComments,
  postComment,
  removeFromBookmark,
} from "../../api/posts";
import CommentCard from "../../ui/comment-card";
import { useAuth } from "../../lib/useAuth";
import toast from "react-hot-toast";

const RenderPostMarkDown = () => {
  const {
    post: { author, post, tags },
    comments: { comments: data, page, total_pages },
  } = useLoaderData();
  const { user, setUser } = useAuth();

  const [comments, setComment] = useState(data);
  const [commentsPage, setCommentsPage] = useState(Number(page));
  const [isLoading, setLoading] = useState(false);

  const header = DOMPurify.sanitize(marked.parse(post.title));
  const content = DOMPurify.sanitize(marked.parse(post.body));

  // console.log(user);
  const datePublished = new Date(post.created_at);

  const submitCommentHandler = async (values) => {
    // console.log(values);
    if (!user) {
      toast.error('Please login to be able to comment')
      return redirect("/login")
    }
    const response = await postComment(post.id, values);
    if (response) {
      toast.success(response.data.message);
      setComment((prev) => [...prev, response.data.comment]);
    }
  };

  const deleteCommentHandler = async (comment_id) => {
    if (confirm("Are tou sure you want to delete your comment?")) {
      const response = await deleteComment(post.id, comment_id);
      if (response) {
        toast.success(response.data.message);
        setComment((prev) =>
          prev.filter((comment) => comment.id != comment_id)
        );
      }
    }
  };

  const handleBookmark = async (e) => {
    if (!user) {
      toast.error('Please login to be able to bookmark this article')
      return redirect("/login")
    }
    e.stopPropagation();
    if (user.bookmarks.includes(post.id)) {
      const response = await removeFromBookmark(post.id);
      if (response) {
        toast.success(response.data.message);
        setUser((prev) => ({
          ...prev,
          bookmarks: response.data.posts,
        }));
      }
    } else {
      const response = await addToBookmark(post.id);
      if (response) {
        toast.success(response.data.message);
        setUser((prev) => ({
          ...prev,
          bookmarks: response.data.posts,
        }));
      }
    }
  };

  const handleLoadMoreComments = async () => {
    setLoading(true);
    setCommentsPage((prev) => prev + 1);
  };

  useEffect(() => {
    if (commentsPage > 1) {
      (async () => {
        const { comments } = await fetchPostComments(post.id, commentsPage);
        setComment((prev) => [...prev, ...comments]);
        setLoading(false);
      })();
    }
  }, [commentsPage, post.id]);

  return (
    <div className="w-full py-4 md:py-6 lg:py-8">
      <section className="w-full max-w-3xl mx-auto p-4 md:p-8 lg:p-10 xl:p-12 bg-white dark:bg-dark-navy-blue text-arsenic dark:text-white rounded-md shadow">
        {post.header_url && (
          <img
            src={post.header_url}
            alt="header image"
            className="w-full h-full max-h-96"
          />
        )}
        <div className="w-full flex items-center justify-between mb-2 md:mb-4 text-sm">
          <div className="">
            <div className="w-full">
              {author.avatar_url ? (
                <img
                  src={author.avatar_url}
                  alt="author avatar"
                  className="w-12 h-12 rounded-full"
                />
              ) : null}
              <p className="font-bold">{`${author.first_name} ${author.last_name}`}</p>
            </div>
            <p>
              Date Published:{" "}
              {`${datePublished.getDate()}/${datePublished.getMonth()}/${datePublished.getFullYear()}`}
            </p>
          </div>
          <div className="text-xl md:text-2xl flex items-center gap-1 md:gap-2">
            <button onClick={handleBookmark} className="">
              {user && user.bookmarks.includes(post.id) ? (
                <span className="icon-[material-symbols--bookmark]"></span>
              ) : (
                <span className="icon-[material-symbols--bookmark-outline]"></span>
              )}
            </button>
          </div>
        </div>
        <div
          dangerouslySetInnerHTML={{ __html: header }}
          className="mb-4 text-2xl md:text-3xl xl:text-5xl font-bold"
        ></div>
        <div className="font-medium mb-4">
          {tags.length
            ? tags.map((tag, i) => <span key={`${i + tag}`}>#{tag} </span>)
            : null}
        </div>
        <article
          dangerouslySetInnerHTML={{ __html: content }}
          className="mb-4 md:mb-8"
        ></article>
        <div className="w-full">
          <p className="text-xl md:text-2xl xl:text-3xl font-medium">
            Comments
          </p>
          <Formik
            initialValues={{
              content: "",
            }}
            validationSchema={commentSchema}
            onSubmit={(values, { setSubmitting }) => {
              submitCommentHandler(values);
              setSubmitting(false);
            }}
          >
            {() => {
              return (
                <Form className="w-full flex flex-col gap-3 md:gap-2 items-center">
                  <MyTextArea
                    label=""
                    name="content"
                    type="text"
                    placeholder="Comment here......"
                    height="min-h-20"
                  />
                  <div className="w-full flex justify-end">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`w-40 py-2 flex items-center justify-center font-medium bg-blue-500 text-white border border-blue-500 dark:border-0 rounded-lg ${
                        !isLoading && "hover:bg-white hover:text-blue-500"
                      }`}
                    >
                      {isLoading ? (
                        <Bars
                          height={22}
                          width={22}
                          ariaLabel="bars-loading"
                          color="white"
                        />
                      ) : (
                        "Comment"
                      )}
                    </button>
                  </div>
                </Form>
              );
            }}
          </Formik>
          <div className="w-full grid gap-2 md:gap-4 p-4">
            {comments.length ? (
              comments.map((comment) => (
                <CommentCard
                  key={comment.id}
                  comment={comment}
                  deleteComment={deleteCommentHandler}
                />
              ))
            ) : (
              <p className="font-medium">Be the first to comment</p>
            )}
            {comments.length && commentsPage < Number(total_pages) ? (
              <button
                type="button"
                onClick={handleLoadMoreComments}
                disabled={isLoading}
                className={`w-full py-2 flex items-center justify-center font-medium bg-blue-500 text-white border border-blue-500 dark:border-0 rounded-lg ${
                  !isLoading && "hover:bg-white hover:text-blue-500"
                }`}
              >
                {isLoading ? (
                  <Bars
                    height={22}
                    width={22}
                    ariaLabel="bars-loading"
                    color="white"
                  />
                ) : (
                  "Load More Comments"
                )}
              </button>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
};

export default RenderPostMarkDown;
