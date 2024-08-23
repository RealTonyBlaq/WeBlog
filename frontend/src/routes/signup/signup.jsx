import { Link } from "react-router-dom";
import { Bars } from "react-loader-spinner";
import { Form, Formik } from "formik";
import { MyTextInput } from "../../ui/form-input";
import { useSignup } from "../../api/auth";
import { signupSchema } from "../../lib/utils";

export default function SignUp() {
  const { mutate: signup, isLoading: signupLoading } = useSignup();

  const isLoading = signupLoading;

  const submitFormHandler = async (values) => {
    signup({
      first_name: values.first_name,
      last_name: values.last_name,
      email: values.email,
      password: values.password,
      confirm_password: values.confirm_password,
    });
  };

  return (
    <div className="w-full h-[calc(100vh-128px)] sm:h-[calc(100vh-144px)] md:h-[calc(100vh-152px)] flex items-center justify-center">
      <div className="w-[90%] max-w-2xl mx-auto grid md:grid-cols-[1fr_2fr] p-4 md:p-6 lg:p-8 xl:p-10 rounded-3xl shadow-lg bg-white dark:bg-dark-navy-blue">
        <div className="w-full flex flex-col gap-2 md:gap-4 px-2 md:px-4">
          <p className="text-2xl md:text-3xl xl:text-4xl text-center md:text-start font-bold text-arsenic dark:text-white">
            Sign Up
          </p>
              <div className="w-full pb-4 md:mb-0 text-arsenic dark:text-white flex md:flex-col items-center justify-center gap-1 md:gap-2 text-sm">
                <Link to="/signup" className="group">
                  You already have an account here?{" "}
                  <span className="group-hover:text-blue-900 dark:group-hover:text-blue-500">
                    Login here
                  </span>
                </Link>
              </div>
        </div>
        <div className="w-full md:px-8">
          <Formik
            initialValues={{
              first_name: "",
              last_name: "",
              email: "",
              password: "",
              confirm_password: "",
            }}
            validationSchema={signupSchema}
            onSubmit={(values, { setSubmitting }) => {
              submitFormHandler(values);
              setSubmitting(false);
            }}
          >
            {() => {
              return (
                <Form className="w-full max-w-sm mx-auto flex flex-col gap-3 md:gap-4 items-center">
                  <MyTextInput
                    label="First Name"
                    name="first_name"
                    type="text"
                    placeholder="Bruce"
                  />
                  <MyTextInput
                    label="Last Name"
                    name="last_name"
                    type="text"
                    placeholder="Wayne"
                  />
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
                  <MyTextInput
                    label="Confirm Password"
                    name="confirm_password"
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
                      "Sign up for free"
                    )}
                  </button>
                </Form>
              );
            }}
          </Formik>
        </div>
      </div>
    </div>
  );
}
