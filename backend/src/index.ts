import express from "express";
import cors from "cors";
import scanRoutes from "./routes/scan";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", scanRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});

