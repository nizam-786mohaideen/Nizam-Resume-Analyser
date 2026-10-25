
import mongoose from "mongoose";

const analysisSchema = new mongoose.Schema(
  {
    resumeFilename: {
      type: String,
      required: true,
    },

    jobDescription: {
      type: String,
      required: true,
    },

    result: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Analysis = mongoose.model("Analysis", analysisSchema);

export default Analysis;
