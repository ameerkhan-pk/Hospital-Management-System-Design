const express = require("express");
const router = express.Router();

const {
  getAllBills,
  searchBills,
  getPatientsForBillDropdown,
  getAdmissionsForBillDropdown,
  addBill,
  updateBill,
  deleteBill,
  addPayment,
  getPaymentsByBill,
  getBillSummary
} = require("../controllers/billController");

router.get("/", getAllBills);
router.get("/search", searchBills);
router.get("/summary", getBillSummary);
router.get("/patients", getPatientsForBillDropdown);
router.get("/admissions", getAdmissionsForBillDropdown);
router.get("/:billId/payments", getPaymentsByBill);

router.post("/", addBill);
router.post("/payment", addPayment);

router.put("/:id", updateBill);
router.delete("/:id", deleteBill);

module.exports = router;