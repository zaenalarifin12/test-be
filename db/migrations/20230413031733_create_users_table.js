exports.up = function (knex) {
    return knex.schema.createTable('users', function (table) {
      table.increments('id');
      table.string('first_name').notNullable();
      table.string('last_name').notNullable();
      table.date('birthday_date').notNullable();
      table.string('location').notNullable();
      table.timestamps(true, true);
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.dropTable('users');
  };
  