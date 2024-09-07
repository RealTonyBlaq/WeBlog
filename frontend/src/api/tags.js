import { Axios } from "../lib/axios";
import errorHandler from "../lib/errorHandler";

export const fetchTags = async (page = 1, q = "") => {
  try {
    const data = await Axios.get(`/api/v1/tags?page=${page}&q=${q}`);
    return data;
  } catch (e) {
    errorHandler(e);
  }
};

export const createTag = async (payload) => {
  try {
    const data = await Axios.post(`/api/v1/tags`, payload);
    return data;
  } catch (e) {
    errorHandler(e);
  }
};

export const updateTag = async (tagId, payload) => {
  try {
    const data = await Axios.patch(`/api/v1/tags/${tagId}`, payload);
    return data;
  } catch (e) {
    errorHandler(e);
  }
};

export const deleteTag = async (tagId) => {
  try {
    const data = await Axios.delete(`/api/v1/tags/${tagId}`);
    return data;
  } catch (e) {
    errorHandler(e);
  }
};

export const fetchTag = async (tagId) => {
  try {
    const data = await Axios.get(`/api/v1/tags/${tagId}`);
    return data;
  } catch (e) {
    errorHandler(e);
  }
}

export const fetchTagPosts = async (tagId, page=1) => {
  try {
    const data = await Axios.get(`/api/v1/tags/${tagId}/posts?page=${page}`);
    return data;
  } catch (e) {
    errorHandler(e);
  }
}
