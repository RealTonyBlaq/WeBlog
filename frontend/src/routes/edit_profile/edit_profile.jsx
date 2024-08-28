import { Form, Formik } from "formik";
import { updateProfileSchema } from "../../lib/utils";
import { useNavigate } from "react-router-dom";
import { MyTextInput } from "../../ui/form-input";
import { Bars, TailSpin } from "react-loader-spinner";
import { updateProfile } from "../../api/auth";
import { useAuth } from "../../lib/useAuth";
import { useState } from "react";

export default function EditMyProfile() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setLoading] = useState(false);

  if (!user)
    return (
      <div className="w-full min-h-96 flex items-center justify-center">
        <TailSpin
          visible={true}
          height="150"
          width="150"
          color="#4fa94d"
          ariaLabel="tail-spin-loading"
          radius="1"
          wrapperStyle={{}}
          wrapperClass=""
        />
      </div>
    );

  const submitFormHandler = async (values) => {
    setLoading(true)
    const response = await updateProfile(values);
    if (response) {
      setUser(response.user);
      navigate("/dashboard");
    }
    setLoading(false)
  };

  const cancelEditHandler = () => {
    if (confirm("Are you sure? Changes will not be saved.")) {
      navigate("/dashboard");
    }
  };

  return (
    <div className="w-full bg-white dark:bg-dark-navy-blue p-4 md:p-8 xl:p-12 rounded-lg">
      <div className="w-full md:px-8">
        <Formik
          initialValues={{
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
          }}
          validationSchema={updateProfileSchema}
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
                <div className="w-full flex items-center justify-center gap-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-32 py-2 flex items-center justify-center font-medium bg-blue-500 text-white border border-blue-500 dark:border-0 rounded-lg ${
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
                      "Update Profile"
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
