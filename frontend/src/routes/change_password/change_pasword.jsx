import { Form, Formik } from "formik";
import { changePasswordSchema } from "../../lib/utils";
import { useNavigate } from "react-router-dom";
import { MyTextInput } from "../../ui/form-input";
import { Bars } from "react-loader-spinner";
import { updateProfile } from "../../api/auth";
import toast from "react-hot-toast";

export default function ChangeMyPassword() {
  // const { mutate: signup, isLoading: signupLoading } = useSignup();
  const navigate = useNavigate();

  const isLoading = false;
  // const isLoading = signupLoading;

  const submitFormHandler = async (values) => {
    const response = await updateProfile(values)
    if (response) {
      toast.success(response.message)
    }
  };

  const cancelEditHandler = () => {
    if (confirm("Are you sure? Changes will not be saved.")) {
      navigate("/dashboard");
    }
  };
  return (
    <div className="w-full bg-white dark:bg-dark-navy-blue p-4 md:p-8 xl:p-12 rounded-lg">
      <p className="mb-4 md:mb-8 text-sm font-medium italic text-center text-red-400">
        Note: You need to have recently signed in to perform this action
      </p>
      <div className="w-full md:px-8">
        <Formik
          initialValues={{
            password: "",
            confirm_password: "",
          }}
          validationSchema={changePasswordSchema}
          onSubmit={(values, { setSubmitting }) => {
            submitFormHandler(values);
            setSubmitting(false);
          }}
        >
          {() => {
            return (
              <Form className="w-full max-w-sm mx-auto flex flex-col gap-3 md:gap-4 items-center">
                <MyTextInput label="Password" name="password" type="password" />
                <MyTextInput
                  label="Confirm Password"
                  name="confirm_password"
                  type="password"
                />
                <div className="w-full flex flex-col md:flex-row items-center justify-center gap-2">
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
                      "Update Password"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={cancelEditHandler}
                    className={`w-32 py-2 flex items-center justify-center font-medium bg-red-500 text-white border border-red-500 dark:border-0 rounded-lg ${
                      !isLoading && "hover:bg-white hover:text-red-500"
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              </Form>
            );
          }}
        </Formik>
      </div>
    </div>
  );
}
