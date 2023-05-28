// Import knex connection
const knex = require("../db/connection");

// Function to list all reservations for a specific date
function list(date) {
  // Use knex to query the "reservations" table and select all columns
  // Filter the results to only show those with the specified reservation date
  // Order the results by reservation time
  return knex("reservations")
    .select("*")
    .where({ reservation_date: date })
    .orderBy("reservation_time");
}

// Function to create a new reservation
function create(reservation) {
  // Use knex to insert the reservation object into the "reservations" table
  // Return the newly inserted reservation
  // The returned value is an array, so access the first item to get the reservation object
  return knex("reservations")
    .insert(reservation)
    .returning("*")
    .then((newReservation) => newReservation[0]);
}

// Function to read a single reservation by its id
function read(reservationId) {
  // Use knex to query the "reservations" table and select all columns
  // Filter the results to only show the reservation with the specified reservation id
  // Access the first item in the result set to get the reservation object
  return knex("reservations")
    .select("*")
    .where({ reservation_id: reservationId })
    .first();
}

// Function to update a reservation
function update(updatedRes) {
  // Use knex to query the "reservations" table and select all columns
  // Filter the results to only show the reservation with the specified reservation id
  // Update the reservation with the updated data
  // Return the updated reservation
  // The returned value is an array, so access the first item to get the reservation object
  return knex("reservations")
    .select("*")
    .where({ reservation_id: updatedRes.reservation_id })
    .update(updatedRes, "*")
    .then((updated) => updated[0]);
}

// Function to search for reservations by mobile number
function search(mobile_number) {
  // Use knex to query the "reservations" table
  // Filter the results to only show reservations whose mobile_number contains the search term
  // Replace all non-digit characters in the search term with an empty string
  // Order the results by reservation date
  return knex("reservations")
    .whereRaw("translate(mobile_number, '() -', '') like ?",
      `%${mobile_number.replace(/\D/g, "")}%` )
    .orderBy("reservation_date");
}

// Export the functions
module.exports = {
  list,
  create,
  read,
  update,
  search,
};
