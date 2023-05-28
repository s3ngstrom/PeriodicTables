const knex = require("../db/connection");

// returns a list of tables from the 'tables' table
function list() {
  return knex("tables")
    .select("table_name", "capacity", "table_id", "reservation_id")
    .orderBy("table_name")
    .groupBy("table_id");
}

// inserts a table into the 'tables' table
function create(table) {
  return knex("tables")
    .insert(table)
    .returning("*")
    .then((newTable) => newTable[0]);
}

// retrieves a table from the 'tables' table using 'tableId'
function read(tableId) {
  return knex("tables").where({ table_id: tableId }).first();
}

// updates a table in the 'tables' table using 'updatedTable'
function update(updatedTable) {
  return knex("tables")
    .select("*")
    .where({ table_id: updatedTable.table_id })
    .update(updatedTable, "*")
    .then((updated) => updated[0]);
}

function destroy(tableId) {
  return knex("tables")
    .select("*")
    .where({ table_id: tableId })
    .update({ reservation_id: null })
    .then((updated) => updated[0]);
}

module.exports = {
  list,
  create,
  read,
  update,
  delete: destroy,
};
