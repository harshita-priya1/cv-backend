const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");

const userRouter = require("./routes/user.router");
const taskRouter = require("./routes/task.router");
const connectToDb = require("./models/db");

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

connectToDb();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/user", userRouter);
app.use("/tasks", taskRouter);

app.get("/", (req, res) => {
  res.send("Hello");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}...`);
});
