const db = require("../config/db");

// Get all bills with patient and payment summary
const getAllBills = (req, res) => {
  const sql = `
    SELECT
      B.BillID,
      B.PatientID,
      B.AdmissionID,
      B.BillDate,
      B.TotalAmount,
      B.Status,
      CONCAT(P.FirstName, ' ', P.LastName) AS PatientName,
      COALESCE(SUM(Pay.AmountPaid), 0) AS AmountPaid,
      (B.TotalAmount - COALESCE(SUM(Pay.AmountPaid), 0)) AS Balance
    FROM Bill B
    JOIN Patient P ON B.PatientID = P.PatientID
    LEFT JOIN Payment Pay ON B.BillID = Pay.BillID
    GROUP BY
      B.BillID, B.PatientID, B.AdmissionID, B.BillDate, B.TotalAmount, B.Status,
      P.FirstName, P.LastName
    ORDER BY B.BillDate DESC, B.BillID
  `;

  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(result);
  });
};

// Search bills
const searchBills = (req, res) => {
  const search = req.query.q || "";
  const value = `%${search}%`;

  const sql = `
    SELECT
      B.BillID,
      B.PatientID,
      B.AdmissionID,
      B.BillDate,
      B.TotalAmount,
      B.Status,
      CONCAT(P.FirstName, ' ', P.LastName) AS PatientName,
      COALESCE(SUM(Pay.AmountPaid), 0) AS AmountPaid,
      (B.TotalAmount - COALESCE(SUM(Pay.AmountPaid), 0)) AS Balance
    FROM Bill B
    JOIN Patient P ON B.PatientID = P.PatientID
    LEFT JOIN Payment Pay ON B.BillID = Pay.BillID
    WHERE B.BillID LIKE ?
       OR B.PatientID LIKE ?
       OR B.AdmissionID LIKE ?
       OR B.Status LIKE ?
       OR P.FirstName LIKE ?
       OR P.LastName LIKE ?
    GROUP BY
      B.BillID, B.PatientID, B.AdmissionID, B.BillDate, B.TotalAmount, B.Status,
      P.FirstName, P.LastName
    ORDER BY B.BillDate DESC, B.BillID
  `;

  db.query(sql, [value, value, value, value, value, value], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(result);
  });
};

// Get patients for bill dropdown
const getPatientsForBillDropdown = (req, res) => {
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

// Get admissions for bill dropdown
const getAdmissionsForBillDropdown = (req, res) => {
  const sql = `
    SELECT
      AdmissionID,
      PatientID
    FROM Admission
    ORDER BY AdmissionID
  `;

  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(result);
  });
};

// Add bill
const addBill = (req, res) => {
  const {
    BillID,
    PatientID,
    AdmissionID,
    BillDate,
    TotalAmount,
    Status
  } = req.body;

  const sql = `
    INSERT INTO Bill
    (
      BillID,
      PatientID,
      AdmissionID,
      BillDate,
      TotalAmount,
      Status
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      BillID,
      PatientID,
      AdmissionID || null,
      BillDate,
      TotalAmount,
      Status
    ],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: "Bill added successfully", result });
    }
  );
};

// Update bill
const updateBill = (req, res) => {
  const { id } = req.params;
  const {
    PatientID,
    AdmissionID,
    BillDate,
    TotalAmount,
    Status
  } = req.body;

  const sql = `
    UPDATE Bill
    SET
      PatientID = ?,
      AdmissionID = ?,
      BillDate = ?,
      TotalAmount = ?,
      Status = ?
    WHERE BillID = ?
  `;

  db.query(
    sql,
    [PatientID, AdmissionID || null, BillDate, TotalAmount, Status, id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Bill not found" });
      }

      res.json({ message: "Bill updated successfully", result });
    }
  );
};

// Delete bill
const deleteBill = (req, res) => {
  const { id } = req.params;

  const deletePaymentsSql = `DELETE FROM Payment WHERE BillID = ?`;
  const deleteBillSql = `DELETE FROM Bill WHERE BillID = ?`;

  db.query(deletePaymentsSql, [id], (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    db.query(deleteBillSql, [id], (err2, result) => {
      if (err2) {
        return res.status(500).json({ error: err2.message });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Bill not found" });
      }

      res.json({ message: "Bill and related payments deleted successfully", result });
    });
  });
};

// Record payment and auto-update bill status
const addPayment = (req, res) => {
  const {
    PaymentID,
    BillID,
    PaymentDate,
    AmountPaid,
    Method
  } = req.body;

  const insertPaymentSql = `
    INSERT INTO Payment
    (
      PaymentID,
      BillID,
      PaymentDate,
      AmountPaid,
      Method
    )
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    insertPaymentSql,
    [PaymentID, BillID, PaymentDate, AmountPaid, Method],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      const billSummarySql = `
        SELECT
          B.TotalAmount,
          COALESCE(SUM(P.AmountPaid), 0) AS TotalPaid
        FROM Bill B
        LEFT JOIN Payment P ON B.BillID = P.BillID
        WHERE B.BillID = ?
        GROUP BY B.TotalAmount
      `;

      db.query(billSummarySql, [BillID], (err2, summaryResult) => {
        if (err2) {
          return res.status(500).json({ error: err2.message });
        }

        if (!summaryResult.length) {
          return res.json({ message: "Payment recorded, but bill summary not found", result });
        }

        const totalAmount = Number(summaryResult[0].TotalAmount);
        const totalPaid = Number(summaryResult[0].TotalPaid);

        let newStatus = "Pending";
        if (totalPaid >= totalAmount) {
          newStatus = "Paid";
        } else if (totalPaid > 0) {
          newStatus = "Partial Paid";
        }

        const updateBillStatusSql = `UPDATE Bill SET Status = ? WHERE BillID = ?`;

        db.query(updateBillStatusSql, [newStatus, BillID], (err3) => {
          if (err3) {
            return res.status(500).json({ error: err3.message });
          }

          res.json({ message: "Payment recorded successfully and bill status updated", result });
        });
      });
    }
  );
};

// Get payments for a bill
const getPaymentsByBill = (req, res) => {
  const { billId } = req.params;

  const sql = `
    SELECT
      PaymentID,
      BillID,
      PaymentDate,
      AmountPaid,
      Method
    FROM Payment
    WHERE BillID = ?
    ORDER BY PaymentDate DESC, PaymentID
  `;

  db.query(sql, [billId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(result);
  });
};

// Summary cards
const getBillSummary = (req, res) => {
  const sql = `
    SELECT
      COUNT(*) AS totalBills,
      SUM(CASE WHEN Status = 'Paid' THEN 1 ELSE 0 END) AS paidBills,
      SUM(CASE WHEN Status <> 'Paid' THEN 1 ELSE 0 END) AS unpaidOrPartialBills
    FROM Bill
  `;

  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(result[0]);
  });
};

module.exports = {
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
};