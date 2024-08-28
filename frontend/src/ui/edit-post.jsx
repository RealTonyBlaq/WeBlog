import DOMPurify from "dompurify";
import { marked } from "marked";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { handleImageUpload } from "../api/upload";
import { Bars } from "react-loader-spinner";
import { Form, Formik } from "formik";
import { postSchema } from "../lib/utils";
import { MyTextAndCheckInput, MyTextArea } from "./form-input";
import TagButton from "./tag-button";
import { createPost, deleteMyPost, editPost } from "../api/posts";
import toast from "react-hot-toast";

const RenderMarkDown = ({ title, body, header_url }) => {
  const header = DOMPurify.sanitize(marked.parse(title));
  const content = DOMPurify.sanitize(marked.parse(body));

  return (
    <section className="w-full">
      {header_url && (
        <img src={header_url} alt="header image" className="w-full max-h-96" />
      )}
      <div
        dangerouslySetInnerHTML={{ __html: header }}
        className="mb-4 text-xl md:text-2xl xl:text-3xl font-bold"
      ></div>
      <article dangerouslySetInnerHTML={{ __html: content }}></article>
    </section>
  );
};

export default function EditPost({ post, tags }) {
  const [preview, setPreview] = useState(false);
  const [title, setTitle] = useState(post ? post.title : "");
  const [body, setBody] = useState(post ? post.body : "");
  const [header_url, setHeaderUrl] = useState(post ? post.header_url : "");
  const [subject_tags, setSubjectTags] = useState(
    post ? tags.filter((tag) => post.tag_ids.includes(tag.id)) : []
  );
  const navigate = useNavigate();
  const [file, setFile] = useState(null);

  const handleImageChange = async (e) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const isLoading = false;

  const handleTagCheck = (tag) => {
    if (!subject_tags.find((elem) => elem.id === tag.id))
      setSubjectTags((prev) => [...prev, tag]);
  };

  const handleDeleteTag = (tag_id) => {
    setSubjectTags((prev) => prev.filter((tag) => tag.id != tag_id));
  };

  const handleSetPreview = () => {
    if (!preview) setPreview(true);
  };
  const handleDisablePreview = () => {
    if (preview) setPreview(false);
  };

  const handleTitleChange = (e) => setTitle(e.target.value);
  const handleBodyChange = (e) => setBody(e.target.value);

  const submitFormHandler = async (values) => {
    values.tag_ids = subject_tags.map((tag) => tag.id);
    values.header_url = header_url;
    if (!post) {
      const data = await createPost(values);
      toast.success(data.message);
      navigate("/dashboard/my_posts");
    } else {
      const data = await editPost(post.id, values);
      toast.success(data.message);
      navigate("/dashboard/my_posts");
    }
  };
  const cancelHandler = () => {
    if (confirm("Are you sure? Changes will not be saved.")) {
      navigate(-1);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 xl:p-8 text-arsenic dark:text-white">
      <h1 className="mb-2 md:mb-2 text-xl md:text-2xl xl:text-3xl font-semibold">
        Create Post
      </h1>
      <div className="w-full p-4 md:p-6 rounded-xl bg-white dark:bg-dark-navy-blue">
        <div className="w-full flex items-center justify-end gap-2 md:gap-4">
          <p
            onClick={handleDisablePreview}
            className={`${
              preview ? "opacity-75" : ""
            } font-semibold cursor-pointer`}
          >
            Edit
          </p>
          <p
            onClick={handleSetPreview}
            className={`${
              preview ? "" : "opacity-75"
            } font-semibold cursor-pointer`}
          >
            Preview
          </p>
        </div>
        {preview ? (
          <RenderMarkDown title={title} body={body} header_url={header_url} />
        ) : (
          <div className="w-full mt-1 md:mt-2">
            <div className="w-full flex flex-col items-center justify-center gap-4">
              <div className="w-full h-full mb-1 md:mb-2">
                <label
                  className="w-48 h-full px-2 py-1 flex items-center justify-center cursor-pointer rounded-md font-medium bg-blue-500 text-white border border-blue-500 dark:border-0 hover:bg-white hover:text-blue-500"
                  htmlFor="header_url"
                >
                  Fetch Header Image
                  <input
                    name="header_url"
                    id="header_url"
                    type="file"
                    hidden
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            </div>
            {header_url ? (
              <p className="mb-2 md:mb-4 font-medium">URL: {header_url}</p>
            ) : file && file.size < 1048576 ? (
              <section className="w-full mb-2 md:mb-4">
                File details:
                <ul className="flex items-center gap-2">
                  <li className="">
                    Name: <span className="font-medium">{file.name}</span>
                  </li>
                  <li className="">
                    Type: <span className="font-medium">{file.type}</span>
                  </li>
                  <li className="">
                    Size: <span className="font-medium">{file.size}</span> bytes
                  </li>
                </ul>
                <button
                  onClick={async () => {
                    const data = await handleImageUpload("headers", file);
                    if (data) {
                      setHeaderUrl(data.url);
                    }
                  }}
                  type="button"
                  disabled={isLoading}
                  className={`w-36 px-2 py-1 flex items-center justify-center font-medium bg-blue-500 text-white border border-blue-500 dark:border-0 rounded-lg ${
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
                    "Upload Image"
                  )}
                </button>
              </section>
            ) : file && file.size > 1048576 ? (
              <div className="w-full">
                <p className="w-full text-sm text-center font-medium text-red-500">{`File size is too large ( > 1MB)`}</p>
                <p className="w-full text-sm text-center font-medium text-red-500">
                  Please select another file
                </p>
              </div>
            ) : null}
            <Formik
              initialValues={{
                title: title,
                body: body,
              }}
              validationSchema={postSchema}
              onSubmit={(values, { setSubmitting }) => {
                submitFormHandler(values);
                setSubmitting(false);
              }}
            >
              {({ values, setFieldValue }) => {
                return (
                  <Form className="w-full mb-4 md:mb-8 flex flex-col gap-3 md:gap-4 items-center">
                    <MyTextArea
                      label="Title"
                      name="title"
                      type="text"
                      placeholder="Title of your post......"
                      value={values.title}
                      height="h-12"
                      onChange={(e) => {
                        handleTitleChange(e);
                        setFieldValue("title", e.target.value);
                      }}
                    />
                    <MyTextArea
                      label="Body"
                      name="body"
                      type="text"
                      height="min-h-96"
                      placeholder="Tell us what you have in mind......."
                      value={values.body}
                      onChange={(e) => {
                        handleBodyChange(e);
                        setFieldValue("body", e.target.value);
                      }}
                    />
                    <div className="w-full flex items-center gap-2">
                      {subject_tags.map((tag) => (
                        <TagButton
                          key={tag.id}
                          tag={tag}
                          onClick={handleDeleteTag}
                        />
                      ))}
                    </div>
                    <MyTextAndCheckInput
                      name="tag_ids"
                      label={"Add Tags"}
                      data={tags}
                      checkValue={handleTagCheck}
                    />
                    <div className="w-full flex gap-4">
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
                          <>{post ? "Update" : "Publish"}</>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={cancelHandler}
                        className="w-32 py-2 flex items-center justify-center font-medium bg-black dark:bg-white text-white dark:text-black border border-black dark:border-0 rounded-lg hover:bg-white dark:hover:bg-black hover:text-black dark:hover:text-white"
                      >
                        Cancel
                      </button>
                      {post && (
                        <button
                        type="button"
                          onClick={async (e) => {
                            e.preventDefault();
                            if (
                              confirm(
                                "Are you sure you want to delete this post?"
                              )
                            ) {
                              const response = await deleteMyPost(post.id);
                              if (response) {
                                navigate("/dashboard/my_posts");
                              }
                            }
                          }}
                          className="w-32 py-2 flex items-center justify-center font-medium bg-red-500 text-white border border-red-500 dark:border-0 rounded-lg hover:bg-white hover:text-red-500"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </Form>
                );
              }}
            </Formik>
          </div>
        )}
      </div>
    </div>
  );
}
