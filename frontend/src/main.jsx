import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import "./index.css";
import GeneralLayout from "./ui/general-layout";
import Login from "./routes/login/login";
import { Toaster } from "react-hot-toast";
import SignUp from "./routes/signup/signup";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: <GeneralLayout />,
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
