import React from "react";
import { finishTable } from "../utils/api";

export default function ListTables({ table, reservation_id, loadDashboard }) {
  if (!table) return null;
  console.log(table);

  // handles Finish button when a table is finished - requires user confirmation
  function handleFinish() {
    if (
      window.confirm(
        "Is this table ready to seat new guests? This cannot be undone."
      )
    ) {
      const abortController = new AbortController();
      console.log(table.table_id);
      finishTable(table.table_id, reservation_id, abortController.signal).then(
        loadDashboard
      );
      return () => abortController.abort();
    }
  }

// displays list of tables
  return (
    <tr className="text-center">
      <th scope="row">{table.table_id}</th>
      <td>{table.table_name}</td>
      <td>{table.capacity}</td>
      <td data-table-id-status={table.table_id}>
        {table.reservation_id ? "occupied" : "free"}
      </td>
      <td>
        {table.reservation_id ? (
          <button
            className="btn btn-sm btn-danger"
            data-table-id-finish={table.table_id}
            onClick={handleFinish}
            type="button"
          >
            Finish
          </button>
        ) : (
          "--"
        )}
      </td>
    </tr>
  );
}
