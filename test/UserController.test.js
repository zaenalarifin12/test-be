const request = require("supertest");
const app = require("../server");
const { knex } = require("../db/ConnectKnex");
const { faker } = require("@faker-js/faker");

const { formatDateInTimezone } = require("../utils/time");

describe("Users API", () => {
  afterAll(async () => {
    await knex.destroy();
  });

  describe("POST /users", () => {
    test("should create a new user", async () => {
      for (let i = 0; i < 100; i++) {
        let tempFirstName = faker.name.firstName();
        let tempLastName = faker.name.lastName();
        let tempBday =
          // faker.date
          "2000-04-14";
        // .between("1950-01-01", "2000-12-31")
        // .toISOString()
        // .slice(0, 10);
        let tempTimezone = faker.address.timeZone();

        const res = await request(app).post("/users").send({
          first_name: tempFirstName,
          last_name: tempLastName,
          birthday_date: tempBday,
          location: tempTimezone,
        });
        expect(res.statusCode).toEqual(201);
        expect(res.body.first_name).toEqual(tempFirstName);
        expect(res.body.last_name).toEqual(tempLastName);
        expect(formatDateInTimezone(res.body.birthday_date)).toEqual(tempBday);

        expect(res.body.location).toEqual(tempTimezone);
      }
    });
  });

  describe("GET /users", () => {
    test("should get all users", async () => {
      const res = await request(app).get("/users");
      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe("GET /users/:id", () => {
    test("should get a single user by ID", async () => {
      const [user] = await knex("users").select("*").limit(1);
      const res = await request(app).get(`/users/${user.id}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.first_name).toEqual(user.first_name);
      expect(res.body.last_name).toEqual(user.last_name);
      expect(formatDateInTimezone(res.body.birthday_date)).toEqual(
        formatDateInTimezone(user.birthday_date)
      );

      expect(res.body.location).toEqual(user.location);
    });

    test("should return 404 for non-existent user ID", async () => {
      const res = await request(app).get("/users/99999");
      expect(res.statusCode).toEqual(404);
    });
  });

  describe("PATCH /users/:id", () => {
    test("should update a user by ID", async () => {
      let tempFirstName = faker.name.firstName();
      let tempLastName = faker.name.lastName();
      let tempBday = faker.date
        .between("1950-01-01", "2000-12-31")
        .toISOString()
        .slice(0, 10);
      let tempTimezone = faker.address.timeZone();

      const [user] = await knex("users").select("*").limit(1);
      const res = await request(app).patch(`/users/${user.id}`).send({
        first_name: tempFirstName,
        last_name: tempLastName,
        birthday_date: tempBday,
        location: tempTimezone,
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body.first_name).toEqual(tempFirstName);
      expect(res.body.last_name).toEqual(tempLastName);
      expect(formatDateInTimezone(res.body.birthday_date)).toEqual(tempBday);

      expect(res.body.location).toEqual(tempTimezone);
    });

    test("should return 404 for non-existent user ID", async () => {
      const res = await request(app).patch("/users/99999").send({
        first_name: "Jane",
        last_name: "Doe",
        birthday_date: "1990-01-01",
        location: "Los Angeles",
      });
      expect(res.statusCode).toEqual(404);
    });
  });

  describe("DELETE /users/:id", () => {
    test("should delete a user by ID", async () => {
      const [user] = await knex("users").select("*").limit(1);
      const res = await request(app).delete(`/users/${user.id}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toEqual("User deleted successfully");
    });
    test("should return 404 for non-existent user ID", async () => {
      const res = await request(app).delete("/users/99999");
      expect(res.statusCode).toEqual(404);
    });
  });
});
