import { Router, type IRouter } from "express";
import healthRouter from "./health";
import carsRouter from "./cars";
import autobellRouter from "./autobell";
import marketPriceRouter from "./market-price";
import equipmentRouter from "./equipment";

const router: IRouter = Router();
router.use("/autobell", autobellRouter);
router.use(healthRouter);
router.use("/cars", carsRouter);
router.use("/market-price", marketPriceRouter);
router.use("/equipment", equipmentRouter);

export default router;
