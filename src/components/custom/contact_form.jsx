/**
 * Portfolio
 * Copyright (C) 2025 Maxim (https://github.com/maximjsx/portfolio)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation.
 */

import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const ContactForm = ({ config }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)
    ) {
      newErrors.email = "Invalid email address";
    }
    if (!formData.message.trim()) newErrors.message = "Message is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);
    const toastId = toast.loading("Sending...");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          access_key: "5e0c59a0-9068-48b5-8b11-71c8b829a6cc",
          ...formData,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.update(toastId, {
          render: config.success_message,
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        setFormData({ name: "", email: "", message: "" });
      } else {
        toast.update(toastId, {
          render: config.failure_message,
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      }
    } catch (error) {
      toast.update(toastId, {
        render: config.error_message || "An unexpected error occurred.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ToastContainer position="top-center" />
      <form
        onSubmit={handleSubmit}
        className="bg-black/50 shadow-md rounded-lg p-8 space-y-6"
      >
        <input
          type="hidden"
          name="access_key"
          value="5e0c59a0-9068-48b5-8b11-71c8b829a6cc"
        />
        {config.fields.map((field) => (
          <div key={field.name}>
            <label
              htmlFor={field.name}
              className="block text-gray-700 font-medium mb-2"
            >
              {field.label}
            </label>
            {field.type === "textarea" ? (
              <textarea
                id={field.name}
                name={field.name}
                required={field.required}
                value={formData[field.name]}
                onChange={handleChange}
                className={`c-cursor-text w-full px-3 py-2 border bg-black/10 rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors[field.name] ? "border-red-500" : ""
                }`}
                rows="4"
              />
            ) : (
              <input
                type={field.type}
                id={field.name}
                name={field.name}
                required={field.required}
                value={formData[field.name]}
                onChange={handleChange}
                className={`c-cursor-text w-full px-3 py-2 border bg-black/10 rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors[field.name] ? "border-red-500" : ""
                }`}
              />
            )}
            {errors[field.name] && (
              <span className="text-red-500 text-sm">{errors[field.name]}</span>
            )}
          </div>
        ))}

        <button
          type="submit"
          className="c-cursor-pointer w-full bg-primary text-white py-3 rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center"
          disabled={isLoading}
        >
          {isLoading ? "Sending..." : config.send_button}
        </button>
      </form>
    </>
  );
};
