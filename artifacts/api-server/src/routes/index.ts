import { Router, type IRouter } from "express";
import healthRouter from "./health";
import carsRouter from "./cars";
import alertsRouter from "./alerts";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/cars", carsRouter);
router.use("/alerts", alertsRouter);

export default router;
