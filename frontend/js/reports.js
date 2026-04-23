const REPORT_API_URL = "http://127.0.0.1:3001/api/reports";

// Load patients into all 3 report dropdowns
async function loadReportPatients() {
  try {
    const response = await fetch(`${REPORT_API_URL}/patients`);
    const patients = await response.json();

    const selects = [
      document.getElementById("appointmentReportPatient"),
      document.getElementById("labReportPatient"),
      document.getElementById("prescriptionReportPatient")
    ];

    selects.forEach((select) => {
      select.innerHTML = `<option value="">Select Patient</option>`;

      patients.forEach((patient) => {
        const option = document.createElement("option");
        option.value = patient.PatientID;
        option.textContent = `${patient.PatientName} (${patient.PatientID})`;
        select.appendChild(option);
      });
    });
  } catch (error) {
    console.error("Error loading report patients:", error);
  }
}

// 1. Run Appointment Summary Report
async function runAppointmentReport() {
  const patientId = document.getElementById("appointmentReportPatient").value;

  if (!patientId) {
    alert("Please select a patient first.");
    return;
  }

  try {
    const response = await fetch(`${REPORT_API_URL}/appointments/${patientId}`);
    const rows = await response.json();

    const tableBody = document.getElementById("appointmentReportBody");
    tableBody.innerHTML = "";

    if (!rows || rows.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="9" style="text-align:center;">No appointment data found</td>
        </tr>
      `;
      return;
    }

    rows.forEach((row) => {
      const tr = `
        <tr>
          <td>${row.PatientID || ""}</td>
          <td>${row.PatientName || ""}</td>
          <td>${row.DoctorID || ""}</td>
          <td>${row.DoctorName || ""}</td>
          <td>${row.DeptID || ""}</td>
          <td>${row.DeptName || ""}</td>
          <td>${formatDateTime(row.ApptDateTime)}</td>
          <td>${row.Status || ""}</td>
          <td>${row.Reason || ""}</td>
        </tr>
      `;
      tableBody.innerHTML += tr;
    });
  } catch (error) {
    console.error("Error running appointment report:", error);
  }
}

// 2. Run Lab Results Report
async function runLabReport() {
  const patientId = document.getElementById("labReportPatient").value;

  if (!patientId) {
    alert("Please select a patient first.");
    return;
  }

  try {
    const response = await fetch(`${REPORT_API_URL}/lab-results/${patientId}`);
    const rows = await response.json();

    const tableBody = document.getElementById("labReportBody");
    tableBody.innerHTML = "";

    if (!rows || rows.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align:center;">No lab results found</td>
        </tr>
      `;
      return;
    }

    rows.forEach((row) => {
      const tr = `
        <tr>
          <td>${row.PatientID || ""}</td>
          <td>${row.PatientName || ""}</td>
          <td>${row.OrderingDoctor || ""}</td>
          <td>${formatDate(row.OrderDate)}</td>
          <td>${row.TestName || ""}</td>
          <td>${row.ResultValue || ""}</td>
          <td>${row.NormalRange || ""}</td>
          <td>${formatDate(row.ResultDate)}</td>
        </tr>
      `;
      tableBody.innerHTML += tr;
    });
  } catch (error) {
    console.error("Error running lab report:", error);
  }
}

// 3. Run Prescription History Report
async function runPrescriptionReport() {
  const patientId = document.getElementById("prescriptionReportPatient").value;

  if (!patientId) {
    alert("Please select a patient first.");
    return;
  }

  try {
    const response = await fetch(`${REPORT_API_URL}/prescriptions/${patientId}`);
    const rows = await response.json();

    const tableBody = document.getElementById("prescriptionReportBody");
    tableBody.innerHTML = "";

    if (!rows || rows.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align:center;">No prescription history found</td>
        </tr>
      `;
      return;
    }

    rows.forEach((row) => {
      const tr = `
        <tr>
          <td>${row.PrescriptionID || ""}</td>
          <td>${formatDate(row.PrescribeDate)}</td>
          <td>${row.PrescribingDoctor || ""}</td>
          <td>${row.MedicineName || ""}</td>
          <td>${row.Dosage || ""}</td>
          <td>${row.Frequency || ""}</td>
          <td>${row.DurationDays || ""}</td>
          <td>${row.Notes || ""}</td>
        </tr>
      `;
      tableBody.innerHTML += tr;
    });
  } catch (error) {
    console.error("Error running prescription report:", error);
  }
}

// Helpers
function formatDate(value) {
  if (!value) return "";
  return new Date(value).toISOString().split("T")[0];
}

function formatDateTime(value) {
  if (!value) return "";
  return new Date(value).toLocaleString();
}

// Initial load
loadReportPatients();