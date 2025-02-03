const mongoose = require("mongoose");

const DataSchema = new mongoose.Schema({
  data: Object,
});

module.exports = mongoose.model("Data", DataSchema);
