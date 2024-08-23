import { Link, useNavigate } from "react-router-dom";
import { Bars } from "react-loader-spinner";
import { Form, Formik } from "formik";
import { loginSchema } from "../../lib/utils";
import { MyTextInput } from "../../ui/form-input";
import { useAuth } from "../../lib/authContext";
import { loginWithEmail } from "../../api/auth";
import toast from "react-hot-toast";
import { useState } from "react";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate()

  const submitFormHandler = async (values) => {
    setIsLoading(true)
    const response = await loginWithEmail(values)
    if (response.status) {
      toast.success(response.message)
      setUser(response.user)
      navigate("/")
    } else {
      toast.error(response.message)
    }
    setIsLoading(false)
  };

  return (
    <div className="w-full h-[calc(100vh-128px)] sm:h-[calc(100vh-144px)] md:h-[calc(100vh-152px)] flex items-center justify-center">
      <div className="w-[90%] max-w-md mx-auto grid p-4 md:p-6 xl:p-10 rounded-3xl shadow-lg bg-white dark:bg-dark-navy-blue">
        <p className="py-4 md:py-6 lg:py-8 text-2xl md:text-3xl xl:text-4xl text-center font-bold text-arsenic dark:text-white">
          Welcome Back
        </p>
        <div className="w-full md:px-6">
          <Formik
            initialValues={{
              email: "",
              password: "",
            }}
            validationSchema={loginSchema}
            onSubmit={(values, { setSubmitting }) => {
              submitFormHandler(values);
              setSubmitting(false);
            }}
          >
            {() => {
              return (
                <Form className="w-full mb-4 md:mb-8 max-w-sm mx-auto flex flex-col gap-3 md:gap-4 items-center">
                  <MyTextInput
                    label="Email"
                    name="email"
                    type="email"
                    placeholder="oowoga@gmail.com.com"
                  />
                  <MyTextInput
                    label="Password"
                    name="password"
                    type="password"
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-40 py-2 flex items-center justify-center font-medium bg-blue-500 text-white border border-blue-500 dark:border-0 rounded-lg ${
                      !isLoading && "hover:bg-white hover:text-blue-500"
                    }`}
                  >
                    {isLoading ? (
                      <Bars
                        height={22}
                        width={22}
                        ariaLabel="bars-loading"
                        color="white"
                      />
                    ) : (
                      "Login"
                    )}
                  </button>
                </Form>
              );
            }}
          </Formik>
          <div className="w-full mt-2 md:mt-4 px-4 md:px-8">
            <div className="w-full text-arsenic dark:text-white">
              <div className="w-full flex md:flex-col items-center justify-center gap-1 md:gap-2 text-sm">
                <Link
                  to={"/forgot-password"}
                  className="block hover:text-blue-500 hover:underline"
                >
                  Forgot your password?
                </Link>
                <Link to="/signup" className="group">
                  Don't have an account?{" "}
                  <span className="group-hover:text-blue-900 dark:group-hover:text-blue-500">
                    Sign up
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
