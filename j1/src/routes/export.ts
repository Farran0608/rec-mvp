import type { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

function parseRange(req: Request): { from: Date; to: Date; fname: string } {
  const qf = req.query.from as string | undefined;
  const qt = req.query.to as string | undefined;
  const now = new Date();
  let d = new Date(now);
  // default = yesterday (00:00..23:59:59Z)
  d.setUTCDate(d.getUTCDate() - 1);
  const y = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0,0,0,0));
  const yEnd = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23,59,59,999));
  const from = qf ? new Date(qf) : y;
  const to   = qt ? new Date(qt) : yEnd;
  const ds = from.toISOString().slice(0,10);
  return { from, to, fname: `trips-${ds}.csv` };
}

export async function exportCsv(req: Request, res: Response) {
  const { from, to, fname } = parseRange(req);
  const rows = await prisma.trip.findMany({
    where: { created_at: { gte: from, lte: to } },
    orderBy: { created_at: "asc" }
  });
  const header = ["id","device_id","start_at","end_at","created_at","signature","payload"];
  const csvLines = [header.join(",")];
  for (const r of rows) {
    const line = [
      r.id, r.device_id,
      r.start_at ? r.start_at.toISOString() : "",
      r.end_at ? r.end_at.toISOString() : "",
      r.created_at.toISOString(),
      r.signature,
      JSON.stringify(r.payload ?? "")
    ].map(v => `"${String(v).replace(/"/g,'""')}"`).join(",");
    csvLines.push(line);
  }
  const body = csvLines.join("\n");
  res.setHeader("Content-Type","text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${fname}"`);
  return res.status(200).send(body);
}
