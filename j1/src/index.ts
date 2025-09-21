import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { tripStart, tripEnd } from "./routes/trips.js";
import { triage } from "./routes/triage.js";

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "1mb" }));
app.use((req,_res,next)=>{ console.log(JSON.stringify({ts:new Date().toISOString(),method:req.method,url:req.url})); next(); });

app.get("/healthz", (_req,res)=>res.json({ok:true}));
app.post("/trip_start", tripStart);
app.post("/trip_end", tripEnd);
app.post("/triage", triage);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, "..", "public")));
app.get("/", (_req,res)=>res.sendFile(path.join(__dirname, "..", "public", "index.html")));

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>console.log(JSON.stringify({msg:"REC J1 listening", port:PORT})));
