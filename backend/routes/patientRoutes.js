const express = require("express");
const router = express.Router();

const {
  getAllPatients,
  searchPatients,
  addPatient,
  updatePatient,
  deletePatient,
  getPatientSummary
} = require("../controllers/patientController");

router.get("/", getAllPatients);
router.get("/search", searchPatients);
router.get("/summary", getPatientSummary);
router.post("/", addPatient);
router.put("/:id", updatePatient);
router.delete("/:id", deletePatient);

module.exports = router;