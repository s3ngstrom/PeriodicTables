import React from "react";
import { useHistory } from "react-router-dom";
import { previous, next, today } from "../utils/date-time";
import ListTables from "./ListTables";
import ListReservations from "./ListReservations";

// Dashboard component receives date, reservations, tables and loadDashboard as props
function Dashboard({ date, reservations, tables, loadDashboard }) {
  // useHistory hook handles navigation between pages
  const history = useHistory();

  // maps through the reservations and returns a JSX component for each reservation
  // filters reservations where status is not finished/cancelled
  const reservationsMap = () => {
    return reservations.map(
      (reservation) =>
        reservation.status !== "finished" &&
        reservation.status !== "cancelled" && (
          <ListReservations
            key={reservation.reservation_id}
            reservation={reservation}
            loadDashboard={loadDashboard}
          />
        )
    );
  };

  // maps through the tables and returns a JSX component for each table
  const tablesJSX = () => {
    return tables.map((table) => (
      <ListTables
        key={table.table_id}
        table={table}
        loadDashboard={loadDashboard}
      />
    ));
  };

  // handleClick function is called when the previous, today or next buttons are clicked
  // uses history to navigate to the dashboard page with the updated date
  function handleClick({ target }) {
    let newDate;
    let useDate;

    // previous(): sets the reservations' list date to the previous day
    // next(): to set the reservations' list date to the following day
    // today(): to set reservation's list date to the current day
    if (!date) {
      useDate = today();
    } else {
      useDate = date;
    }

    if (target.name === "previous") {
      newDate = previous(useDate);
    } else if (target.name === "next") {
      newDate = next(useDate);
    } else {
      newDate = today();
    }

    history.push(`/dashboard?date=${newDate}`);
  }
  // the JSX returned by the Dashboard component contains the UI for the restaurant dashboard
  // it includes a header, 3 buttons for navigating between days, and tables for reservations and tables
  return (
    <div className="w-80 ml-3 pr-4 pt-4" style={{ fontFamily: "Rubik" }}>
      <main>
        <h1 className="font-weight-bold d-flex justify-content-center mt-5 mb-4">
          Restaurant Dashboard
        </h1>

        <div className="d-flex justify-content-center mb-4">
          <button
            className="btn-xs rounded btn-light btn-outline-dark m-1 p-1"
            type="button"
            name="previous"
            onClick={handleClick}
          >
            Previous
          </button>
          <button
            className="btn-xs rounded btn-success btn-outline-success m-1 text-white"
            type="button"
            name="today"
            onClick={handleClick}
          >
            Today
          </button>
          <button
            className="btn-xs rounded btn-light btn-outline-dark m-1"
            type="button"
            name="next"
            onClick={handleClick}
          >
            Next
          </button>
        </div>
        <h3 className="mb-4 font-weight-bold text-start">
          Reservations for {date}
        </h3>

        <table className="table text-wrap text-center table-hover">
          <thead className="thead-dark">
            <tr className="text-center">
              <th scope="col">ID</th>
              <th scope="col">First Name</th>
              <th scope="col">Last Name</th>
              <th scope="col">Mobile Number</th>
              <th scope="col">Date</th>
              <th scope="col">Time</th>
              <th scope="col">People</th>
              <th scope="col">Status</th>
              <th scope="col">Edit</th>
              <th scope="col">Cancel</th>
              <th scope="col">Seat</th>
            </tr>
          </thead>

          <tbody>{reservationsMap()}</tbody>
        </table>
        <br />
        <br />
        <h3 className="mb-4 font-weight-bold">Tables</h3>

        <table className="table table-hover m-1 text-nowrap mb-4">
          <thead className="thead-dark">
            <tr className="text-center">
              <th scope="col">Table ID</th>
              <th scope="col">Table Name</th>
              <th scope="col">Capacity</th>
              <th scope="col">Status</th>
              {/* <th scope="col">Reservation ID</th> */}
              <th scope="col">Finish</th>
            </tr>
          </thead>

          <tbody>{tablesJSX()}</tbody>
        </table>
      </main>
    </div>
  );
}

export default Dashboard;
