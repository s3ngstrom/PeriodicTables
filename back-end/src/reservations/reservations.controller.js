const service = require("./reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const hasProperties = require("../utils/hasProperties");
const hasRequiredProperties = hasProperties(
  "first_name",
  "last_name",
  "mobile_number",
  "reservation_date",
  "reservation_time",
  "people"
);
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
  const { mobile_number } = req.query; 
  if (mobile_number) {
    const listing = await service.search(mobile_number);
    res.status(200).json({ data: listing });  } else {
    next();
  }
}

async function list(req, res, _next) {
  let { date } = req.query;
  !date ? (date = getTodaysDate()) : null; 
  const listing = await service.list(date);
  let filtered = listing.filter((eachRes) => eachRes.status !== "finished");
  console.log(date);
  res.json({ data: filtered });
}

// create a new reservation
async function create(req, res, next) {
  const reqStatus = req.body.data.status;
  if (reqStatus == "seated" || reqStatus == "finished") {
    next({ status: 400, message: `Status is ${reqStatus}` });
  }
  const data = await service.create(req.body.data);
  res.status(201).json({ data });
}

// check if reservation exists
async function reservationExists(req, res, next) {
  const { reservation_id } = req.params;
  const foundReservation = await service.read(reservation_id);
  if (!foundReservation) {
    return next({
      status: 404,
      message: `Reservation with id ${reservation_id} not found`,
    });
  }
  res.locals.foundReservation = foundReservation;
  next(); 
}

async function read(req, res, next) {
  const { reservation_id } = req.params;
  const foundReservation = await service.read(reservation_id);
  res.json({ data: foundReservation }); 
}

// checks if the status change requested is valid
function validateStatusChange(req, res, next) {
  const resStatus = res.locals.foundReservation.status;
  const updateStatus = req.body.data.status;
  if (resStatus == "finished") {
    next({
      status: 400,
      message: `${res.locals.foundReservation.reservation_id} has status: ${resStatus}`,
    });
  }
  if (updateStatus == "unknown") {
    next({ status: 400, message: `Cannot enter a status of ${updateStatus}` });
  }
  next();
}

async function updateStatus(req, res, next) {
  const updatedRes = {
    ...res.locals.foundReservation,
    status: req.body.data.status,
  };
  const updated = await service.update(updatedRes);
  res.status(200).json({ data: updated });
}

// ensure all reservation fields are valid
function validateReservationForUpdate(req, res, next) {
  const {
    first_name,
    last_name,
    people,
    reservation_date,
    reservation_time,
    mobile_number,
  } = req.body.data;
  let errorField;
  if (!first_name || first_name.length < 1) {
    errorField = "first_name";
  }
  if (!last_name || last_name.length < 1) {
    errorField = "last_name";
  }
  if (!mobile_number || mobile_number.length < 1) {
    errorField = "mobile_number";
  }
  if (!reservation_time) {
    errorField = "reservation_time";
  }
  if (!reservation_date) {
    errorField = "reservation_date";
  }
  if (people === 0) {
    errorField = "people";
  }
  if (errorField) {
    next({ status: 400, message: `${errorField} is invalid.` });
  }
  next();
}

async function update(req, res, next) {
  const { foundReservation } = res.locals;
  const updatedReservation = req.body.data;
  const updatedRes = {
    ...updatedReservation,
    reservation_id: foundReservation.reservation_id,
  };
  const updated = await service.update(updatedRes);
  res.status(200).json({ data: updated });
}

module.exports = {
  list: [asyncErrorBoundary(searchPhoneNum), asyncErrorBoundary(list)],
  create: [
    hasRequiredProperties,
    validateInputTypes,
    asyncErrorBoundary(create),
  ],
  read: [asyncErrorBoundary(reservationExists), asyncErrorBoundary(read)],
  updateStatus: [
    asyncErrorBoundary(reservationExists),
    validateStatusChange,
    asyncErrorBoundary(updateStatus),
  ],
  update: [
    asyncErrorBoundary(reservationExists),
    validateReservationForUpdate,
    validateInputTypes,
    asyncErrorBoundary(update),
  ],
};
