const db = require("../config/db");

// Get all doctors with department name
const getAllDoctors = (req, res) => {
  const sql = `
    SELECT 
      D.DoctorID,
      D.FullName,
      D.Phone,
      D.Email,
      D.Specialization,
      D.DeptID,
      Dep.DeptName
    FROM Doctor D
    LEFT JOIN Department Dep ON D.DeptID = Dep.DeptID
    ORDER BY D.DoctorID
  `;

  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(result);
  });
};

// Search doctors by name, specialization, or department
const searchDoctors = (req, res) => {
  const search = req.query.q || "";
  const value = `%${search}%`;

  const sql = `
    SELECT 
      D.DoctorID,
      D.FullName,
      D.Phone,
      D.Email,
      D.Specialization,
      D.DeptID,
      Dep.DeptName
    FROM Doctor D
    LEFT JOIN Department Dep ON D.DeptID = Dep.DeptID
    WHERE D.DoctorID LIKE ?
       OR D.FullName LIKE ?
       OR D.Specialization LIKE ?
       OR Dep.DeptName LIKE ?
    ORDER BY D.DoctorID
  `;

  db.query(sql, [value, value, value, value], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(result);
  });
};

// Get departments for dropdown
const getDepartments = (req, res) => {
  const sql = `
    SELECT DeptID, DeptName
    FROM Department
    ORDER BY DeptName
  `;

  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(result);
  });
};

// Add doctor
const addDoctor = (req, res) => {
  const {
    DoctorID,
    DeptID,
    FullName,
    Phone,
    Email,
    Specialization
  } = req.body;

  const sql = `
    INSERT INTO Doctor
    (
      DoctorID,
      DeptID,
      FullName,
      Phone,
      Email,
      Specialization
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [DoctorID, DeptID, FullName, Phone, Email, Specialization],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: "Doctor added successfully", result });
    }
  );
};

// Update doctor
const updateDoctor = (req, res) => {
  const { id } = req.params;

  const {
    DeptID,
    FullName,
    Phone,
    Email,
    Specialization
  } = req.body;

  const sql = `
    UPDATE Doctor
    SET
      DeptID = ?,
      FullName = ?,
      Phone = ?,
      Email = ?,
      Specialization = ?
    WHERE DoctorID = ?
  `;

  db.query(
    sql,
    [DeptID, FullName, Phone, Email, Specialization, id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Doctor not found" });
      }

      res.json({ message: "Doctor updated successfully", result });
    }
  );
};

// Delete doctor
const deleteDoctor = (req, res) => {
  const { id } = req.params;

  const sql = `DELETE FROM Doctor WHERE DoctorID = ?`;

  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).json({
        error: err.message,
        message:
          "Cannot delete doctor because linked records may exist in Appointment, Prescription, or Lab_Order."
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.json({ message: "Doctor deleted successfully", result });
  });
};

// Summary cards
const getDoctorSummary = (req, res) => {
  const sql = `
    SELECT
      COUNT(*) AS totalDoctors,
      COUNT(DISTINCT DeptID) AS totalDepartments,
      COUNT(DISTINCT Specialization) AS totalSpecializations
    FROM Doctor
  `;

  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(result[0]);
  });
};

module.exports = {
  getAllDoctors,
  searchDoctors,
  getDepartments,
  addDoctor,
  updateDoctor,
  deleteDoctor,
  getDoctorSummary
};