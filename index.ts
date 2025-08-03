import express, {Request, Response} from "express";
import connectToDatabase from "./config/moongoConnect";
import authRouter from "./routers/authRouter"
import friendRouter from "./routers/friendRouter"

require('dotenv').config();

const app = express();
const PORT = process.env.PORT;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/api", authRouter);
app.use("/api", friendRouter);

app.get("/", function (req:Request, res:Response) {
	console.log(`Working.......`);
	res.json({
		message: "API Response Successfully.",
	});
});
app.listen(PORT, async () => {
  await connectToDatabase();
  console.log(`Server is running at http://localhost:${PORT}`);
});
