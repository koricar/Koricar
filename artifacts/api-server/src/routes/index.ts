import { Router, type IRouter } from "express";
import healthRouter from "./health";
import carsRouter from "./cars";
import alertsRouter from "./alerts";
import autobellRouter from "./autobell";
import marketPriceRouter from "./market-price";

const router: IRouter = Router();
router.use("/autobell", autobellRouter);
router.use(healthRouter);
router.use("/cars", carsRouter);
router.use("/alerts", alertsRouter);
router.use("/market-price", marketPriceRouter);

export default router;