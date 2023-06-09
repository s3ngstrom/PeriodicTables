import React, { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import ErrorAlert from "../layout/ErrorAlert";
import ReservationForm from "./ReservationForm";
import {
  createReservation,
  readReservation,
  editReservation,
} from "../utils/api";

export default function NewReservation({ edit, loadDashboard }) {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    mobile_number: "",
    reservation_date: "",
    reservation_time: "",
    people: "",
  });
  const history = useHistory();
  const { reservation_id } = useParams();
  const [errors, setErrors] = useState(null);

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    async function getReservation() {
      if (edit) {
        try {
          let reservation = await readReservation(reservation_id, signal);
          setFormData(reservation);
        } catch (error) {
          setErrors(error);
        }
      }
    }

    getReservation();

    return function cleanup() {
      abortController.abort();
    };
  }, [edit, reservation_id]);

  function handleChange({ target }) {
    setFormData({
      ...formData,
      [target.name]:
        target.name === "people" ? Number(target.value) : target.value,
    });
  }

  function onSubmit(event) {
    event.preventDefault();
    const abortController = new AbortController();
    formData.people = Number(formData.people);

    if (edit) {
      editReservation(reservation_id, formData, abortController.signal)
        .then(() => {
          setFormData(formData);
          loadDashboard();
          history.push(`/dashboard?date=${formData.reservation_date}`);
        })
        .catch((error) => setErrors(error));
    } else {
      createReservation(formData, abortController.signal)
        .then(() => {
          loadDashboard();
          history.push(`/dashboard?date=${formData.reservation_date}`);
        })
        .catch((error) => setErrors(error));
    }

    return () => abortController.abort();
  }

  return (
    <ReservationForm
      edit={edit}
      formData={formData}
      handleChange={handleChange}
      onSubmit={onSubmit}
      onCancel={history.goBack}
      errors={errors}
    />
  );
}
