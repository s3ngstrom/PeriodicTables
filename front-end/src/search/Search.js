import React, { useState } from "react";
import ErrorAlert from "../layout/ErrorAlert";
import { listReservations } from "../utils/api";
import ListReservations from "../dashboard/ListReservations";

/**
 * Search component allows the user to search for a specific reservation
 * by entering in a phone number into the search field and display all
 * reservation(s) under the give phone number
 */
export default function Search() {
  const [mobileNumber, setMobileNumber] = useState("");
  const [reservations, setReservations] = useState([]);
  const [error, setError] = useState(null);

  /**
   * updates the state of mobileNumber when the user makes any changes to it
   */
  function handleChange({ target }) {
    setMobileNumber(target.value);
  }

  /** makes a get request to list all reservations under the given mobileNumber when the "submit" button is clicked */
  function handleSubmit(event) {
    event.preventDefault();
    const abortController = new AbortController();
    setError(null);

    listReservations({ mobile_number: mobileNumber }, abortController.signal)
      .then(setReservations)
      .catch(setError);

    return () => abortController.abort();
  }

  /** returns all reservation(s), if any */
  const searchResultsJSX = () => {
    return reservations.length > 0 ? (
      reservations.map((reservation) => (
        <ListReservations
          key={reservation.reservation_id}
          reservation={reservation}
        />
      ))
    ) : (
      <tr>
        <td>No reservations found</td>
      </tr>
    );
  };

  return (
    <div className="w-80 ml-2 pr-4 mr-4 pt-4" style={{ fontFamily: "Rubik" }}>
      <h1 className="font-weight-bold d-flex justify-content-center mt-4 mb-4 pb-4">
        Search
      </h1>
      <form>
        {error && <ErrorAlert error={error} />}
        <div className="input-group w-50">
          <input
            className="form-control mr-2 border-dark rounded"
            name="mobile_number"
            id="mobile_number"
            type="tel"
            placeholder="Enter a customer's phone number"
            onChange={handleChange}
            value={FormData.mobile_number}
            required
          />
          <button
            className="btn-xs btn-outline-0 btn-primary rounded px-2 pb-1"
            type="submit"
            onClick={handleSubmit}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              class="bi bi-search"
              viewBox="0 0 16 16"
            >
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
            </svg>
          </button>
        </div>
      </form>

      <table className="table table-hover mt-4">
        <thead className="thead-dark">
          <tr className="text-center">
            <th scope="col">ID</th>
            <th scope="col text-center">First Name</th>
            <th scope="col text-center">Last Name</th>
            <th scope="col text-center">Mobile Number</th>
            <th scope="col">Date</th>
            <th scope="col">Time</th>
            <th scope="col">People</th>
            <th scope="col">Status</th>
            <th scope="col">Edit</th>
            <th scope="col">Cancel</th>
            <th scope="col">Seat</th>
          </tr>
        </thead>

        <tbody>{searchResultsJSX()}</tbody>
      </table>
    </div>
  );
}