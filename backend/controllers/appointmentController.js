const db = require("../config/db");

// Get all appointments with patient, doctor, and department
const getAllAppointments = (req, res) => {
  const sql = `
    SELECT
      A.AppointmentID,
      A.PatientID,
      A.DoctorID,
      A.ApptDateTime,
      A.Status,
      A.Reason,
      CONCAT(P.FirstName, ' ', P.LastName) AS PatientName,
      D.FullName AS DoctorName,
      Dep.DeptName
    FROM Appointment A
    JOIN Patient P ON A.PatientID = P.PatientID
    JOIN Doctor D ON A.DoctorID = D.DoctorID
    LEFT JOIN Department Dep ON D.DeptID = Dep.DeptID
    ORDER BY A.ApptDateTime DESC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(result);
  });
};

// Search appointments by patient, doctor, status, or reason
const searchAppointments = (req, res) => {
  const search = req.query.q || "";
  const value = `%${search}%`;

  const sql = `
    SELECT
      A.AppointmentID,
      A.PatientID,
      A.DoctorID,
      A.ApptDateTime,
      A.Status,
      A.Reason,
      CONCAT(P.FirstName, ' ', P.LastName) AS PatientName,
      D.FullName AS DoctorName,
      Dep.DeptName
    FROM Appointment A
    JOIN Patient P ON A.PatientID = P.PatientID
    JOIN Doctor D ON A.DoctorID = D.DoctorID
    LEFT JOIN Department Dep ON D.DeptID = Dep.DeptID
    WHERE A.AppointmentID LIKE ?
       OR A.PatientID LIKE ?
       OR A.DoctorID LIKE ?
       OR P.FirstName LIKE ?
       OR P.LastName LIKE ?
       OR D.FullName LIKE ?
       OR A.Status LIKE ?
       OR A.Reason LIKE ?
       OR Dep.DeptName LIKE ?
    ORDER BY A.ApptDateTime DESC
  `;

  db.query(
    sql,
    [value, value, value, value, value, value, value, value, value],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(result);
    }
  );
};

// Get patients for dropdown
const getPatientsForDropdown = (req, res) => {
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

// Get doctors for dropdown
const getDoctorsForDropdown = (req, res) => {
  const sql = `
    SELECT
      D.DoctorID,
      D.FullName,
      Dep.DeptName
    FROM Doctor D
    LEFT JOIN Department Dep ON D.DeptID = Dep.DeptID
    ORDER BY D.FullName
  `;

  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(result);
  });
};

// Add appointment
const addAppointment = (req, res) => {
  const {
    AppointmentID,
    PatientID,
    DoctorID,
    ApptDateTime,
    Status,
    Reason
  } = req.body;

  const sql = `
    INSERT INTO Appointment
    (
      AppointmentID,
      PatientID,
      DoctorID,
      ApptDateTime,
      Status,
      Reason
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [AppointmentID, PatientID, DoctorID, ApptDateTime, Status, Reason],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: "Appointment added successfully", result });
    }
  );
};

// Update appointment
const updateAppointment = (req, res) => {
  const { id } = req.params;

  const {
    PatientID,
    DoctorID,
    ApptDateTime,
    Status,
    Reason
  } = req.body;

  const sql = `
    UPDATE Appointment
    SET
      PatientID = ?,
      DoctorID = ?,
      ApptDateTime = ?,
      Status = ?,
      Reason = ?
    WHERE AppointmentID = ?
  `;

  db.query(
    sql,
    [PatientID, DoctorID, ApptDateTime, Status, Reason, id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Appointment not found" });
      }

      res.json({ message: "Appointment updated successfully", result });
    }
  );
};

// Delete appointment
const deleteAppointment = (req, res) => {
  const { id } = req.params;

  const sql = `DELETE FROM Appointment WHERE AppointmentID = ?`;

  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.json({ message: "Appointment deleted successfully", result });
  });
};

// Summary cards
const getAppointmentSummary = (req, res) => {
  const sql = `
    SELECT
      COUNT(*) AS totalAppointments,
      SUM(CASE WHEN Status = 'Scheduled' THEN 1 ELSE 0 END) AS scheduledAppointments,
      SUM(CASE WHEN Status = 'Completed' THEN 1 ELSE 0 END) AS completedAppointments
    FROM Appointment
  `;

  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(result[0]);
  });
};

module.exports = {
  getAllAppointments,
  searchAppointments,
  getPatientsForDropdown,
  getDoctorsForDropdown,
  addAppointment,
  updateAppointment,
  deleteAppointment,
  getAppointmentSummary
};