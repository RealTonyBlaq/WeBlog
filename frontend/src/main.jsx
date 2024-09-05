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
import CreatePostPage from "./routes/create_posts/create_post";
import HomePage from "./routes/home/home";
import LatestPostsPage from "./routes/latest/latest";
import RenderPostMarkDown from "./routes/post/post";
import EditPostPage from "./routes/edit_posts/edit_posts";
import ErrorPage from "./error-page";
import QueryPostsPage from "./routes/search/search";
// loaders
import { loader as HomeLoader } from "./routes/home/loader";
import { loader as PostLoader } from "./routes/post/loader";
import { loader as TagsLoader } from "./routes/create_posts/loader";
import { loader as myPostsLoader } from "./routes/my_posts/loader";
import { loader as myDraftsLoader } from "./routes/my_drafts/loader"
import { loader as editPostLoader } from "./routes/edit_posts/loader";
import { loader as bookmarksLoader } from "./routes/my_bookmarks/loader";
import { loader as searchLoader } from "./routes/search/loader";
// actions
import { action as DeletePost } from "./routes/delete_post/action";
import MyDraftsPage from "./routes/my_drafts/my_drafts";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <AuthProvider>
        <GeneralLayout />
      </AuthProvider>
    ),
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <HomePage />,
        children: [
          {
            errorElement: <div>Oops....Page not found</div>,
            children: [
              {
                index: true,
                element: <LatestPostsPage />,
                loader: HomeLoader,
              },   
            ],
          },
        ],
      },
      {
        path: "search",
        element: <QueryPostsPage />,
        loader: searchLoader
      },
      {
        path: "posts/:id",
        element: <RenderPostMarkDown />,
        loader: PostLoader,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "signup",
        element: <SignUp />,
      },
      {
        path: "forgot-password",
        element: <ForgotPassword />,
      },
      {
        path: "reset_password/:token/:user_id",
        element: <ResetPassword />,
      },
      {
        path: "resend_conf_email",
        element: <ResendConfirmationEmail />,
      },
      {
        path: "dashboard",
        element: <DashBoard />,
        children: [
          {
            errorElement: <ErrorPage />,
            children: [
              {
                index: true,
                element: <MyProfilePage />,
              },
              {
                path: "create_post",
                element: <CreatePostPage />,
                loader: TagsLoader
              },
              {
                path: "edit_profile",
                element: <EditMyProfile />,
              },
              {
                path: "change_password",
                element: <ChangeMyPassword />,
              },
              {
                path: "my_posts",
                element: <MyPostsPage />,
                loader: myPostsLoader
              },
              {
                path: "my_drafts",
                element: <MyDraftsPage />,
                loader: myDraftsLoader
              },
              {
                path: "my_posts/:id/delete",
                action: DeletePost,
              },
              {
                path: "my_posts/:id/edit",
                element: <EditPostPage />,
                loader: editPostLoader
              },
              {
                path: "my_bookmarks",
                element: <MyBookmarksPage />,
                loader: bookmarksLoader
              },
            ],
          },
        ],
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
