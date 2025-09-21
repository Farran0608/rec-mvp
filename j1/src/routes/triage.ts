import type { Request, Response } from "express";
import crypto from "crypto";

function canonicalize(o:any):any{
  if(Array.isArray(o)) return o.map(canonicalize);
  if(o && typeof o==="object" && o.constructor===Object){
    return Object.keys(o).sort().reduce((a: any,k)=>{ a[k]=canonicalize(o[k]); return a; },{});
  }
  return o;
}
function verifySignature(rawBody:string, headerSig:string|undefined, secret:string):boolean{
  if(!headerSig) return false;
  const h = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(h), Buffer.from(headerSig));
}

export async function triage(req: Request, res: Response){
  const secret = process.env.REC_SIGNING_SECRET || "";
  const headerSig = req.header("X-REC-Signature") || "";
  const body = canonicalize(req.body);
  const raw = JSON.stringify(body);
  if(!verifySignature(raw, headerSig, secret)){
    return res.status(401).json({ ok:false, error:"invalid_signature" });
  }
  // Stub: just log and ack (n8n integration can be added later)
  console.log(JSON.stringify({type:"triage_event", ts:new Date().toISOString(), body}));
  return res.json({ ok:true });
}
