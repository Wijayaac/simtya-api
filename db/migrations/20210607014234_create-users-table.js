exports.up = function (knex, Promise) {
  return knex.schema.createTable("users", (table) => {
    table.increments();
    table.string("username");
    table.string("salt");
    table.string("hash");
    table.integer("role");
    table.timestamps(true, true);
  });
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable("users");
};
