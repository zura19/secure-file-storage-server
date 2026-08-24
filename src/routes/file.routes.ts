import { Router } from "express";
import {
  uploadFile,
  getMyFiles,
  getFile,
  deleteFile,
  updateVisibility,
  getSharedFile,
} from "../controllers/file.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import {
  uploadSingleFile,
  checkFileSizeHeader,
} from "../middleware/upload.middleware.js";

const router = Router();

router.get("/share/:shareToken", getSharedFile);

router.use(protect);
router.post("/upload", checkFileSizeHeader, uploadSingleFile, uploadFile);
router.get("/", getMyFiles);
router.get("/:id", getFile);
router.delete("/:id", deleteFile);
router.patch("/:id/visibility", updateVisibility);

export default router;
