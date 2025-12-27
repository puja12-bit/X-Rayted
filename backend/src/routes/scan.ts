import { Router } from "express";
import multer from "multer";
import { analyzeImages } from "../services/geminiService";

const router = Router();
const upload = multer();

router.post(
  "/scan",
  upload.array("images"),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: "No images uploaded" });
      }

      // Multer gives files as Express.Multer.File[]
      const files = req.files as Express.Multer.File[];

      // Convert buffers → base64 strings
      const images = files.map((file) =>
        file.buffer.toString("base64")
      );

      const results = await analyzeImages(images);

      return res.json({ results });
    } catch (err) {
      console.error("Scan failed:", err);
      return res.status(500).json({ error: "Scan failed" });
    }
  }
);

export default router;
