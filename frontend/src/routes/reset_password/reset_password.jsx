import { Link } from "react-router-dom";
import { Bars } from "react-loader-spinner";
import { Form, Formik } from "formik";
import { resetPasswordSchema } from "../../lib/utils";
import { MyTextInput } from "../../ui/form-input";
import { useResetPassword } from "../../api/auth";

export default function ResetPassword() {
  const url = window.location.href;
  const { mutate, isLoading } = useResetPassword();

  const submitFormHandler = async (values) => {
    mutate({
      url,
      password: values.password,
      confirm_password: values.confirm_password,
    });
  };

  return (
    <div className="w-full h-[calc(100vh-128px)] sm:h-[calc(100vh-144px)] md:h-[calc(100vh-152px)] flex items-center justify-center">
      <div className="w-[90%] max-w-md mx-auto grid p-4 md:p-6 xl:p-10 rounded-3xl shadow-lg bg-white dark:bg-dark-navy-blue">
        <p className="py-4 md:py-6 lg:py-8 text-2xl md:text-3xl xl:text-4xl text-center font-bold text-arsenic dark:text-white">
          Reset Password
        </p>
        <div className="w-full">
          <Formik
            initialValues={{
              password: "",
              confirm_password: "",
            }}
            validationSchema={resetPasswordSchema}
            onSubmit={(values, { setSubmitting }) => {
              submitFormHandler(values);
              setSubmitting(false);
            }}
          >
            {() => {
              return (
                <Form className="w-full mb-4 md:mb-8 max-w-xs mx-auto flex flex-col gap-3 md:gap-4 items-center">
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
                      "Reset Password"
                    )}
                  </button>
                </Form>
              );
            }}
          </Formik>
          <div className="w-full pt-2 md:pt-4 px-4 md:px-8">
            <div className="w-full text-arsenic dark:text-white">
              <div className="w-full flex md:flex-col items-center justify-center gap-1 md:gap-2 text-sm">
                <Link to="/login" className="group">
                  You already have an account here?{" "}
                  <span className="group-hover:text-blue-900 dark:group-hover:text-blue-500">
                    Login here
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
