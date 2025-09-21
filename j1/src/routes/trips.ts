import type { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { verifySignature } from "../lib/signature.js";
const prisma = new PrismaClient();

function requireSigned(req: Request): void {
  const ok = verifySignature(req.body, req.header("x-rec-signature"), process.env.REC_SIGNING_SECRET || "");
  if (!ok) { const e:any=new Error("invalid signature"); (e as any).status=401; throw e; }
}

export async function tripStart(req: Request, res: Response) {
  requireSigned(req);
  const { id, device_id, start_at } = req.body || {};
  if (!id || !device_id) return res.status(400).json({ ok:false, error:"id and device_id required" });
  const payloadStr = JSON.stringify(req.body);

  const row = await prisma.trip.upsert({
    where: { id },
    update: {
      device_id,
      start_at: start_at ? new Date(start_at) : new Date(),
      payload: payloadStr,
      signature: req.header("x-rec-signature") || ""
    },
    create: {
      id,
      device_id,
      start_at: start_at ? new Date(start_at) : new Date(),
      end_at: null,
      payload: payloadStr,
      signature: req.header("x-rec-signature") || ""
    }
  });
  return res.json({ ok:true, id: row.id });
}

export async function tripEnd(req: Request, res: Response) {
  requireSigned(req);
  const { id, device_id, end_at } = req.body || {};
  if (!id) return res.status(400).json({ ok:false, error:"id required" });
  const payloadStr = JSON.stringify(req.body);

  const row = await prisma.trip.update({
    where: { id },
    data: {
      device_id: device_id || undefined,
      end_at: end_at ? new Date(end_at) : new Date(),
      payload: payloadStr,
      signature: req.header("x-rec-signature") || ""
    }
  }).catch(()=>null);

  if (!row) return res.status(404).json({ ok:false, error:"trip not found" });
  return res.json({ ok:true, id });
}
