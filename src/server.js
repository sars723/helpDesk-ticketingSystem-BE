import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import userRouter from "./services/users/index.js";
import ticketRouter from "./services/tickets/index.js";
const server = express();

const port = process.env.PORT || 3004;

const whiteList = [process.env.FE_DEV_URL, process.env.FE_PROD_URL];

const corsOpts = {
  origin: function (origin, next) {
    console.log("ORIGIN --> ", origin);
    if (!origin || whiteList.indexOf(origin) !== -1) {
      // if received origin is in the whitelist I'm going to allow that request
      next(null, true);
    } else {
      // if it is not, I'm going to reject that request
      next(new Error(`Origin ${origin} not allowed!`));
    }
  },
};

server.use(cors(corsOpts));
server.use(express.json({ limit: "50mb" }));

server.use("/users", userRouter);
server.use("/tickets", ticketRouter);

mongoose.connect(process.env.MONGO_URL);

mongoose.connection.on("connected", () => {
  console.log("Mongo connected");
  server.listen(port, async () => {
    console.log("Server running on port", port);
  });
});
