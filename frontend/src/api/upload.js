import toast from "react-hot-toast";
import { Axios } from "../lib/axios";

export const handleImageUpload = async (type, file) => {    
  if (file) {
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      const { data } = await Axios.post(`/api/v1/image_uploads/${type}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success(data.message)
      return data
    } catch (error) {
      toast.error(error.message)
    }
  }
};
