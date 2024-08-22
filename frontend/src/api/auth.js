import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useMutation } from 'react-query';
import { Axios } from '../lib/axios';
import errorHandler from '../lib/errorHandler';


////////////////////////////////////////////////////////
////////////////////---API CALLS---/////////////////////
////////////////////////////////////////////////////////
const signup = async (payload) => {
  const { data } = await Axios.post('/api/v1/signup', payload);
  return data;
};

const loginWithEmail = async (payload) => {
  const { data } = await Axios.post('/api/v1/login', payload);
  return data;
};

const forgotPassword = async (email) => {
  const { data } = await Axios.post('/api/v1/forgot_password', { email });
  return data;
};

// restructure later
const resetPassword = async (payload) => {
  const { data } = await Axios.post('/api/v1/reset_password', payload);
  return data;
};


////////////////////////////////////////////////////////
//////////////////////---HOOKS---///////////////////////
////////////////////////////////////////////////////////

const home = "/";
const dashboard = "/dashboard";
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

export const useLoginWithEmail = () => {
  const navigate = useNavigate();
  return useMutation(loginWithEmail, {
    onSuccess: (response) => {
      toast.success(response.message);
      navigate(dashboard);
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
