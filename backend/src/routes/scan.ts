import { Router } from "express";
import multer from "multer";
import { analyzeImage } from "../services/geminiService";

const router = Router();
const upload = multer({ limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB cap

router.post("/scan", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Image is required" });
  }

  try {
    const result = await analyzeImage(req.file.buffer);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Scan failed" });
  }
});

export default router;

