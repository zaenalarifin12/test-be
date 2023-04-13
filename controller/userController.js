const { knex } = require("../db/ConnectKnex");

const errorHandler = (res, error) => {
  console.error(error);
  res.status(500).json({ message: "Server error" });
};

const createUser = async (req, res) => {
  const { first_name, last_name, birthday_date, location } = req.body;
  try {
    const [user] = await knex("users")
      .insert({ first_name, last_name, birthday_date, location })
      .returning("*");
    res.status(201).json(user);
  } catch (err) {
    errorHandler(res, err);
  }
};

// Get all users
const getUsers = async (req, res) => {
  const { page = 1, pageSize = 10 } = req.query;
  try {
    const users = await knex("users")
      .select("*")
      .limit(pageSize)
      .offset((page - 1) * pageSize);
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get a single user by ID
const getDetailUser = async (req, res) => {
  const { id } = req.params;
  try {
    const [user] = await knex("users").where({ id }).select("*");
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    errorHandler(res, err);
  }
};

// Update a user by ID
const editUser = async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, birthday_date, location } = req.body;
  try {
    const [user] = await knex("users")
      .where({ id })
      .update({ first_name, last_name, birthday_date, location })
      .returning("*");
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    errorHandler(res, err);
  }
};

// Delete a user by ID
const deletUser = async (req, res) => {
  const { id } = req.params;
  try {
    const [user] = await knex("users").where({ id }).del().returning("*");
    if (user) {
      res.json({ message: "User deleted successfully" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    errorHandler(res, err);
  }
};

module.exports = {
  createUser,
  deletUser,
  editUser,
  getDetailUser,
  getUsers,
};
