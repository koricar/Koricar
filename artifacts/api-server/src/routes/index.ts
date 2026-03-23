import { Router, type IRouter } from "express";
import healthRouter from "./health";
import carsRouter from "./cars";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/cars", carsRouter);

export default router;
