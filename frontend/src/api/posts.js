// import toast from "react-hot-toast";
import { Axios } from "../lib/axios";
import errorHandler from "../lib/errorHandler";

const baseURL = import.meta.env.VITE_BASE_URL;

export const fetchPosts = async (page = 1) => {
  const data = await fetch(`${baseURL}/api/v1/posts?page=${page}`);

  return await data.json();
};

export const queryPosts = async (q = "", page = 1) => {
  const data = await fetch(`${baseURL}/api/v1/search?q=${q}&page=${page}`);

  return await data.json();
};


export const fetchPost = async (id) => {
  const data = await fetch(`${baseURL}/api/v1/posts/${id}`);

  return await data.json();
};

export const fetchMyPosts = async (page = 1) => {
  try {
    const data = await Axios.get(`${baseURL}/api/v1/my_posts?page=${page}`);

    return data;
  } catch (e) {
    errorHandler(e);
  }
};

export const fetchMyBookmarks = async () => {
  try {
    const data = await Axios.get(`${baseURL}/api/v1/me/bookmarks`);

    return data;
  } catch (e) {
    errorHandler(e);
  }
};

export const fetchMyPost = async (post_id) => {
  try {
    const data = await Axios.get(`${baseURL}/api/v1/my_posts/${post_id}`);

    return data;
  } catch (e) {
    errorHandler(e);
  }
};

export const deleteMyPost = async (post_id) => {
  try {
    const data = await Axios.delete(`${baseURL}/api/v1/my_posts/${post_id}`);
    return data;
  } catch (e) {
    errorHandler(e);
  }
};

export const fetchPostComments = async (id, page = 1) => {
  const data = await fetch(
    `${baseURL}/api/v1/posts/${id}/comments?page=${page}&limit=4`
  );

  return await data.json();
};

export const createPost = async (payload) => {
  try {
    const data = await Axios.post(`/api/v1/my_posts`, payload);
    return data;
  } catch (e) {
    errorHandler(e);
  }
};

export const editPost = async (post_id, payload) => {
  try {
    const data = await Axios.patch(`/api/v1/my_posts/${post_id}`, payload);
    return data;
  } catch (e) {
    errorHandler(e);
  }
};

export const postComment = async (post_id, payload) => {
  try {
    const data = await Axios.post(`/api/v1/posts/${post_id}/comments`, payload);
    return data;
  } catch (e) {
    errorHandler(e);
  }
};

export const deleteComment = async (post_id, comment_id) => {
  try {
    const data = await Axios.delete(
      `/api/v1/posts/${post_id}/comments/${comment_id}`
    );
    return data;
  } catch (e) {
    errorHandler(e);
  }
};

export const addToBookmark = async (bookmarkId) => {
  try {
    const data = await Axios.post(`/api/v1/me/bookmarks/${bookmarkId}`);
    return data;
  } catch (e) {
    errorHandler(e);
  }
};

export const removeFromBookmark = async (bookmarkId) => {
  try {
    const data = await Axios.delete(`/api/v1/me/bookmarks/${bookmarkId}`);
    return data;
  } catch (e) {
    errorHandler(e);
  }
};
