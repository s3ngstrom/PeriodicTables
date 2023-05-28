import React, { useState, useEffect } from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import NotFound from "./NotFound";
import useQuery from "../utils/useQuery";
import { today } from "../utils/date-time";
import { listReservations, listTables } from "../utils/api";
import Dashboard from "../dashboard/Dashboard";
import NewReservation from "../reservations/NewReservation";
import NewTable from "../tables/NewTable";
import SeatReservation from "../reservations/SeatReservation";
import Search from "../search/Search";

/** defines all the routes for the application */
function Routes() {

  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]);
  const [tablesError, setTablesError] = useState(null);
  const [reservationsError, setReservationsError] = useState(null);
  const [edit] = useState(true);
  const query = useQuery();
  const date = query.get("date") ? query.get("date") : today();

  useEffect(loadDashboard, [date]);

  /** makes an api call to retrieve reservations & tables to display on dashboard */
  function loadDashboard() {
    const abortController = new AbortController();

    setReservationsError(null);
    setTablesError(null);

    /** uses provided listReservations() to retrieve all reservations for a given date on the dashboard */
    listReservations({ date: date }, abortController.signal)
      .then(setReservations)
      .catch(setReservationsError);

    /** uses listTables() to retrieve all tables with ids in numerical order on the dashboard */
    listTables(abortController.signal)
      .then((tables) =>
        tables.sort((tableA, tableB) => tableA.table_id - tableB.table_id)
      )
      .then(setTables)
      .catch(setTablesError);
    return () => abortController.abort();
  }

  return (
    <Switch>
      <Route exact={true} path="/">
        <Redirect to={`/dashboard`} />
      </Route>

      <Route exact={true} path="/reservations">
        <Redirect to={`/dashboard`} />
      </Route>

      <Route path="/reservations/new">
        <NewReservation loadDashboard={loadDashboard}  />
      </Route>

      <Route path="/reservations/:reservation_id/edit">
        <NewReservation loadDashboard={loadDashboard} edit={edit}  />
      </Route>

      <Route path="/reservations/:reservation_id/seat">
        <SeatReservation date={date} tables={tables} setTables={setTables} loadDashboard={loadDashboard} />
      </Route>

      <Route path="/tables/new">
        <NewTable loadDashboard={loadDashboard} />
      </Route>

      <Route path="/dashboard">
        <Dashboard
          date={date}
          reservations={reservations}
          reservationsError={reservationsError}
          tables={tables}
          tablesError={tablesError}
          loadDashboard={loadDashboard}
        />
      </Route>

      <Route path="/search">
        <Search />
      </Route>

      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

export default Routes;