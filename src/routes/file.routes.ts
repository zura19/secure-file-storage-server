import { Router } from "express";
import {
  uploadFile,
  getMyFiles,
  getFile,
  deleteFile,
  deleteManyFiles,
  updateVisibility,
  getSharedFile,
} from "../controllers/file.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import {
  uploadFiles,
  checkFileSizeHeader,
} from "../middleware/upload.middleware.js";

const router = Router();

router.get("/share/:shareToken", getSharedFile);

router.use(protect);
router.post("/upload", checkFileSizeHeader, uploadFiles, uploadFile);
router.get("/", getMyFiles);
router.delete("/many", deleteManyFiles);
router.get("/:id", getFile);
router.delete("/:id", deleteFile);
router.patch("/:id/visibility", updateVisibility);

export default router;
