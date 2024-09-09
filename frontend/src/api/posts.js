// import toast from "react-hot-toast";
import { Axios } from "../lib/axios";
import errorHandler from "../lib/errorHandler";
import { baseURL } from "./auth";

export const fetchPosts = async (page = 1, q="", by="title") => {
  const data = await fetch(`${baseURL}/api/v1/posts?page=${page}&q=${q}&by=${by}`);

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

export const fetchMyDrafts = async (page = 1) => {
  try {
    const data = await Axios.get(`${baseURL}/api/v1/my_posts?page=${page}&published=False`);

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

export const deletePost = async (post_id) => {
  try {
    const data = await Axios.delete(`${baseURL}/api/v1/posts/${post_id}`);
    return data;
  } catch (e) {
    errorHandler(e);
  }
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

export const addToLikedArticles = async (postId) => {
  try {
    const data = await Axios.patch(`/api/v1/me/liked_articles/${postId}`);
    return data;
  } catch (e) {
    errorHandler(e);
  }
};

export const removeFromLikedArticles = async (postId) => {
  try {
    const data = await Axios.delete(`/api/v1/me/liked_articles/${postId}`);
    return data;
  } catch (e) {
    errorHandler(e);
  }
};

export const addToBookmark = async (bookmarkId) => {
  try {
    const data = await Axios.patch(`/api/v1/me/bookmarks/${bookmarkId}`);
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
