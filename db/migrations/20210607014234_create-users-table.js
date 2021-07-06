exports.up = function (knex, Promise) {
  return knex.schema
    .createTable("users", (table) => {
      table.increments();
      table.string("name");
      table.string("email", 50);
      table.string("username", 24);
      table.integer("role");
      table.string("photo");
      table.text("description");
      table.string("sim", 20);
      table.string("salt");
      table.string("hash");
      table.timestamps(true, true);
    })
    .createTable("vehicles", (table) => {
      table.increments();
      table.string("name", 50);
      table.string("type", 20);
      table.string("brand", 20);
      table.integer("years", 5);
      table.string("photo");
      table.text("description");
      table.timestamps(true, true);
    })
    .createTable("services", (table) => {
      table.increments();
      table.integer("id_vehicle", 8);
      table.integer("id_user", 8);
      table.integer("start_km");
      table.integer("end_km");
      table.timestamp("start_at", { useTz: false });
      table.timestamp("end_at", { useTz: false });
      table.string("type");
      table.text("description");
      table.boolean("read");
      table.timestamps(true, true);
    })
    .createTable("service_details", (table) => {
      table.increments();
      table.integer("id_service", 8);
      table.integer("service_fee");
      table.string("service_part");
      table.text("description");
      table.timestamps(true, true);
    })
    .createTable("loan", (table) => {
      table.increments();
      table.integer("id_vehicle", 8);
      table.integer("id_user", 8);
      table.string("purpose");
      table.integer("start_km");
      table.integer("end_km");
      table.date("start_at");
      table.date("end_at");
      table.boolean("accidents");
      table.text("description");
      table.boolean("read");
      table.timestamps(true, true);
    })
    .createTable("loan_details", (table) => {
      table.increments();
      table.integer("id_loan", 8);
      table.integer("id_user", 8);
      table.text("description");
      table.timestamps(true, true);
    })
    .createTable("pickup", (table) => {
      table.increments();
      table.integer("id_vehicle", 8);
      table.string("route");
      table.integer("start_km");
      table.integer("end_km");
      table.timestamp("start_at", { useTz: false });
      table.timestamp("end_at", { useTz: false });
      table.boolean("accidents");
      table.text("description");
      table.boolean("ready");
      table.boolean("read");
      table.timestamps(true, true);
    })
    .createTable("pickup_details", (table) => {
      table.increments();
      table.integer("id_pickup");
      table.integer("id_user", 8);
      table.text("description");
      table.timestamps(true, true);
    });
};

exports.down = function (knex, Promise) {
  return knex.schema
    .dropTable("users")
    .dropTable("loan_details")
    .dropTable("pickup_details")
    .dropTable("service_details")
    .dropTable("loan")
    .dropTable("services")
    .dropTable("pickup")
    .dropTable("vehicles");
};
