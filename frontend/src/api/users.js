import { Axios } from "../lib/axios"
import errorHandler from "../lib/errorHandler"

export const fetchUsers = async(page=1, q="", by="id") => {
    try {
        const data = await Axios.get(`/api/v1/users?page=${page}&q=${q}&by=${by}`)
        return data
    } catch(e) {
        errorHandler(e)
    }
}

export const fetchUser = async(userId) => {
    try {
        const data = await Axios.get(`/api/v1/users/${userId}`)
        return data
    } catch(e) {
        errorHandler(e)
    }
}

export const makeUserAdmin = async(userId) => {
    try {
        const data = await Axios.patch(`/api/v1/users/${userId}`)
        return data
    } catch(e) {
        errorHandler(e)
    }
}

export const deleteUser = async(userId) => {
    try {
        const data = await Axios.delete(`/api/v1/users/${userId}`)
        return data
    } catch(e) {
        errorHandler(e)
    }
}

export const fetchUserPosts = async (userId, page=1, q="") => {
    try {
      const data = await Axios.get(`/api/v1/users/${userId}/posts?page=${page}&q=${q}`);
      return data;
    } catch (e) {
      errorHandler(e);
    }
  }
