const db = require("../config/db");

// Get all patients
const getAllPatients = (req, res) => {
  const sql = `
    SELECT 
      PatientID,
      FirstName,
      LastName,
      DOB,
      Gender,
      Phone,
      Address,
      BloodGroup,
      EmergencyContactName,
      EmergencyContactPhone
    FROM Patient
    ORDER BY PatientID
  `;

  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(result);
  });
};

// Search patients by ID, first name, or last name
const searchPatients = (req, res) => {
  const search = req.query.q || "";
  const value = `%${search}%`;

  const sql = `
    SELECT 
      PatientID,
      FirstName,
      LastName,
      DOB,
      Gender,
      Phone,
      Address,
      BloodGroup,
      EmergencyContactName,
      EmergencyContactPhone
    FROM Patient
    WHERE PatientID LIKE ?
       OR FirstName LIKE ?
       OR LastName LIKE ?
    ORDER BY PatientID
  `;

  db.query(sql, [value, value, value], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(result);
  });
};

// Add patient
const addPatient = (req, res) => {
  const {
    PatientID,
    FirstName,
    LastName,
    DOB,
    Gender,
    Phone,
    Address,
    BloodGroup,
    EmergencyContactName,
    EmergencyContactPhone
  } = req.body;

  const sql = `
    INSERT INTO Patient
    (
      PatientID,
      FirstName,
      LastName,
      DOB,
      Gender,
      Phone,
      Address,
      BloodGroup,
      EmergencyContactName,
      EmergencyContactPhone
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      PatientID,
      FirstName,
      LastName,
      DOB,
      Gender,
      Phone,
      Address,
      BloodGroup,
      EmergencyContactName,
      EmergencyContactPhone
    ],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: "Patient added successfully", result });
    }
  );
};

// Update patient
const updatePatient = (req, res) => {
  const { id } = req.params;

  const {
    FirstName,
    LastName,
    DOB,
    Gender,
    Phone,
    Address,
    BloodGroup,
    EmergencyContactName,
    EmergencyContactPhone
  } = req.body;

  const sql = `
    UPDATE Patient
    SET
      FirstName = ?,
      LastName = ?,
      DOB = ?,
      Gender = ?,
      Phone = ?,
      Address = ?,
      BloodGroup = ?,
      EmergencyContactName = ?,
      EmergencyContactPhone = ?
    WHERE PatientID = ?
  `;

  db.query(
    sql,
    [
      FirstName,
      LastName,
      DOB,
      Gender,
      Phone,
      Address,
      BloodGroup,
      EmergencyContactName,
      EmergencyContactPhone,
      id
    ],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Patient not found" });
      }

      res.json({ message: "Patient updated successfully", result });
    }
  );
};

// Delete patient
const deletePatient = (req, res) => {
  const { id } = req.params;

  const sql = `DELETE FROM Patient WHERE PatientID = ?`;

  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).json({
        error: err.message,
        message:
          "Cannot delete patient because linked records may exist in Appointment, Admission, Prescription, Lab_Order, or Bill."
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.json({ message: "Patient deleted successfully", result });
  });
};

// Dashboard-style summary for patient page
const getPatientSummary = (req, res) => {
  const sql = `
    SELECT
      COUNT(*) AS totalPatients,
      SUM(CASE WHEN Gender = 'M' THEN 1 ELSE 0 END) AS malePatients,
      SUM(CASE WHEN Gender = 'F' THEN 1 ELSE 0 END) AS femalePatients
    FROM Patient
  `;

  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(result[0]);
  });
};

module.exports = {
  getAllPatients,
  searchPatients,
  addPatient,
  updatePatient,
  deletePatient,
  getPatientSummary
};