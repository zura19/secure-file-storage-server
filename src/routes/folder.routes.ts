import { Router } from "express";
import {
  createFolder,
  getMyFolders,
  getFolder,
  updateFolderName,
  deleteFolder,
} from "../controllers/folder.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protect);

router.post("/", createFolder);
router.get("/", getMyFolders);
router.get("/:id", getFolder);
router.patch("/:id", updateFolderName);
router.delete("/:id", deleteFolder);

export default router;
