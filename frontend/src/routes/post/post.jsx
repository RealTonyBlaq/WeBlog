import DOMPurify from "dompurify";
import { marked } from "marked";
import { redirect, useLoaderData } from "react-router-dom";
import { MyTextArea } from "../../ui/form-input";
import { commentSchema } from "../../lib/utils";
import { Form, Formik } from "formik";
import { useEffect, useState } from "react";
import {
  addToBookmark,
  addToLikedArticles,
  removeFromBookmark,
  removeFromLikedArticles,
} from "../../api/posts";
import CommentCard from "../../ui/comment-card";
import { useAuth } from "../../lib/useAuth";
import toast from "react-hot-toast";
import Avatar from "../../ui/avatar";
import {
  commentsOrderList,
  fetchPostComments,
  postComment,
} from "../../api/comments";
import CommentCardSkeleton from "../../ui/skeletons/comment-card-skeleton";
import { useOutsideClick } from "../../lib/useOutsideClick";
import errorHandler from "../../lib/errorHandler";

const RenderPostMarkDown = () => {
  const {
    post: { author, post, tags, likes },
    comments: { comments: data, page, total_pages },
  } = useLoaderData();
  const { user, setUser } = useAuth();

  const [pageLikes, setPageLikes] = useState(likes);

  const [comments, setComment] = useState({
    data,
    page: Number(page),
    total_pages: Number(total_pages),
    order: 'oldest'
  });
  const [showCommentsOrderList, setShowCommentsOrderList] = useState(false);
  const [isLoading, setLoading] = useState(false);

  const header = DOMPurify.sanitize(marked.parse(post.title));
  const content = DOMPurify.sanitize(marked.parse(post.body));

  const datePublished = new Date(post.created_at);

  const submitCommentHandler = async (values) => {
    if (!user) {
      toast.error("Please login to be able to comment");
      return redirect("/login");
    }
    await postComment(post.id, values, setComment);
  };

  const handleBookmark = async (e) => {
    if (!user) {
      toast.error("Please login to be able to bookmark this article");
      return redirect("/login");
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

  const handleLikeArticle = async (e) => {
    e.stopPropagation();
    if (!user) {
      toast.error("Please login to be able to like this article");
      return redirect("/login");
    }
    if (user.liked_articles.includes(post.id)) {
      const response = await removeFromLikedArticles(post.id);
      if (response) {
        toast.success(response.data.message);
        setUser((prev) => ({
          ...prev,
          liked_articles: response.data.posts,
        }));
        setPageLikes((prev) => prev - 1);
      }
    } else {
      const response = await addToLikedArticles(post.id);
      if (response) {
        toast.success(response.data.message);
        setUser((prev) => ({
          ...prev,
          liked_articles: response.data.posts,
        }));
        setPageLikes((prev) => prev + 1);
      }
    }
  };

  const handleLoadMoreComments = async () => {
    setLoading(true);
    setComment((prev) => ({ ...prev, page: prev.page + 1 }));
  };

  const handleShowCommentsOrderList = () => setShowCommentsOrderList(true);
  const handleHideCommentsOrderList = () => setShowCommentsOrderList(false);

  const handleCommentOrderChange = async (order) => {
    setLoading(true)
    try {
      const response = await fetchPostComments(
        post.id,
        order,
        comments.page
      );
      if (response) {
        setComment((prev) => ({
          ...prev,
          data: response.data.comments,
          order
        }));
      }
    } catch (e) {
      errorHandler(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (comments.page > 1) {
      (async () => {
        const response = await fetchPostComments(
          post.id,
          comments.order,
          comments.page
        );
        if (response) {
          setComment((prev) => ({
            ...prev,
            data: [...prev.data, ...response.data.comments],
          }));
          setLoading(false);
        }
      })();
    }
  }, [comments.page]);

  const ref = useOutsideClick(handleHideCommentsOrderList);

  return (
    <div className="w-full md:py-6 lg:py-8 xl:py-12">
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
            <div className="w-full flex items-center gap-2">
              <Avatar author={author} />
              <p className="font-bold">{`${author.first_name} ${author.last_name}`}</p>
            </div>
            <p className="text-sm font-medium">
              Date Published:{" "}
              {`${datePublished.getDate()}/${datePublished.getMonth()}/${datePublished.getFullYear()}`}
            </p>
          </div>
        </div>
        <div
          dangerouslySetInnerHTML={{ __html: header }}
          className="post_markdown"
        ></div>
        <div className="font-medium mb-4">
          {tags.length
            ? tags.map((tag, i) => <span key={`${i + tag}`}>#{tag} </span>)
            : null}
        </div>
        <article
          dangerouslySetInnerHTML={{ __html: content }}
          className="post_markdown"
        ></article>
        <div className="w-full flex items-center justify-between text-xl md:text-2xl my-4 md:my-8">
          <div className="flex items-center gap-1 md:gap-2">
            <button
              onClick={handleLikeArticle}
              className="flex items-center justify-center"
            >
              {user && user.liked_articles.includes(post.id) ? (
                <span className="icon-[mdi--heart] text-red-500"></span>
              ) : (
                <span className="icon-[material-symbols--heart-plus-outline]"></span>
              )}
            </button>
            <p className="text-sm">{pageLikes}</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center justify-center">
              <span className="icon-[ion--share-outline]"></span>
            </button>
            <button
              onClick={handleBookmark}
              className="flex items-center justify-center"
            >
              {user && user.bookmarks.includes(post.id) ? (
                <span className="icon-[material-symbols--bookmark]"></span>
              ) : (
                <span className="icon-[material-symbols--bookmark-outline]"></span>
              )}
            </button>
          </div>
        </div>
        <div className="w-full">
          <p className="md:text-lg xl:text-xl font-semibold">Comments</p>
          <Formik
            initialValues={{
              content: "",
            }}
            validationSchema={commentSchema}
            onSubmit={(values, { setSubmitting }) => {
              submitCommentHandler(values);
              setSubmitting(false);
              values.content = "";
            }}
          >
            {() => {
              return (
                <Form className="w-full flex flex-col items-center">
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
                      className={`w-24 py-2 flex items-center justify-center font-medium bg-blue-500 text-white border border-blue-500 dark:border-0 rounded-lg ${
                        !isLoading && "hover:bg-white hover:text-blue-500"
                      }`}
                    >
                      Comment
                    </button>
                  </div>
                </Form>
              );
            }}
          </Formik>
          <div className="w-full">
            <div className="h-32 flex items-center gap-2 md:gap-4 px-4">
              <p
                onClick={handleShowCommentsOrderList}
                className="w-32 px-4 py-2 mb-1 md:mb-2 border border-arsenic cursor-pointer font-semibold flex items-center justify-between rounded-xl capitalize"
              >
                {comments.order}
                <span className="icon-[fluent--arrow-bidirectional-up-down-12-filled]"></span>
              </p>
              <ul
                ref={ref}
                className={`w-32 ${
                  showCommentsOrderList ? "block" : "hidden"
                } p-2 md:p-3 border border-arsenic rounded-lg`}
              >
                {commentsOrderList.map((order) => (
                  <li
                    key={order}
                    onClick={() => {
                      setComment(prev => ({...prev, order: order}));
                      handleCommentOrderChange(order);
                      handleHideCommentsOrderList();
                    }}
                    className="flex items-center justify-between cursor-pointer font-medium py-1 px-2 hover:bg-arsenic hover:text-white rounded capitalize"
                  >
                    {order}{" "}
                    {order === comments.order ? (
                      <span className="icon-[charm--tick-double]"></span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
            <div className="w-full grid gap-2 md:gap-4 p-4">
              {comments.data.length ? (
                comments.data.map((comment) => (
                  <CommentCard
                    key={comment.id}
                    comment={comment}
                    setParent={setComment}
                  />
                ))
              ) : (
                <p className="font-medium">Be the first to comment</p>
              )}
              {comments.data.length &&
              comments.page <= comments.total_pages &&
              isLoading ? (
                Array.from({ length: 2 }).map(() => (
                  <CommentCardSkeleton
                    key={`${Math.floor(1000000 * Math.random())}`}
                  />
                ))
              ) : comments.data.length &&
                comments.page < comments.total_pages ? (
                <button
                  type="button"
                  onClick={handleLoadMoreComments}
                  disabled={isLoading}
                  className={`w-full py-2 flex items-center justify-center font-medium bg-blue-500 text-white border border-blue-500 dark:border-0 rounded-lg ${
                    !isLoading && "hover:bg-white hover:text-blue-500"
                  }`}
                >
                  Load More Comments
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RenderPostMarkDown;
