import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import ErrorAlert from "../layout/ErrorAlert";
import { createTable } from "../utils/api";

// NewTable component to create new table
export default function NewTable({ loadDashboard }) {
  // useHistory hook to redirect to previous page on cancel
  const history = useHistory();

  // error state to store any error message
  const [error, setError] = useState(null);
  /** 
   * formData state to store the form data,
   * initially the table name and capacity are empty and set to 1
   */
  const [formData, setFormData] = useState({
    table_name: "",
    capacity: "",
  });

  // handleChange function to update the form data when inputs change
  function handleChange({ target }) {
    setFormData({
      ...formData,
      [target.name]:
        target.name === "capacity" ? Number(target.value) : target.value,
    });
  }

  // handleSubmit function to submit the form data and create a new table
  function handleSubmit(event) {
    // prevent default form submission
    event.preventDefault();
    const abortController = new AbortController();

    // validate form fields before creating the table
    if (validateFields()) {
      // call createTable API to create the table
      createTable(formData, abortController.signal)
        .then(loadDashboard)
        .then(() => history.push(`/dashboard`))
        .catch(setError);
    }

    // return the abort controller for cleaning up the API request
    return () => abortController.abort();
  }

  // validateFields function to validate the form data before submission
  function validateFields() {
    let foundError = null;

    // check if table name and capacity fields are not empty
    if (formData.table_name === "" || formData.capacity === "") {
      foundError = {
        message:
          "invalid form: table name & capacity must be provided to create table",
      };
    } else if (formData.table_name.length < 2) {
      // check if table name is at least 2 characters long
      foundError = {
        message:
          "invalid table name: table name must contain at least two characters",
      };
    }

    // set the error state
    setError(foundError);
    // return true if no error found, false otherwise
    return foundError === null;
  }

  return (
    // render the form to create a new table
    <div style={{fontFamily: "Rubik"}}>
      <h2 className="font-weight-bold d-flex justify-content-center mt-4">
        New Table
      </h2>
      <div className="d-flex justify-content-center mt-4">
        <form className="font-weight-bold mt-2 w-75">
          {/* display the error message if there is any */}
          { error && <ErrorAlert error={error} />}

          {/* table name input */}
          <label htmlFor="table_name">Table Name</label>
          <input
            name="table_name"
            id="table_name"
            className="form-control mb-3 border-dark"
            type="text"
            minLength="2"
            onChange={handleChange}
            value={formData.table_name}
            required
          />

          <label htmlFor="capacity">Capacity</label>
          <input
            name="capacity"
            id="capacity"
            className="form-control mb-3 border-dark"
            type="number"
            min="1"
            onChange={handleChange}
            value={formData.capacity}
            required
            style={{color: "black"}}
          />

  <div className="d-flex justify-content-center mt-4">
  <button
            type="submit"
            onClick={handleSubmit}
            className="btn btn-dark border-dark m-1"
            style={{ color: "white" }}
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