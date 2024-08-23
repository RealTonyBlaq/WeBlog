import toast from "react-hot-toast";

const errorHandler = (error) => {
  const data = error?.response?.data;
  const errorMessage = data?.message || "Something's not right, please try again.";

  return toast.error(errorMessage);
};

export default errorHandler;
