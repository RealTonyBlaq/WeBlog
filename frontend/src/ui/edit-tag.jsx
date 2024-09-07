import { useState } from "react";
import { createTag } from "../api/tags";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Form, Formik } from "formik";
import { tagSchema } from "../lib/utils";
import { MyTextInput } from "../ui/form-input";
import { Bars } from "react-loader-spinner";
import { updateTag } from "../api/tags";

export default function EditTag({ tag }) {
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const submitFormHandler = async (values) => {
    setIsLoading(true);
    if (tag) {
      const response = await updateTag(tag.id, values);
      if (response) {
        toast.success(response.data.message);
        navigate("/admin/tags");
      }
    } else {
      const response = await createTag(values);
      if (response) {
        toast.success(response.data.message);
        navigate("/admin/tags");
      }
    }
    setIsLoading(false);
  };

  const cancelHandler = () => {
    if (confirm("Are you sure? Changes will not be saved.")) {
      navigate(-1);
    }
  };

  return (
    <div className="w-full">
      <div className="w-[90%] max-w-md mx-auto p-4 md:p-6 xl:p-10 rounded-xl shadow-lg bg-white dark:bg-dark-navy-blue">
        <p className="py-4 md:py-6 lg:py-8 text-2xl md:text-3xl xl:text-4xl text-center font-bold text-arsenic dark:text-white">
          {tag ? "Edit" : "Create"} Tag
        </p>
        <div className="w-full md:px-6">
          <Formik
            initialValues={{
              name: tag ? tag.name : "",
            }}
            validationSchema={tagSchema}
            onSubmit={(values, { setSubmitting }) => {
              submitFormHandler(values);
              setSubmitting(false);
            }}
          >
            {() => {
              return (
                <Form className="w-full mb-4 md:mb-8 max-w-sm mx-auto flex flex-col gap-3 md:gap-4 items-center">
                  <MyTextInput
                    label="Name"
                    id="name"
                    name="name"
                    type="text"
                    placeholder=""
                  />
                  <div className="w-full flex items-center justify-center gap-2 md:gap-4">
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
                      ) : tag ? (
                        "Update Tag"
                      ) : (
                        "Create Tag"
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={cancelHandler}
                      className="w-28 py-2 flex items-center justify-center font-medium bg-black dark:bg-white text-white dark:text-black border border-black dark:border-0 rounded-lg hover:bg-white dark:hover:bg-black hover:text-black dark:hover:text-white"
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
    </div>
  );
}
