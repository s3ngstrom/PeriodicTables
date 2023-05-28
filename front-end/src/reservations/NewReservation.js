import React, { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import ErrorAlert from "../layout/ErrorAlert";
import {createReservation, readReservation, editReservation,} from "../utils/api";

// component for creating a new reservation or editing an existing one
export default function NewReservation({
  // whether the component is being used for editing an existing reservation
  edit,
  // function to refresh the dashboard when a reservation is created or edited
  loadDashboard,
}) {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    mobile_number: "",
    reservation_date: "",
    reservation_time: "",
    people: "",
  });
  // use the history object to navigate to a different page after submitting the form
  const history = useHistory();
  // get the reservation ID from the URL parameters (if this component is being used to edit an existing reservation)
  const { reservation_id } = useParams();
  // state for any errors that occur while creating/editing a reservation
  const [errors, setErrors] = useState(null);
  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;
    async function getReservation(){
      if(edit){
        let reservation= await readReservation(reservation_id,signal)
        console.log(reservation)
        setFormData(reservation)
      }
    }
    getReservation();
    return function cleanup() {
      abortController.abort();
    };
  }, [edit, reservation_id]);
  
  // updates the state of the form when the user makes any changes to it
  function handleChange({ target }) {
    setFormData({
      ...formData,
      // convert the number of people to a number (if the input name is "people")
      [target.name]:
        target.name === "people" ? Number(target.value) : target.value,
    });
  }

  // if a reservation was created or edited, clicking the "submit" button will do the following:
  function onSubmit(event) {
    // prevent the default form submission behavior
    event.preventDefault();
    // create a new AbortController to allow the API request to be cancelled
    const abortController = new AbortController();
    // convert the number of people to a number (if the input name is "people")
    formData.people = Number(formData.people);
    // if this component is being used to edit an existing reservation
    if (edit) {
      // make a PUT request to edit the reservation
      editReservation(reservation_id, formData, abortController.signal)
        // update the form data with the new values
        .then(setFormData(formData))
        // refresh the dashboard
        .then(loadDashboard)
        // navigate back to the dashboard
        .then(() =>
          history.push(`/dashboard?date=${formData.reservation_date}`)
        )
        // if there was an error, store the error message in state
        .catch((errors) => setErrors(errors));
    } else {
      // make a POST request to create a new reservation
      createReservation(formData, abortController.signal)
        // refresh the dashboard
        .then(loadDashboard)
        // navigate back to the dashboard
        .then(() =>
          history.push(`/dashboard?date=${formData.reservation_date}`)
        )
        // if there was an error, store the error message in state
        .catch((errors) => setErrors(errors));
    }
    // return a function to abort the API request if the component is unmounted
    return () => abortController.abort();
  }

  /** displays the reservation form to the user */
  return (
    <div style={{ fontFamily: "Rubik" }}>
      <h2 className="font-weight-bold d-flex justify-content-center mt-4">
        {edit ? "Edit Reservation" : "New Reservation"}
      </h2>
      <div className="d-flex justify-content-center">
        <form className="font-weight-bold mt-3 m-3 w-75">
          {errors && <ErrorAlert error={errors} />}
          <label className="form-label" htmlFor="first_name">
            First Name
          </label>
          <input
            name="first_name"
            id="first_name"
            className="form-control mb-3 border-dark"
            type="text"
            onChange={handleChange}
            value={formData.first_name}
            required
          />
          <label className="form-label" htmlFor="last_name">
            Last Name
          </label>
          <input
            name="last_name"
            id="last_name"
            className="form-control mb-3 border-dark"
            type="text"
            onChange={handleChange}
            value={formData.last_name}
            required
          />
          <label className="form-label" htmlFor="mobile_number">
            Mobile Number
          </label>
          <input
            className="form-control mb-3 border-dark"
            name="mobile_number"
            id="mobile_number"
            type="text"
            onChange={handleChange}
            value={formData.mobile_number}
            required
          />

          <label className="form-label" htmlFor="reservation_date">
            Reservation Date
          </label>
          <input
            name="reservation_date"
            id="reservation_date"
            type="date"
            className="form-control mb-3 border-dark"
            placeholder="YYYY-MM-DD"
            pattern="\d{4}-\d{2}-\d{2}"
            onChange={handleChange}
            value={formData.reservation_date}
            required
          />
          <label className="form-label" htmlFor="reservation_time">
            Reservation Time
          </label>
          <input
            name="reservation_time"
            id="reservation_time"
            className="form-control mb-3 border-dark"
            type="time"
            placeholder="HH:MM"
            pattern="[0-9]{2}:[0-9]{2}"
            onChange={handleChange}
            value={formData.reservation_time}
            required
          />
          <label className="form-label" htmlFor="people">
            Party Size
          </label>
          <input
            name="people"
            id="people"
            className="form-control mb-3 border-dark"
            type="number"
            min="1"
            onChange={handleChange}
            value={formData.people}
            required
          />
          <div className="d-flex justify-content-center">
            <button
              className="btn btn-outline-0 btn-success border-dark m-1"
              type="submit"
              onClick={onSubmit}
            >
              Submit
            </button>
            <button
              className="btn btn-danger m-1"
              type="button"
              onClick={history.goBack}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}