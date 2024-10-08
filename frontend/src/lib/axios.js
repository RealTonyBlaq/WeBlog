import axios from 'axios';

const Axios = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
});

const csrf = document.getElementsByName("csrf-token")[0].content;

Axios.defaults.headers.post['Content-Type'] = 'application/json';
Axios.defaults.headers.post.Accept = 'application/json';
Axios.defaults.headers.common['X-CSRF-TOKEN'] = csrf;
Axios.defaults.withCredentials = true

Axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401) {
      window.location.href = import.meta.env.VITE_REDIRECT_URL;
    }

    return Promise.reject(error);
  }
);

export { Axios };
