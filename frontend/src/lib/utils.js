import * as yup from "yup";

const passwordRegex =
  /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;

const allowedDomains = [
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "aol.com",
  "icloud.com",
  "protonmail.com",
  "yandex.com",
  "zoho.com",
  "hotmail.com",
  "live.com",
  "mail.com",
  "gmx.com",
  "mail.ru",
  "qq.com",
  "163.com",
  "126.com",
  "naver.com",
  "daum.net",
  "hanmail.net",
  "netease.com",
  "tencent.com",
  "sina.com",
  "sohu.com",
  "rediffmail.com",
  "lycos.com",
  "rocketmail.com",
  "inbox.com",
];

const validateEmailDomain = (value) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (value) {
    if (!regex.test(value)) {
      return false; // Invalid email format
    }

    const domain = value.split("@")[1];
    return allowedDomains.includes(domain);
  }
};

export const signupSchema = yup.object().shape({
  first_name: yup.string().required("First Name is required"),
  last_name: yup.string().required("Last Name is required"),
  email: yup
    .string()
    .email()
    .test("is-valid-domain", "Invalid email address", validateEmailDomain)
    .required("Email address is required"),
  //   password: yup.string().required("Password is required"),
  password: yup
    .string()
    .matches(
      passwordRegex,
      "Password must be at least 8 characters and have at least one uppercase, one lowercase, a number and a special characters"
    )
    .required("Password is required"),
  confirm_password: yup
    .string()
    .oneOf([yup.ref("password")], "Mismatched passwords")
    .required("Please confirm your password"),
});

export const loginSchema = yup.object().shape({
  email: yup.string().email().required("Email address is required"),
  password: yup.string().required("Password is required"),
});

export const forgotPasswordSchema = yup.object().shape({
  email: yup.string().email().required("Email address is required"),
});

export const resetPasswordSchema = yup.object().shape({
  password: yup.string().required("Password is required"),
  confirm_password: yup
    .string()
    .oneOf([yup.ref("password")], "Mismatched passwords")
    .required("Please confirm your password"),
});

export const updateProfileSchema = yup.object().shape({
  first_name: yup.string(),
  last_name: yup.string(),
  email: yup
    .string()
    .email()
    .test("is-valid-domain", "Invalid email address", validateEmailDomain),
});

export const changePasswordSchema = yup.object().shape({
  password: yup.string().required("Password is required"),
  confirm_password: yup
    .string()
    .oneOf([yup.ref("password")], "Mismatched passwords")
    .required("Please confirm your password"),
});

export const postSchema = yup.object().shape({
  content: yup.string().min(72).required("Post must have content ie a title starting with a '#' and a body"),
});

export const commentSchema = yup.object().shape({
  content: yup.string().min(8).required("Content is required"),
});
