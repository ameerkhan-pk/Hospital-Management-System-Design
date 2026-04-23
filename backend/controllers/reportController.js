const db = require("../config/db");

// Get patients for report dropdowns
const getPatientsForReports = (req, res) => {
  const sql = `
    SELECT
      PatientID,
      CONCAT(FirstName, ' ', LastName) AS PatientName
    FROM Patient
    ORDER BY FirstName, LastName
  `;

  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(result);
  });
};

// 1. Full Appointment Summary by Patient
const getAppointmentSummaryReport = (req, res) => {
  const { patientId } = req.params;

  const sql = `
    SELECT
      P.PatientID,
      CONCAT(P.FirstName, ' ', P.LastName) AS PatientName,
      D.DoctorID,
      D.FullName AS DoctorName,
      Dep.DeptID,
      Dep.DeptName,
      A.ApptDateTime,
      A.Status,
      A.Reason
    FROM Appointment A
    JOIN Patient P ON A.PatientID = P.PatientID
    JOIN Doctor D ON A.DoctorID = D.DoctorID
    LEFT JOIN Department Dep ON D.DeptID = Dep.DeptID
    WHERE P.PatientID = ?
    ORDER BY A.ApptDateTime DESC
  `;

  db.query(sql, [patientId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(result);
  });
};

// 2. Lab Results by Patient
const getLabResultsReport = (req, res) => {
  const { patientId } = req.params;

  const sql = `
    SELECT
      P.PatientID,
      CONCAT(P.FirstName, ' ', P.LastName) AS PatientName,
      D.FullName AS OrderingDoctor,
      LO.OrderDate,
      LT.TestName,
      LOI.ResultValue,
      LOI.NormalRange,
      LOI.ResultDate
    FROM Lab_Order LO
    JOIN Patient P ON LO.PatientID = P.PatientID
    JOIN Doctor D ON LO.DoctorID = D.DoctorID
    JOIN Lab_Order_Item LOI ON LO.LabOrderID = LOI.LabOrderID
    JOIN Lab_Test LT ON LOI.TestID = LT.TestID
    WHERE P.PatientID = ?
    ORDER BY LO.OrderDate DESC, LOI.ResultDate DESC
  `;

  db.query(sql, [patientId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(result);
  });
};

// 3. Prescription History by Patient
const getPrescriptionHistoryReport = (req, res) => {
  const { patientId } = req.params;

  const sql = `
    SELECT
      PR.PrescriptionID,
      PR.PrescribeDate,
      D.FullName AS PrescribingDoctor,
      PI.MedicineName,
      PI.Dosage,
      PI.Frequency,
      PI.DurationDays,
      PR.Notes
    FROM Prescription PR
    JOIN Doctor D ON PR.DoctorID = D.DoctorID
    JOIN Prescription_Item PI ON PR.PrescriptionID = PI.PrescriptionID
    WHERE PR.PatientID = ?
    ORDER BY PR.PrescribeDate DESC, PR.PrescriptionID
  `;

  db.query(sql, [patientId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(result);
  });
};

module.exports = {
  getPatientsForReports,
  getAppointmentSummaryReport,
  getLabResultsReport,
  getPrescriptionHistoryReport
};