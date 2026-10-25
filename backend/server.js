
import express from "express";
import multer from "multer";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import { extractText, analyse } from "./analyzer.js";
import Analysis from "./models/Analysis.js";

dotenv.config();

const PORT = process.env.PORT || 3001;
const MAX_BYTES = 5 * 1024 * 1024;

const app = express();

app.use(cors());
app.use(express.json());

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES },
  fileFilter(_req, file, cb) {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files are accepted."));
    }
    cb(null, true);
  },
});

// Cache the MongoDB connection for serverless requests.
let dbConnectionPromise;

async function ensureDBConnection() {
  if (!dbConnectionPromise) {
    dbConnectionPromise = connectDB().catch((err) => {
      dbConnectionPromise = null;
      throw err;
    });
  }

  await dbConnectionPromise;
}

// Ensure the database is connected before handling API requests.
app.use(async (req, res, next) => {
  try {
    await ensureDBConnection();
    next();
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    res.status(500).json({
      error: "Database connection failed.",
    });
  }
});

app.get("/", (_req, res) => {
  res.json({
    message: "Resume Analyzer API is running.",
  });
});

// Resume analysis API
app.post("/api/analyse", (req, res) => {
  upload.single("resume")(req, res, async (uploadErr) => {
    if (uploadErr) {
      const status =
        uploadErr.code === "LIMIT_FILE_SIZE" ? 413 : 400;

      return res.status(status).json({
        error: uploadErr.message,
      });
    }

    const jd =
      typeof req.body.jd === "string" ? req.body.jd.trim() : "";

    if (!req.file) {
      return res.status(400).json({
        error: "Upload a PDF resume.",
      });
    }

    if (!jd) {
      return res.status(400).json({
        error: "Paste a job description.",
      });
    }

    try {
      const resumeText = await extractText(req.file.buffer);
      const result = analyse(resumeText, jd);

      const savedAnalysis = await Analysis.create({
        resumeFilename: req.file.originalname,
        jobDescription: jd,
        result,
      });

      return res.json({
        message: "Resume analysed and saved successfully!",
        analysisId: savedAnalysis._id,
        ...result,
      });
    } catch (err) {
      console.error("Resume analysis error:", err);

      return res.status(422).json({
        error: "Resume analysis or database save failed.",
      });
    }
  });
});

// Local development only. Vercel imports the exported app.
if (process.env.VERCEL !== "1") {
  ensureDBConnection()
    .then(() => {
      app.listen(PORT, () => {
        console.log(
          `Resume analyser API running on http://localhost:${PORT}`
        );
      });
    })
    .catch((err) => {
      console.error("Failed to start the server:", err.message);
    });
}

export default app;
