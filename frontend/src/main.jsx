import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import "./index.css";
import GeneralLayout from "./ui/general-layout";
import Login from "./routes/login/login";
import { Toaster } from "react-hot-toast";
import SignUp from "./routes/signup/signup";
import ResetPassword from "./routes/reset_password/reset_password";
import ForgotPassword from "./routes/forgot_password/forgot_password";
import ResendConfirmationEmail from "./routes/resend_confirmation_email/resend_confirmation_email";
import AuthProvider from "./context/authContext";
import DashBoard from "./routes/dashboard/dashboard";
import MyPostsPage from "./routes/my_posts/my_posts";
import MyBookmarksPage from "./routes/my_bookmarks/my_bookmarks";
import MyProfilePage from "./routes/my_profile/my_profile";
import EditMyProfile from "./routes/edit_profile/edit_profile";
import ChangeMyPassword from "./routes/change_password/change_pasword";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: <AuthProvider><GeneralLayout /></AuthProvider>,
    errorElement: <div>Oops, error</div>,
    children: [
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/signup",
        element: <SignUp />,
      },
      {
        path: "/forgot-password",
        element: <ForgotPassword />,
      },
      {
        path: "/reset_password/:token/:user_id",
        element: <ResetPassword />,
      },
      {
        path: "/resend_conf_email",
        element: <ResendConfirmationEmail />,
      },
      {
        path: "/dashboard",
        element: <DashBoard />,
        children: [
          {
            errorElement: <div>Oops....Page not found</div>,
            children: [
              {
                index: true, element: <MyProfilePage />
              },
              {
                path: "edit_profile",
                element: <EditMyProfile />
              },
              {
                path: "change_password",
                element: <ChangeMyPassword />
              },
              {
                path: "my_posts",
                element: <MyPostsPage />
              },
              {
                path: "my_bookmarks",
                element: <MyBookmarksPage />
              }
            ]
          }
        ]
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Toaster
        position="top-right"
        reverseOrder={false}
        containerClassName="overflow-auto"
      />
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>
);
