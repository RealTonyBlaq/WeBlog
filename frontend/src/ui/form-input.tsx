import React, { ClassAttributes, InputHTMLAttributes, useState } from "react";
import { FieldHookConfig, useField } from "formik";
import { useOutsideClick } from "../lib/useOutsideClick";

export const MyTextInput = ({ label, ...props }) => {
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

export const MyTextArea = ({ label, ...props }) => {
  const [field, meta] = useField(props);
  return (
    <div className="relative w-full mb-4">
      <label
        className="absolute -top-2 left-6 px-2 text-sm text-black dark:text-white bg-white dark:bg-gunmetal"
        htmlFor={props.id || props.name}
      >
        {label}
      </label>
      <textarea
        className={`w-full ${
          props.height
        } p-2 md:px-4 md:py-2 text-sm border ${
          meta.error ? "border-red-600" : "border-black/25"
        } hover:border-blue-500 outline-none focus:border-blue-500 dark:bg-gunmetal dark:text-white rounded-md`}
        {...field}
        {...props}
      />
      {meta.touched && meta.error ? (
        <div className="error text-xs text-red-600">{meta.error}</div>
      ) : null}
    </div>
  );
};

export const MyTextAndCheckInput = ({ label, checkValue, data, ...props }) => {
  const [field, meta, helpers] = useField({
    name: props.name,
    validate: (value) => {
      let msg;
      if (value) {
        const isValuePresent = data?.find((item) => item.name === value);

        if (!isValuePresent) {
          msg = "Please choose from list.";
        }
      }

      return msg;
    },
    type: props.type,
  });
  const [filteredData, setData] = useState<any[]>(data);
  const [focused, setFocus] = useState(false);

  const openFocus = () => setFocus(true);
  const closeFocus = () => setFocus(false);

  const setValue = (value: string, id) => {
    helpers.setValue(value);
    const isValuePresent = data.find((item) => item.id === id);

    if (isValuePresent) checkValue(isValuePresent);
    closeFocus();
  };

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = event.target.value;

    // escape special characteres like ( or ) ...
    const escapeRegex = (value: string) =>
      value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const searchRegex = new RegExp(escapeRegex(value), "gi");

    const filter = data?.filter((res) => {
      if (searchRegex.test(res.name)) return res;
    }) as any[];

    setData(filter);
  };

  const ref = useOutsideClick(closeFocus);

  return (
    <div ref={ref} className="relative w-full mb-4 z-1">
      <label
        className="block relative w-full font-semibold text-black dark:text-white"
        htmlFor={props.id || props.name}
      >
        {label}
        <input
          onFocus={openFocus}
          className={`w-full p-2 md:px-4 md:py-3 tablet:mt-1 laptop:mt-2 font-normal text-sm border ${
            meta.error ? "border-red-600" : "border-dark/25"
          } hover:border-dark/50 focus:border-dark/75 outline-none rounded-xl md:rounded-2xl`}
          {...field}
          {...props}
          onChange={(e) => {
            field.onChange(e);
            handleChange(e);
          }}
        />
      </label>
      {meta.touched && meta.error ? (
        <div className="error text-xs text-red-600">{meta.error}</div>
      ) : null}
      {focused && filteredData.length > 0 && (
        <ul className="absolute w-full max-h-48 overflow-y-scroll top-full left-0 flex flex-col gap-1 p-1 md:p-2 bg-white rounded-md shadow-md z-10">
          {filteredData.map((item, i) => (
            <li
              className="w-full p-1 cursor-pointer hover:bg-blue-700 hover:text-white rounded"
              key={item.id}
              onClick={() => {
                setValue(item.name, item.id);
              }}
            >
              {item.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
