import React, { useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import {
  readReservation,
  listTables,
  updateTable,
  listReservations,
} from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";

/**
 * Defines the reservation/:reservation_id/seat page.
 * Makes an API call to seat a reservation and update the seated table
 * @returns {JSX.Element}
 * Header and seat form
 */

function SeatReservation({ tables, setTables }) {
  const { reservation_id } = useParams();
  const history = useHistory();
  const [tableId, setTableId] = useState("");
  const [currentReservation, setCurrentReservation] = useState();
  const [selectedTable, setSelectedTable] = useState("");

  const [error, setError] = useState(null);

  // fetch list of tables and set state
  useEffect(() => {
    const abortController = new AbortController();
    listTables(abortController.signal).then(setTables).catch(setError);
    return () => abortController.abort();
  }, [setTables]);

  // fetch reservation information
  useEffect(() => {
    const abortController = new AbortController();
    listReservations().then(setCurrentReservation);
    readReservation(reservation_id, abortController.signal).catch(setError);
    return () => abortController.abort();
  }, [reservation_id]);

  // handler to update selected table
  function changeHandler({ target: { value } }) {
    checkData(currentReservation, selectedTable);
    setTableId(value);
  }

  function checkData(currentReservation, selectedTable) {
    const { capacity, reservation_id } = selectedTable;
    const { people } = currentReservation;
    console.log("Check Data", people, capacity, reservation_id);
    if (reservation_id) {
      setError("Table is occupied");
    }
    if (people > capacity) {
      setError("Table is too small.");
    }
  }

  // handler to submit seat form
  const handleSubmit = async (event) => {
    event.preventDefault();
    const abortController = new AbortController();
    console.log("INSIDE HANDLESUBMIT", tableId, reservation_id);
    try {
      await updateTable(tableId, reservation_id, abortController.signal);
      history.push(`/dashboard?date=${currentReservation.reservation_date}`);
      console.log("HANDLE SUBMIT HERE<--------");
    } catch (error) {
      console.log(error);
      setError(error);
    }
    return abortController.abort();
  };

  // return to previous page
  const handleCancel = (event) => {
    event.preventDefault();
    history.goBack();
  };

  const tableOptions = tables.map((table) => (
    <option key={table.table_id} value={table.table_id}>
      {`${table.table_name} - ${table.capacity}`}
    </option>
  ));

  return (
    <div>
      <h1 className="text-center my-4">Seat Reservation #{reservation_id}</h1>
      {error && <ErrorAlert error={error} />}
      <form onSubmit={handleSubmit}>
        <div className="form-row justify-content-center">
          <div className="form-group col-4">
            <label htmlFor="seat_reservation"></label>
            <select
              id="table_id"
              name="table_id"
              onChange={changeHandler}
              required
              className="form-control"
            >
              <option value="">Select a table</option>
              {tableOptions}
            </select>
          </div>
        </div>

        <div className="row justify-content-md-center">
          <button className="btn btn-success m-1" type="submit">
            Submit
          </button>
          <button
            className="btn btn-danger m-1"
            type="button"
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default SeatReservation;
