import { Router } from "express";
import { getUserStats } from "../controllers/user.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protect);

router.get("/stats", getUserStats);

export default router;
