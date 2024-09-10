import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  createRoutesFromElements,
  redirect,
  Route,
  RouterProvider,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import "./index.css";
import { Toaster } from "react-hot-toast";
// pages
import GeneralLayout from "./ui/general-layout";
import AuthProvider from "./context/authContext";
import LatestPostsPage from "./routes/latest/latest";
import ErrorPage from "./error-page";
import NotFoundPage from "./404";
// loaders
import { loader as HomeLoader } from "./routes/home/loader";
// api functions
import {
  deleteMyPost,
  fetchMyBookmarks,
  fetchMyDrafts,
  fetchMyPost,
  fetchMyPosts,
  fetchPost,
  fetchPosts,
  queryPosts,
} from "./api/posts";
import { fetchPostComments } from "./api/comments";
import { fetchUser, fetchUserPosts, fetchUsers } from "./api/users";
import { fetchTag, fetchTagPosts, fetchTags } from "./api/tags";

const queryClient = new QueryClient();

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
        <Route
          path="login"
          lazy={async () => {
            let Login = await import("./routes/login/login");
            return { Component: Login.default };
          }}
        />
        <Route
          path="signup"
          lazy={async () => {
            let Signup = await import("./routes/signup/signup");
            return { Component: Signup.default };
          }}
        />
        <Route
          path="forgot-password"
          lazy={async () => {
            let ForgotPassword = await import(
              "./routes/forgot_password/forgot_password"
            );
            return { Component: ForgotPassword.default };
          }}
        />
        <Route
          path="reset-password"
          lazy={async () => {
            let ResetPassword = await import(
              "./routes/reset_password/reset_password"
            );
            return { Component: ResetPassword.default };
          }}
        />
        <Route
          path="resend_conf_email"
          lazy={async () => {
            let ResendConfirmationEmail = await import(
              "./routes/resend_confirmation_email/resend_confirmation_email"
            );
            return { Component: ResendConfirmationEmail.default };
          }}
        />
        <Route
          path="search"
          lazy={async () => {
            let QueryPostsPage = await import("./routes/search/search");
            return { Component: QueryPostsPage.default };
          }}
          loader={async ({ request }) => {
            const url = new URL(request.url);
            const q = url.searchParams.get("q") || "";
            const posts = await queryPosts(q);

            return { posts };
          }}
        />
        <Route
          path="posts/:id"
          lazy={async () => {
            let RenderPostMarkDown = await import("./routes/post/post");
            return { Component: RenderPostMarkDown.default };
          }}
          loader={async ({ params }) => {
            const post = await fetchPost(params.id);
            const comments = await fetchPostComments(params.id);

            return { post, comments: comments.data };
          }}
        />
        <Route
          path="admin"
          lazy={async () => {
            let AdminDashboard = await import("./routes/admin/admin");
            return { Component: AdminDashboard.default };
          }}
        >
          <Route
            path="users"
            lazy={async () => {
              let AdminUsersPage = await import(
                "./routes/admin_users/admin_users"
              );
              return { Component: AdminUsersPage.default };
            }}
            loader={async () => {
              const { data } = await fetchUsers();

              return { data };
            }}
          />
          <Route
            path="users/:id"
            lazy={async () => {
              let UserPage = await import("./routes/user/user");
              return { Component: UserPage.default };
            }}
            loader={async ({ params }) => {
              const {
                data: { user },
              } = await fetchUser(params.id);
              const { data: postsData } = await fetchUserPosts(params.id);

              return { user, postsData };
            }}
          />
          <Route
            path="articles"
            lazy={async () => {
              let AdminPostsPage = await import(
                "./routes/admin_posts/admin_posts"
              );
              return { Component: AdminPostsPage.default };
            }}
            loader={async () => {
              const { data, page, total_pages } = await fetchPosts();

              return { data, page, total_pages };
            }}
          />
          <Route
            path="tags"
            lazy={async () => {
              let AdminTagsPage = await import(
                "./routes/admin_tags/admin_tags"
              );
              return { Component: AdminTagsPage.default };
            }}
            loader={async () => {
              const { data } = await fetchTags();

              return { data };
            }}
          />
          <Route
            path="tags/:id"
            lazy={async () => {
              let TagPage = await import("./routes/tag/tag");
              return { Component: TagPage.default };
            }}
            loader={async ({ params }) => {
              const {
                data: { tag },
              } = await fetchTag(params.id);
              const { data: postsData } = await fetchTagPosts(params.id);

              return { tag, postsData };
            }}
          />
          <Route
            path="tags/:id/edit"
            lazy={async () => {
              let EditTagPage = await import("./routes/edit_tag/edit_tag");
              return { Component: EditTagPage.default };
            }}
            loader={async ({ params }) => {
              const {
                data: { tag },
              } = await fetchTag(params.id);

              return { tag };
            }}
          />
          <Route
            path="create_tag"
            lazy={async () => {
              let CreateTagPage = await import(
                "./routes/create_tag/create_tag"
              );
              return { Component: CreateTagPage.default };
            }}
          />
        </Route>
        <Route
          path="dashboard"
          lazy={async () => {
            let DashBoard = await import("./routes/dashboard/dashboard");
            return { Component: DashBoard.default };
          }}
        >
          <Route errorElement={<ErrorPage />}>
            <Route
              index
              lazy={async () => {
                let MyProfilePage = await import(
                  "./routes/my_profile/my_profile"
                );
                return { Component: MyProfilePage.default };
              }}
            />
            <Route
              path="create_post"
              lazy={async () => {
                let CreatePostPage = await import(
                  "./routes/create_posts/create_post"
                );
                return { Component: CreatePostPage.default };
              }}
              loader={async () => {
                const {
                  data: { tags },
                } = await fetchTags();

                return { tags };
              }}
            />
            <Route
              path="edit_profile"
              lazy={async () => {
                let EditMyProfile = await import(
                  "./routes/edit_profile/edit_profile"
                );
                return { Component: EditMyProfile.default };
              }}
            />
            <Route
              path="change_password"
              lazy={async () => {
                let ChangeMyPassword = await import(
                  "./routes/change_password/change_pasword"
                );
                return { Component: ChangeMyPassword.default };
              }}
            />
            <Route
              path="my_bookmarks"
              lazy={async () => {
                let MyBookmarksPage = await import(
                  "./routes/my_bookmarks/my_bookmarks"
                );
                return { Component: MyBookmarksPage.default };
              }}
              loader={async () => {
                const postsData = await fetchMyBookmarks();
                return postsData;
              }}
            />
            <Route
              path="my_drafts"
              lazy={async () => {
                let MyDraftsPage = await import("./routes/my_drafts/my_drafts");
                return { Component: MyDraftsPage.default };
              }}
              loader={async () => {
                const postsData = await fetchMyDrafts();
                return postsData;
              }}
            />
            <Route
              path="my_posts"
              lazy={async () => {
                let MyPostsPage = await import("./routes/my_posts/my_posts");
                return { Component: MyPostsPage.default };
              }}
              loader={async () => {
                const postsData = await fetchMyPosts();

                return postsData;
              }}
            />
            <Route
              path="my_posts/:id/edit"
              lazy={async () => {
                let EditPostPage = await import(
                  "./routes/edit_posts/edit_posts"
                );
                return { Component: EditPostPage.default };
              }}
              loader={async ({ params }) => {
                const {
                  data: { tags },
                } = await fetchTags();
                const { data: post } = await fetchMyPost(params.id);
                return { tags, post };
              }}
            />
            <Route
              path="my_posts/:id/delete"
              action={async ({ params }) => {
                await deleteMyPost(params.id);
                return redirect(`/dashboard/my_posts`);
              }}
            />
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
