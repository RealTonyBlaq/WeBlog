import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useMutation } from "react-query";
import { Axios } from "../lib/axios";
import errorHandler from "../lib/errorHandler";

////////////////////////////////////////////////////////
////////////////////---API CALLS---/////////////////////
////////////////////////////////////////////////////////

const baseURL = import.meta.env.VITE_BASE_URL;

const postFetch = async (fetchURL, payload) =>
  await fetch(`${baseURL + fetchURL}`, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

export const getProfile = async () => {
  const { data } = await Axios.get("/api/v1/me");
  return data;
};

const signup = async (payload) => {
  const data = await fetch(`${baseURL}/api/v1/signup`, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  })
  return await data.json();
};

export const loginWithEmail = async (payload) => {
  const data = await postFetch('/api/v1/login', payload)
  const response = await data.json();
  if (data.ok)
    return { status: data.ok, message: response.message, user: response.user };
  return { status: data.ok, message: response.message };
};

export const logout = async () => {
  const data = await fetch(`${baseURL}/api/v1/logout`, {
    method: "POST",
    credentials: "include"
  });
  return data;
};

const forgotPassword = async (email) => {
  const { data } = await Axios.post("/api/v1/forgot_password", { email });
  return data;
};

// restructure later - done
const resetPassword = async (payload) => {
  const { data } = await Axios.post(payload.url, {
    password: payload.password,
    confirm_password: payload.confirm_password,
  });
  return data;
};

const resendConfirmationEmail = async (email) => {
  const { data } = await Axios.post("/api/v1/resend_conf_email", { email });
  return data;
};

////////////////////////////////////////////////////////
//////////////////////---HOOKS---///////////////////////
////////////////////////////////////////////////////////

const home = "/";
const dashboard = "/";
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
