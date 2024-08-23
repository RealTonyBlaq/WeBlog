import React from "react";
import { useField } from "formik";


export const MyTextInput = ({
  label,
  ...props
}) => {
  const [field, meta] = useField(props);
  return (
    <div className="relative w-full">
      <label
        className="absolute -top-2 left-6 px-2 text-xs text-black dark:text-white bg-white dark:bg-gunmetal"
        htmlFor={props.id || props.name}
      >
        {label}
      </label>
      <input
        className={`w-full p-2 md:px-4 md:py-2 md:text-lg border ${
          meta.error ? "border-red-600" : "border-black/25"
        } hover:border-blue-500 outline-none focus:border-blue-500 dark:bg-gunmetal dark:text-white rounded-xl`}
        {...field}
        {...props}
      />
      {meta.touched && meta.error ? (
        <div className="error text-xs mt-1 text-red-600">{meta.error}</div>
      ) : null}
    </div>
  );
};
