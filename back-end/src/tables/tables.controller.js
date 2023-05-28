const service = require("./tables.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const hasProperties = require("../utils/hasProperties");
const hasRequiredProperties = hasProperties("table_name", "capacity");
const validTable = require("../utils/validateTable");
const validateTable = validTable();
const tableHasProperties = hasProperties("reservation_id")
const tableUpdate = require("../utils/tableUpdate");
const validateTableInfo = tableUpdate();
const {update: updateRes, read: readRes } = require("../reservations/reservations.service");


async function list(req, res, next) {
    const tablesList = await service.list();
    res.json({ data: tablesList});
}


// `tableExists` middleware function to check if the table exists
async function tableExists(req, res, next) {
    // Read the table from the `service`
    const table = await service.read(req.params.table_id);
    // If the table exists, store it in the `res.locals` object and call the next middleware function
    if (table) {
        res.locals.foundTable = table;
        return next();
    } 
    // If the table doesn't exist, call the `next` function with an error object
    next({ status: 404, message: `Table with id: ${req.params.table_id} not found.` });
}

// `read` middleware function to return the details of the table
async function read(req, res, next) {
    // Read the table from the `service`
    const table = await service.read(req.params.table_id);

    // Return the details of the table as a JSON response
    res.json({ data: table });
}

// `create` middleware function to create a new table
async function create(req, res, next) {
    // Create a new table using the `data` from the request body
    const data = await service.create(req.body.data);

    // Return the details of the newly created table as a JSON response
    res.status(201).json({ data });
}

// `update` middleware function to update an existing table
async function update(req, res, next) {
    // Get the found table and reservation from the `res.locals` object
    const { foundTable } = res.locals;
    const { thisReservation } = res.locals;
    // Update the details of the table
    const updatedTable = {
        reservation_id: thisReservation.reservation_id,
        table_id: res.locals.foundTable.table_id,
    };
    // Update the table in the `service`
    const updated = await service.update(updatedTable);
    // If the status of the reservation is `seated`, return an error
    if(foundTable.reservation_id){
        next({ status: 400, message: `Table is occupied` }) 
    }
    if (thisReservation.status == 'seated') {
        next({ status: 400, message: `Reservation is ${thisReservation.status}.` });
    }
    // Update the status of the reservation to `seated`
    await updateRes({
        ...thisReservation,
        status: 'seated'
    });
    // Return the updated details of the table as a JSON response
    res.status(200).json({ data: updated });
}

// `destroy` middleware function to delete an existing table
// async function destroy(req, res, next) {
//     // Get the found table from the `res.locals` object
//     const { foundTable } = res.locals;
//     // If the table's status is "free", return an error
//     if (!foundTable.reservation_id) {
//         next({ status: 400, message: 'Table is not occupied.' });
//     }
//      // Delete the table from the service
//      await service.delete(foundTable.table_id);
//      // Fetch the reservation associated with the deleted table
//      const foundRes = await readRes(foundTable.reservation_id);
//      // Update the reservation with a new status of 'finished'
//      await updateRes({
//          ...foundRes,
//          status: 'finished'
//      })
//      await service.list()
//      // Return a 200 status to indicate success
//      res.sendStatus(200);
//     }

async function destroy(req, res, next) {
    const { foundTable } = res.locals;

    foundTable.reservation_id === null ? next({ status: 400, message: 'Table is not occupied.'}) : await service.delete(foundTable.table_id);

    const foundReservation = await readRes(foundTable.reservation_id);
 

    const updatedRes = await updateRes({
        ...foundReservation,
        status: 'finished',
    });

    await service.list();

    res.status(200).json({data: updatedRes});
}

    module.exports = {
        list: [asyncErrorBoundary(list)],
        create: [hasRequiredProperties, validateTable, asyncErrorBoundary(create)],
        read: [asyncErrorBoundary(tableExists), asyncErrorBoundary(read)],
        update: [asyncErrorBoundary(tableExists), tableHasProperties, asyncErrorBoundary(validateTableInfo), asyncErrorBoundary(update)],
        delete: [asyncErrorBoundary(tableExists), asyncErrorBoundary(destroy)]
    }
    