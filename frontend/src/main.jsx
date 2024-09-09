import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import "./index.css";
import { Toaster } from "react-hot-toast";
// pages
import GeneralLayout from "./ui/general-layout";
import Login from "./routes/login/login";
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
// import HomePage from "./routes/home/home";
import LatestPostsPage from "./routes/latest/latest";
import RenderPostMarkDown from "./routes/post/post";
import EditPostPage from "./routes/edit_posts/edit_posts";
import ErrorPage from "./error-page";
import QueryPostsPage from "./routes/search/search";
import MyDraftsPage from "./routes/my_drafts/my_drafts";
import AdminDashboard from "./routes/admin/admin";
import AdminTagsPage from "./routes/admin_tags/admin_tags";
import CreateTagPage from "./routes/create_tag/create_tag";
import TagPage from "./routes/tag/tag";
import EditTagPage from "./routes/edit_tag/edit_tag";
import AdminUsersPage from "./routes/admin_users/admin_users";
import UserPage from "./routes/user/user";
import AdminPostsPage from "./routes/admin_posts/admin_posts";
import NotFoundPage from "./404";
// loaders
import { loader as HomeLoader } from "./routes/home/loader";
import { loader as PostLoader } from "./routes/post/loader";
import { loader as TagsLoader } from "./routes/create_posts/loader";
import { loader as myPostsLoader } from "./routes/my_posts/loader";
import { loader as myDraftsLoader } from "./routes/my_drafts/loader";
import { loader as editPostLoader } from "./routes/edit_posts/loader";
import { loader as bookmarksLoader } from "./routes/my_bookmarks/loader";
import { loader as searchLoader } from "./routes/search/loader";
import { loader as tagDataLoader } from "./routes/tag/loader";
import { loader as editTagDataLoader } from "./routes/edit_tag/loader";
import { loader as userDataLoader } from "./routes/user/loader";
// actions
import { action as DeletePost } from "./routes/delete_post/action";

const queryClient = new QueryClient();

// const router = createBrowserRouter([
//   {
//     path: "/",
//     element: (
//       <AuthProvider>
//         <GeneralLayout />
//       </AuthProvider>
//     ),
//     errorElement: <ErrorPage />,
//     children: [
//       {
//         path: "/",
//         element: <HomePage />,
//         children: [
//           {
//             errorElement: <div>Oops....Page not found</div>,
//             children: [
//               {
//                 index: true,
//                 element: <LatestPostsPage />,
//                 loader: HomeLoader,
//               },
//             ],
//           },
//         ],
//       },
//       {
//         path: "search",
//         element: <QueryPostsPage />,
//         loader: searchLoader
//       },
//       {
//         path: "posts/:id",
//         element: <RenderPostMarkDown />,
//         loader: PostLoader,
//       },
//       {
//         path: "login",
//         element: <Login />,
//       },
//       {
//         path: "signup",
//         element: <SignUp />,
//       },
//       {
//         path: "forgot-password",
//         element: <ForgotPassword />,
//       },
//       {
//         path: "reset_password/:token/:user_id",
//         element: <ResetPassword />,
//       },
//       {
//         path: "resend_conf_email",
//         element: <ResendConfirmationEmail />,
//       },
//       {
//         path: "admin",
//         element: <AdminDashboard />,
//         children: [
//           {
//             path: 'users',
//             element: <AdminUsersPage />,
//           },
//           {
//             path: 'users/:id',
//             element: <UserPage />,
//             loader: userDataLoader
//           },
//           {
//             path: 'articles',
//             element: <AdminPostsPage />
//           },
//           {
//             path: 'tags',
//             element: <AdminTagsPage />,
//           },
//           {
//             path: 'tags/:id',
//             element: <TagPage />,
//             loader: tagDataLoader
//           },
//           {
//             path: 'tags/:id/edit',
//             element: <EditTagPage />,
//             loader: editTagDataLoader
//           },
//           {
//             path: 'create_tag',
//             element: <CreateTagPage />,
//           }
//         ]
//       },
//       {
//         path: "dashboard",
//         element: <DashBoard />,
//         children: [
//           {
//             errorElement: <ErrorPage />,
//             children: [
//               {
//                 index: true,
//                 element: <MyProfilePage />,
//               },
//               {
//                 path: "create_post",
//                 element: <CreatePostPage />,
//                 loader: TagsLoader
//               },
//               {
//                 path: "edit_profile",
//                 element: <EditMyProfile />,
//               },
//               {
//                 path: "change_password",
//                 element: <ChangeMyPassword />,
//               },
//               {
//                 path: "my_posts",
//                 element: <MyPostsPage />,
//                 loader: myPostsLoader
//               },
//               {
//                 path: "my_drafts",
//                 element: <MyDraftsPage />,
//                 loader: myDraftsLoader
//               },
//               {
//                 path: "my_posts/:id/delete",
//                 action: DeletePost,
//               },
//               {
//                 path: "my_posts/:id/edit",
//                 element: <EditPostPage />,
//                 loader: editPostLoader
//               },
//               {
//                 path: "my_bookmarks",
//                 element: <MyBookmarksPage />,
//                 loader: bookmarksLoader
//               },
//             ],
//           },
//         ],
//       },
//       {
//         path: "*",
//         element: <NotFoundPage />
//       }
//     ],
//   },
// ]);

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route
      path="/"
      element={
        <AuthProvider>
          <GeneralLayout />
        </AuthProvider>
      }
      errorElement={<ErrorPage />}
    >
      <Route errorElement={<ErrorPage />}>
        <Route index element={<LatestPostsPage />} loader={HomeLoader} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<SignUp />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password" element={<ResetPassword />} />
        <Route path="resend_conf_email" element={<ResendConfirmationEmail />} />
        <Route
          path="search"
          element={<QueryPostsPage />}
          loader={searchLoader}
        />
        <Route
          path="posts/:id"
          element={<RenderPostMarkDown />}
          loader={PostLoader}
        />
        <Route path="admin" element={<AdminDashboard />}>
          <Route path="users" element={<AdminUsersPage />} />
          <Route
            path="users/:id"
            element={<UserPage />}
            loader={userDataLoader}
          />
          <Route path="articles" element={<AdminPostsPage />} />
          <Route path="tags" element={<AdminTagsPage />} />
          <Route path="tags/:id" element={<TagPage />} loader={tagDataLoader} />
          <Route
            path="tags/:id/edit"
            element={<EditTagPage />}
            loader={editTagDataLoader}
          />
          <Route path="create_tag" element={<CreateTagPage />} />
        </Route>
        <Route path="dashboard" element={<DashBoard />}>
          <Route errorElement={<ErrorPage />}>
            <Route index element={<MyProfilePage />} />
            <Route
              path="create_post"
              element={<CreatePostPage />}
              loader={TagsLoader}
            />
            <Route path="edit_profile" element={<EditMyProfile />} />
            <Route path="change_password" element={<ChangeMyPassword />} />
            <Route
              path="my_bookmarks"
              element={<MyBookmarksPage />}
              loader={bookmarksLoader}
            />
            <Route
              path="my_drafts"
              element={<MyDraftsPage />}
              loader={myDraftsLoader}
            />
            <Route
              path="my_posts"
              element={<MyPostsPage />}
              loader={myPostsLoader}
            />
            <Route
              path="my_posts/:id/edit"
              element={<EditPostPage />}
              loader={editPostLoader}
            />
            <Route path="my_posts/:id/delete" action={DeletePost} />
          </Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Route>
  )
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Toaster
        position="bottom-right"
        reverseOrder={false}
        containerClassName="overflow-auto"
      />
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>
);
