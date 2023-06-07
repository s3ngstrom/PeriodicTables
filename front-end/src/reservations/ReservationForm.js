import React from "react";
import ErrorAlert from "../layout/ErrorAlert";

export default function ReservationForm({
  formData,
  handleChange,
  onSubmit,
  errors,
  buttonText,
  cancelButtonText,
  onCancel,
}) {
  return (
    <form className="font-weight-bold mt-3 m-3 w-75">
      {errors && <ErrorAlert error={errors} />}
      {/* Rest of the code */}
    </form>
  );
}
