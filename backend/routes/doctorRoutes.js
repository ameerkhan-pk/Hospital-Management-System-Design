const express = require("express");
const router = express.Router();

const {
  getAllDoctors,
  searchDoctors,
  getDepartments,
  addDoctor,
  updateDoctor,
  deleteDoctor,
  getDoctorSummary
} = require("../controllers/doctorController");

router.get("/", getAllDoctors);
router.get("/search", searchDoctors);
router.get("/summary", getDoctorSummary);
router.get("/departments", getDepartments);
router.post("/", addDoctor);
router.put("/:id", updateDoctor);
router.delete("/:id", deleteDoctor);

module.exports = router;