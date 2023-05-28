const knex = require("../db/connection");

// This function returns a list of tables from the 'tables' table in the database
// The list is ordered by 'table_name' and grouped by 'table_id'
// The selected columns are 'table_name' and 'status'
function list(){
    return knex("tables")
        .select("table_name","capacity","table_id","reservation_id")
        .orderBy("table_name")
        .groupBy("table_id")  
}

// This function inserts a table into the 'tables' table in the database
// It returns the newly created table
function create(table) {
    return knex("tables")
        .insert(table)
        .returning("*")
        .then((newTable) => newTable[0])
}

// This function retrieves a table from the 'tables' table in the database based on the provided 'tableId'
// It returns the first table that matches the conditions
function read(tableId) {
    return knex("tables")
        .where({ table_id:tableId })
        .first()
}

// This function updates a table in the 'tables' table in the database based on the provided 'updatedTable' object
// It returns the updated table
function update(updatedTable) {
    return knex("tables")
        .select("*")
        .where({ table_id: updatedTable.table_id })
        .update(updatedTable, "*")
        .then((updated) => updated[0])
}

// This function deletes a table from the 'tables' table in the database based on the provided 'tableId'
// function destroy(tableId) {
//     return knex("tables")
//         .where({ table_id: tableId })
//         .del()
// }

function destroy(tableId) {
    return knex("tables")
        .select("*")
        .where({ table_id: tableId })
        .update({reservation_id: null})
        .then((updated) => updated[0])
}

// Exporting the functions as an object
module.exports = {
    list,
    create,
    read,
    update,
    delete: destroy,
}
