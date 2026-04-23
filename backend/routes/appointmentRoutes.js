const express = require("express");
const router = express.Router();

const {
  getAllAppointments,
  searchAppointments,
  getPatientsForDropdown,
  getDoctorsForDropdown,
  addAppointment,
  updateAppointment,
  deleteAppointment,
  getAppointmentSummary
} = require("../controllers/appointmentController");

router.get("/", getAllAppointments);
router.get("/search", searchAppointments);
router.get("/summary", getAppointmentSummary);
router.get("/patients", getPatientsForDropdown);
router.get("/doctors", getDoctorsForDropdown);
router.post("/", addAppointment);
router.put("/:id", updateAppointment);
router.delete("/:id", deleteAppointment);

module.exports = router;