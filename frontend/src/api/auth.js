import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useMutation } from "react-query";
import { Axios } from "../lib/axios";
import errorHandler from "../lib/errorHandler";

////////////////////////////////////////////////////////
////////////////////---API CALLS---/////////////////////
////////////////////////////////////////////////////////

export const baseURL = import.meta.env.VITE_BASE_URL;

export const getProfile = async () => {
  try {
    const { data } = await Axios.get("/api/v1/me");
    return data;
  } catch (e) {
    errorHandler(e);
  }
};

export const updateProfile = async (payload) => {
  try {
    const { data } = await Axios.patch("/api/v1/me", payload);
    return data;
  } catch (e) {
    errorHandler(e);
  }
};

const signup = async (payload) => {
  const { data } = await Axios.post(`/api/v1/signup`, payload);
  return data;
};

export const loginWithEmail = async (payload) => {
  try {
    const { data } = await Axios.post("/api/v1/login", payload);
    return data;
  } catch (e) {
    errorHandler(e);
  }
};

export const logout = async () => {
  try {
    const { data } = await Axios.post(`/api/v1/logout`);
    return data;
  } catch (e) {
    errorHandler(e);
  }
};

const forgotPassword = async (email) => {
  const { data } = await Axios.post("/api/v1/forgot_password", { email });
  return data;
};

// restructure later - done
const resetPassword = async (payload) => {
  // remove initial section of current url (http://localhost:5000) and append
  // to /api/v1/ to get reset rpassword route

  const { data } = await Axios.post(`/api/v1/${payload.url.slice(21)}`, {
    password: payload.password,
    confirm_password: payload.confirm_password,
  });
  return data;
};

const resendConfirmationEmail = async (payload) => {
  const { data } = await Axios.post("/api/v1/resend_conf_email", payload);
  return data;
};

////////////////////////////////////////////////////////
//////////////////////---HOOKS---///////////////////////
////////////////////////////////////////////////////////

const home = "/";
// const dashboard = "/";
export const useSignup = () => {
  const navigate = useNavigate();
  return useMutation(signup, {
    onSuccess: (response) => {
      toast.success(response.message);
      navigate(home);
    },
    onError: (error) => {
      errorHandler(error);
    },
  });
};

export const useForgotPassword = () => {
  return useMutation(forgotPassword, {
    onSuccess: (response) => {
      toast.success(response.message);
    },
    onError: (error) => {
      errorHandler(error);
    },
  });
};

export const useResetPassword = () => {
  const navigate = useNavigate();
  return useMutation(resetPassword, {
    onSuccess: (response) => {
      navigate("/login");
      toast.success(response.message);
    },
    onError: (error) => {
      errorHandler(error);
    },
  });
};

export const useResendConfirmationEmail = () => {
  return useMutation(resendConfirmationEmail, {
    onSuccess: (response) => {
      toast.success(response.message);
    },
    onError: (error) => {
      errorHandler(error);
    },
  });
};
