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
import AuthProvider from "./lib/authContext";

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
