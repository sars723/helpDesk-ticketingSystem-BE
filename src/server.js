import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import userRouter from "./services/users/index.js";
import ticketRouter from "./services/tickets/index.js";
const server = express();

const port = process.env.PORT || 3004;

server.use(cors());
server.use(express.json());

server.use("/users", userRouter);
server.use("/tickets", ticketRouter);

mongoose.connect(process.env.MONGO_URL);

mongoose.connection.on("connected", () => {
  console.log("Mongo connected");
  server.listen(port, async () => {
    console.log("Server running on port", port);
  });
});
