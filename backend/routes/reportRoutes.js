const express = require("express");
const router = express.Router();

const {
  getPatientsForReports,
  getAppointmentSummaryReport,
  getLabResultsReport,
  getPrescriptionHistoryReport
} = require("../controllers/reportController");

router.get("/patients", getPatientsForReports);
router.get("/appointments/:patientId", getAppointmentSummaryReport);
router.get("/lab-results/:patientId", getLabResultsReport);
router.get("/prescriptions/:patientId", getPrescriptionHistoryReport);

module.exports = router;