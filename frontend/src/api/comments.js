import toast from "react-hot-toast";
import { Axios } from "../lib/axios";
import errorHandler from "../lib/errorHandler";

export const commentsOrderList = ['oldest', 'latest', 'top']

export const likeComment = async (commentId) => {
  try {
    const data = await Axios.patch(`/api/v1/me/liked_comments/${commentId}`);
    return data;
  } catch (e) {
    errorHandler(e);
  }
};

export const unlikeComment = async (commentId) => {
  try {
    const data = await Axios.delete(`/api/v1/me/liked_comments/${commentId}`);
    return data;
  } catch (e) {
    errorHandler(e);
  }
};

export const fetchPostComments = async (postId, order="oldest", page=1) => {
  try {
    const data = await Axios.get(
      `/api/v1/posts/${postId}/comments?page=${page}&order=${order}&limit=2`
    );
    return data;
  } catch (e) {
    errorHandler(e);
  }
};

export const fetchCommentReplies = async (commentId, page = 1) => {
  try {
    const data = await Axios.get(
      `/api/v1/comments/${commentId}?page=${page}`
    );
    return data;
  } catch (e) {
    errorHandler(e);
  }
};

export const postComment = async (postId, payload, setComment) => {
  try {
    const response = await Axios.post(
      `/api/v1/posts/${postId}/comments`,
      payload
    );
    if (response) {
      toast.success(response.data.message);
      setComment((prev) => ({
        data: [response.data.comment, ...prev.data],
        length: prev.length + 1,
        total_pages: Math.ceil((prev.length + 1) / 2)
      }));
    }
  } catch (e) {
    errorHandler(e);
  }
};

export const deleteComment = async (postId, commentId, setComment) => {
  if (confirm("Are tou sure you want to delete your comment?")) {
    try {
      const response = await Axios.delete(
        `/api/v1/posts/${postId}/comments/${commentId}`
      );
      if (response) {
        toast.success(response.data.message);
        setComment((prev) => ({
          data: prev.data.filter((comment) => comment.id != commentId),
          length: prev.length - 1,
        }));
      }
    } catch (e) {
      errorHandler(e);
    }
  }
};
