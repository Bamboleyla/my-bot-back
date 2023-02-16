import express from "express";
import corse from "cors";
import config from "config";
import cookieParser from "cookie-parser";
import errorMiddleware from "./src/middlewares/error-middleware";
import router from "./src/routes/routes";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(corse());
app.use("/api", router);
app.use(errorMiddleware);

const PORT = config.get("port");
const start = async () => {
  try {
    app.listen(PORT, () => console.log(`Server started on PORT: ${PORT}`));
  } catch (error) {
    console.error(error);
  }
};
start();
