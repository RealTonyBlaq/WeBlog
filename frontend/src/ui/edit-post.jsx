import DOMPurify from "dompurify";
import { marked } from "marked";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { handleImageUpload } from "../api/upload";
import { Form, Formik } from "formik";
import { MyTextAndCheckInput } from "./form-input";
import TagButton from "./tag-button";
import { createPost, deleteMyPost, editPost } from "../api/posts";
import toast from "react-hot-toast";
import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
import { baseURL } from "../api/auth";

const RenderMarkDown = ({ title, body, header_url, tags }) => {
  const header = DOMPurify.sanitize(marked.parse(title));
  const content = DOMPurify.sanitize(marked.parse(body));

  return (
    <section className="w-full">
      {header_url && (
        <img
          src={`/${header_url}`}
          alt="header image"
          className="w-full max-h-96"
        />
      )}
      <div
        dangerouslySetInnerHTML={{ __html: header }}
        className="post_markdown"
      ></div>
      <div className="font-medium mb-4">
        {tags.length
          ? tags.map((tag, i) => <span key={`${i + tag}`}>#{tag} </span>)
          : null}
      </div>
      <article
        dangerouslySetInnerHTML={{ __html: content }}
        className="post_markdown"
      ></article>
    </section>
  );
};

export default function EditPost({ post, tags }) {
  const [preview, setPreview] = useState(false);
  const [content, setContent] = useState(
    post ? post.title + "\n" + post.body : ""
  );
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
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

  const handleContentChange = useCallback((e) => {
    setContent(e);
  }, []);

  const markDownHeaderRegex = /^(#{1,6})\s+.*\n$/;

  const handlePostSubmit = async (action, type) => {
    // splits the content into the title and the body
    // checks for the index of the first new line

    const firstNewLine = content.indexOf("\n");
    const title = content.slice(0, firstNewLine + 1);
    const body = content.slice(firstNewLine + 1);

    if (!title || !markDownHeaderRegex.test(title) || title.length < 8) {
      alert(
        'Post must have a title and the title must start with a header - "#" and end with a newline and have at least 8 characters.'
      );
    } else if (!body || body.length < 64) {
      alert(
        "Post must have a body and the body must have at least 64 characters."
      );
    } else {
      const values = {
        title,
        body,
        header_url,
        tag_ids: subject_tags.map((tag) => tag.id),
      };

      if (type == "Publish") {
        await publishPostHandler(values);
      } else {
        await savePostHandler(values);
      }
    }
  };

  useEffect(() => {
    if (preview) {
      const firstNewLine = content.indexOf("\n");
      const title = content.slice(0, firstNewLine + 1);
      const body = content.slice(firstNewLine + 1);
      if (!title || !markDownHeaderRegex.test(title) || title.length < 8) {
        alert(
          'Post must have a title and the title must start with a header - "#" and end with a newline and have at least 8 characters.'
        );
      } else if (!body || body.length < 64) {
        alert(
          "Post must have a body and the body must have at least 64 characters."
        );
      } else {
        setBody(body);
        setTitle(title);
      }
    }
  }, [preview]);

  const publishPostHandler = async (values) => {
    values.is_published = true;
    if (!post) {
      const response = await createPost(values);
      toast.success(response.data.message);
      navigate("/dashboard/my_posts");
    } else {
      const response = await editPost(post.id, values);
      toast.success(response.data.message);
      navigate("/dashboard/my_posts");
    }
  };

  const savePostHandler = async (values) => {
    if (!post) {
      const response = await createPost(values);
      toast.success(response.data.message);
      navigate("/dashboard/my_drafts");
    } else {
      const response = await editPost(post.id, values);
      toast.success(response.data.message);
      navigate("/dashboard/my_drafts");
    }
  };
  const cancelHandler = () => {
    if (confirm("Are you sure? Changes will not be saved.")) {
      navigate(-1);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto text-arsenic dark:text-white">
      <h1 className="mb-2 md:mb-2 text-xl md:text-2xl xl:text-3xl font-semibold">
        {post ? "Edit" : "Create"} Article
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
            Full Preview
          </p>
        </div>
        {preview ? (
          <RenderMarkDown
            title={title}
            body={body}
            header_url={header_url}
            tags={subject_tags.map((tag) => tag.name)}
          />
        ) : (
          <div className="w-full mt-1 md:mt-2">
            <div className="w-full flex flex-col items-center justify-center gap-4">
              <div className="w-full h-full mb-1 md:mb-2">
                <label
                  className="w-48 h-full px-2 py-1 flex items-center justify-center cursor-pointer rounded-md font-medium bg-blue-700 text-white border border-blue-700 dark:border-0 hover:bg-white hover:text-blue-700"
                  htmlFor="header_url"
                >
                  {header_url ? "Change" : "Upload"} Header Image
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
              <p className="mb-2 md:mb-4 font-medium">
                HEADER_URL: {baseURL + "/" + header_url}
              </p>
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
                  className="w-36 px-2 py-1 flex items-center justify-center font-medium bg-blue-700 text-white border border-blue-700 dark:border-0 rounded-lg hover:bg-white hover:text-blue-700"
                >
                  Upload Image
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
                content: content,
              }}
              onSubmit={(values, { setSubmitting }) => {
                handlePostSubmit(values, "Publish");
                setSubmitting(false);
              }}
            >
              {({ values }) => {
                return (
                  <Form className="w-full my-4 md:my-6 xl:my-8 flex flex-col gap-1 md:gap-2 items-center">
                    <div className="markdown-notice font-medium text-sm">
                      <strong>Note:</strong> This editor supports Markdown for
                      formatting. You can use **bold**, *italics*, [links](#),
                      and more.{" "}
                      <a
                        href="https://www.markdownguide.org/cheat-sheet/"
                        target="_blank"
                        className="text-blue-500 hover:underline"
                      >
                        Learn more about Markdown
                      </a>
                      .
                    </div>
                    <SimpleMDE
                      value={content}
                      onChange={handleContentChange}
                      className="w-full post_markdown"
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
                      id="tag_ids"
                      name="tag_ids"
                      label={"Add Tags"}
                      data={tags}
                      checkValue={handleTagCheck}
                    />
                    <div className="w-full flex gap-4">
                      <button
                        type="submit"
                        className="w-24 py-2 flex items-center justify-center font-medium bg-blue-700 text-white border border-blue-700 dark:border-0 rounded-lg hover:bg-white hover:text-blue-700"
                      >
                        {post && post.is_published ? "Update" : "Publish"}
                      </button>
                      {post && !post.is_published && (
                        <button
                          type="button"
                          onClick={() => handlePostSubmit(values, "Save")}
                          className="w-36 py-2 flex items-center justify-center font-medium bg-green-500 text-white border border-green-500 dark:border-0 rounded-lg hover:bg-white hover:text-green-500"
                        >
                          Save to drafts
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={cancelHandler}
                        className="w-28 py-2 flex items-center justify-center font-medium bg-black dark:bg-white text-white dark:text-black border border-black dark:border-0 rounded-lg hover:bg-white dark:hover:bg-black hover:text-black dark:hover:text-white"
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
                                navigate("/dashboard");
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
