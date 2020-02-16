const mongoose = require("mongoose");

const reportSchema = mongoose.Schema({
  cold: { type: Number, required: true },
  hot: { type: Number, required: true },
  elec: { type: Number, required: true },
  heat: { type: Number, required: true },
  isWinter: { type: Boolean, required: true },
  isApproved: { type: Boolean, required: true },
  nr: { type: Number, required: true },
  approveToken: { type: String, required: true }
}, { timestamps: true });

const Report = mongoose.model("Report", reportSchema);

module.exports = Report;
