const service = require("./reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const hasProperties = require("../utils/hasProperties");
const hasRequiredProperties = hasProperties("first_name", "last_name", "mobile_number", "reservation_date", "reservation_time", "people");
const validateTypes = require("../utils/validateReservation");
const validateInputTypes = validateTypes();

function getTodaysDate() {
  const todayDate = new Date(Date.now());
  const year = todayDate.getFullYear();
  const month = todayDate.getMonth() + 1;
  const day = todayDate.getDate();
  const formattedDate = `${year}-${month}-${day}`;
  return formattedDate;
}

async function searchPhoneNum(req, res, next) {
  const { mobile_number } = req.query; //searches for a reservation based on the mobile_number query parameter in the request

  if(mobile_number){
    const listing = await service.search(mobile_number);
    res.status(200).json({ data: listing })// If the mobile_number is present, it calls the search method of the service module to retrieve the reservation and returns it as a JSON response with a status of 200.
  } else {
    next();// If the mobile_number is not present, it calls the next function to proceed to the next middleware.
  }
}

async function list(req, res, _next) {
  let { date }  = req.query;//It lists all reservations based on a date query parameter in the request.
  !date ? (date = getTodaysDate()) : null;// If the date parameter is not present, it calls formatDate to get the current date, then it calls the list method of the service module to retrieve the reservations

  const listing = await service.list(date)
  let filtered = listing.filter((eachRes) => 
    eachRes.status !== 'finished'
  )// It filters the reservations to exclude those with a status of 'finished' and returns the filtered list as a JSON response.
  console.log(date)
  res.json({ data: filtered})
}

// Function to create a new reservation
async function create(req, res, next) {
  // Check if the status in the request body is either 'seated' or 'finished'
  const reqStatus = req.body.data.status;
  if (reqStatus == 'seated' || reqStatus == 'finished') {
    // If the status is either 'seated' or 'finished', return an error with a status code of 400 and a message indicating that the status is not valid
    next({ status: 400, message: `Status is ${reqStatus}`})
  }
  // Call the create method of the service module with the data from the request body
  const data = await service.create(req.body.data);
  // Return the newly created reservation as a JSON response with a status of 201
  res.status(201).json({ data });
}

async function reservationExists(req, res, next){
  const { reservation_id } = req.params;//This middleware checks if the reservation with the 
  //reservation_id specified in the request params exists
  const foundReservation = await service.read(reservation_id);
  if(!foundReservation){
    return next({ status:404, message:`Reservation with id ${reservation_id} not found`})
  }//calls the next function with an error object that has a status of 404 and a message indicating that the reservation was not found
  res.locals.foundReservation = foundReservation;
  next();// If it does exist, it saves it to res.locals.foundReservation and calls the next function to proceed to the next middleware.
}

async function read(req, res, next) {
  const { reservation_id } = req.params;
  const foundReservation = await service.read(reservation_id);
  res.json({ data: foundReservation });// It reads a reservation by calling the read method of the service module with the reservation_id specified in the request params. It returns the reservation as a JSON response.
}

// validateStatusChange is a middleware function that checks if the status change requested by the user is valid.
function validateStatusChange(req, res, next) {
  // Get the current status of the reservation
  const resStatus = res.locals.foundReservation.status;
  // Get the status the user wants to update to
  const updateStatus = req.body.data.status;

  // If the current status of the reservation is 'finished', return an error with a message.
  if(resStatus == 'finished'){
    next({ status: 400, message:`${res.locals.foundReservation.reservation_id} has status: ${resStatus}`})
  }
  // If the status the user wants to update to is 'unknown', return an error with a message.
  if(updateStatus == 'unknown') {
    next({ status: 400, message: `Cannot enter a status of ${updateStatus}`})
  }
  // If the status change is valid, call the next middleware.
  next();
}

async function updateStatus(req, res, next) {
  // Destructure the foundReservation and status from the request body data.
  const updatedRes = {
    ...res.locals.foundReservation,
    status: req.body.data.status,
  }
  // Call the update function from the service to update the reservation status in the database.
  const updated = await service.update(updatedRes);
  // Return a JSON response with a 200 status and the updated reservation object.
  res.status(200).json({ data: updated })
}

function validateReservationForUpdate(req, res, next) {
  const {first_name, last_name, people, reservation_date, reservation_time, mobile_number } = req.body.data;
  let errorField;
  // checking if the first name field is present and has a length of at least 1
  if(!first_name || first_name.length < 1){
    errorField = 'first_name'
  }
  // checking if the last name field is present and has a length of at least 1
  if(!last_name || last_name.length < 1) {
    errorField = 'last_name'
  }
  // checking if the mobile number field is present and has a length of at least 1
  if(!mobile_number || mobile_number.length < 1){
    errorField = 'mobile_number'
  }
  // checking if the reservation time field is present
  if(!reservation_time){
    errorField = 'reservation_time'
  }
  // checking if the reservation date field is present
  if(!reservation_date) {
    errorField = 'reservation_date'
  }
  // checking if the number of people is not equal to 0
  if(people === 0) {
    errorField = 'people'
  }
  // if any of the above checks fail, a next() call is made with an error object having a status code of 400 and a message
  if(errorField){
    next({status:400, message:`${errorField} is invalid.`})
  }
  // if all the checks pass, the next middleware is called
  next();
}


async function update(req, res, next) {
  // Extract the found reservation from the response locals
  const { foundReservation } = res.locals;
  // Get the updated reservation data from the request body
  const updatedReservation = req.body.data;
  // Create an object with the updated data and the reservation id
  const updatedRes = {
    ...updatedReservation,
    reservation_id: foundReservation.reservation_id
  };
  // Call the service function to update the reservation
  const updated = await service.update(updatedRes);
  // Return a successful response with the updated reservation data
  res.status(200).json({ data: updated });
}

module.exports = update;


module.exports = {
  list: [asyncErrorBoundary(searchPhoneNum), asyncErrorBoundary(list)],
  create: [hasRequiredProperties, validateInputTypes, asyncErrorBoundary(create)],
  read: [asyncErrorBoundary(reservationExists), asyncErrorBoundary(read)],
  updateStatus: [asyncErrorBoundary(reservationExists), validateStatusChange, asyncErrorBoundary(updateStatus)],
  update: [asyncErrorBoundary(reservationExists), validateReservationForUpdate, validateInputTypes, asyncErrorBoundary(update)]
};