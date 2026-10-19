import { Router, type IRouter } from "express";
import { getRateInfo } from "../lib/exchange-rate";

const router: IRouter = Router();
router.get("/rate", (_req, res) => { res.json(getRateInfo()); });
export default router;
