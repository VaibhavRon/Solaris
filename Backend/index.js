import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv"
import cookieParser from "cookie-parser";
import cors from 'cors'
import path from "path";

const app=express();
const __dirname = path.resolve();
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json())//allow us to parse incoming request:req.body
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())//allow us to parse incoming cookies



//routes
import authrouter from "./routes/auth.js";

dotenv.config();

const dburl=process.env.MONGO_URI;
main().then((res)=>{
    console.log("connection sucessfull to database");
})
.catch((err)=>{
    console.log(err);
});
async function main()
    {
       await mongoose.connect(dburl);
    }

app.listen(5000,()=>{
    console.log("server is running on port 5000");
})

app.use("/api/auth",authrouter);

if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "/frontend/auth/dist")));

	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "frontend", "auth" , "dist", "index.html"));
	});
}
