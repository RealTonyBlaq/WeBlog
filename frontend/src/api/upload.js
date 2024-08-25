const baseURL = import.meta.env.VITE_BASE_URL;

export const handleImageUpload = async (type, file) => {    
  if (file) {
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      const result = await fetch(`${baseURL}/api/v1/image_uploads/${type}`, {
        method: "POST",
        body: formData,
      });

      const data = await result.json();

      console.log(data);
    } catch (error) {
      console.error(error);
    }
  }
};
