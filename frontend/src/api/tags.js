import { Axios } from "../lib/axios";
import errorHandler from "../lib/errorHandler";


export const fetchTags = async () => {
    try {
      const data = await Axios.get(`/api/v1/tags`);
      return data;
    } catch (e) {
      errorHandler(e);
    }
  };