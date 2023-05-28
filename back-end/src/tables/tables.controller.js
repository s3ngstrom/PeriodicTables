const service = require("./tables.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const hasProperties = require("../utils/hasProperties");
const hasRequiredProperties = hasProperties("table_name", "capacity");
const validTable = require("../utils/validateTable");
const validateTable = validTable();
const tableHasProperties = hasProperties("reservation_id");
const tableUpdate = require("../utils/tableUpdate");
const validateTableInfo = tableUpdate();
const {
  update: updateRes,
  read: readRes,
} = require("../reservations/reservations.service");

async function list(req, res, next) {
  const tablesList = await service.list();
  res.json({ data: tablesList });
}

// check if the table exists
async function tableExists(req, res, next) {
  const table = await service.read(req.params.table_id);
  if (table) {
    res.locals.foundTable = table;
    return next();
  }
  next({
    status: 404,
    message: `Table with id: ${req.params.table_id} not found.`,
  });
}

// return the details of the table
async function read(req, res, next) {
  const table = await service.read(req.params.table_id);
  res.json({ data: table });
}

// create a new table
async function create(req, res, next) {
  const data = await service.create(req.body.data);
  res.status(201).json({ data });
}

// update an existing table
async function update(req, res, next) {
  const { foundTable } = res.locals;
  const { thisReservation } = res.locals;
  const updatedTable = {
    reservation_id: thisReservation.reservation_id,
    table_id: res.locals.foundTable.table_id,
  };
  const updated = await service.update(updatedTable);
  if (foundTable.reservation_id) {
    next({ status: 400, message: `Table is occupied` });
  }
  if (thisReservation.status == "seated") {
    next({ status: 400, message: `Reservation is ${thisReservation.status}.` });
  }
  await updateRes({
    ...thisReservation,
    status: "seated",
  });
  res.status(200).json({ data: updated });
}

async function destroy(req, res, next) {
  const { foundTable } = res.locals;

  foundTable.reservation_id === null
    ? next({ status: 400, message: "Table is not occupied." })
    : await service.delete(foundTable.table_id);

  const foundReservation = await readRes(foundTable.reservation_id);

  const updatedRes = await updateRes({
    ...foundReservation,
    status: "finished",
  });

  await service.list();

  res.status(200).json({ data: updatedRes });
}

module.exports = {
  list: [asyncErrorBoundary(list)],
  create: [hasRequiredProperties, validateTable, asyncErrorBoundary(create)],
  read: [asyncErrorBoundary(tableExists), asyncErrorBoundary(read)],
  update: [
    asyncErrorBoundary(tableExists),
    tableHasProperties,
    asyncErrorBoundary(validateTableInfo),
    asyncErrorBoundary(update),
  ],
  delete: [asyncErrorBoundary(tableExists), asyncErrorBoundary(destroy)],
};
