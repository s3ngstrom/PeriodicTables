import React from "react";
import { Link } from "react-router-dom";
import { updateReservationStatus } from "../utils/api";

export default function ListReservations({ reservation, loadDashboard }) {
  if (!reservation || reservation.status === "finished") return null;

  /** handles if the user wants to cancel a reservation*/
  function handleCancel() {
    /** updates reservation status if user confirms */
    if (
      window.confirm(
        "Do you want to cancel this reservation? This cannot be undone."
      )
    ) {
      const abortController = new AbortController();
      const reservationToCancel = reservation.reservation_id;

      updateReservationStatus(
        reservationToCancel,
        "cancelled",
        abortController.status
      ).then(loadDashboard);

      return () => abortController.abort();
    }
  }

  /** displays a list of reservations for the given day */
  return (
    <tr style={{ fontFamily: "Rubik" }}>
      <th scope="row">{reservation.reservation_id}</th>
      <td className="text-center">{reservation.first_name}</td>
      <td className="text-center">{reservation.last_name}</td>
      <td className="text-center">{reservation.mobile_number}</td>
      <td className="text-center">
        {reservation.reservation_date.substr(0, 10)}
      </td>
      <td className="text-center">
        {reservation.reservation_time.substr(0, 5)}
      </td>
      <td className="text-center">{reservation.people}</td>
      <td
        className="text-center"
        data-reservation-id-status={reservation.reservation_id}
      >
        {reservation.status}
      </td>

      {reservation.status === "booked" && (
        <>
          <td className="text-center">
            <Link to={`/reservations/${reservation.reservation_id}/edit`}>
              <button className="btn btn-sm btn-primary" type="button">
                Edit
              </button>
            </Link>
          </td>

          <td className="text-center">
            <button
              className="btn btn-sm btn-danger"
              type="button"
              onClick={handleCancel}
              data-reservation-id-cancel={reservation.reservation_id}
            >
              Cancel
            </button>
          </td>

          <td className="text-center">
            <a href={`/reservations/${reservation.reservation_id}/seat`}>
              <button className="btn btn-sm btn-success" type="button">
                Seat
              </button>
            </a>
          </td>
        </>
      )}
    </tr>
  );
}