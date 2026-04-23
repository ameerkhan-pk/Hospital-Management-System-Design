const API_URL = "http://127.0.0.1:3001/api/patients";

let editingPatientId = null;

// Load summary cards
async function loadSummary() {
  try {
    const response = await fetch(`${API_URL}/summary`);
    const data = await response.json();

    document.getElementById("totalPatients").textContent = data.totalPatients || 0;
    document.getElementById("malePatients").textContent = data.malePatients || 0;
    document.getElementById("femalePatients").textContent = data.femalePatients || 0;
  } catch (error) {
    console.error("Error loading summary:", error);
  }
}

// Load all patients
async function loadPatients() {
  try {
    const response = await fetch(API_URL);
    const patients = await response.json();
    renderPatients(patients);
    loadSummary();
  } catch (error) {
    console.error("Error loading patients:", error);
  }
}

// Search patients
async function searchPatients() {
  const searchValue = document.getElementById("searchInput").value.trim();

  if (!searchValue) {
    loadPatients();
    return;
  }

  try {
    const response = await fetch(`${API_URL}/search?q=${encodeURIComponent(searchValue)}`);
    const patients = await response.json();
    renderPatients(patients);
  } catch (error) {
    console.error("Error searching patients:", error);
  }
}

// Render patient table
function renderPatients(patients) {
  const tableBody = document.getElementById("patientTableBody");
  tableBody.innerHTML = "";

  if (!patients || patients.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align:center;">No patients found</td>
      </tr>
    `;
    return;
  }

  patients.forEach((patient) => {
    const genderText =
      patient.Gender === "M" ? "Male" :
      patient.Gender === "F" ? "Female" :
      "";

    const row = `
      <tr>
        <td>${patient.PatientID}</td>
        <td>${patient.FirstName} ${patient.LastName}</td>
        <td>${patient.DOB ? patient.DOB.split("T")[0] : ""}</td>
        <td>${genderText}</td>
        <td>${patient.Phone || ""}</td>
        <td>${patient.BloodGroup || ""}</td>
        <td>${patient.Address || ""}</td>
        <td>
          <div class="action-buttons">
            <button class="edit-btn" onclick='editPatient(${JSON.stringify(patient)})'>Edit</button>
            <button class="delete-btn" onclick='deletePatient("${patient.PatientID}")'>Delete</button>
          </div>
        </td>
      </tr>
    `;
    tableBody.innerHTML += row;
  });
}

// Add or update patient
document.getElementById("patientForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const patientData = {
    PatientID: document.getElementById("PatientID").value.trim(),
    FirstName: document.getElementById("FirstName").value.trim(),
    LastName: document.getElementById("LastName").value.trim(),
    DOB: document.getElementById("DOB").value,
    Gender: document.getElementById("Gender").value,
    Phone: document.getElementById("Phone").value.trim(),
    Address: document.getElementById("Address").value.trim(),
    BloodGroup: document.getElementById("BloodGroup").value.trim(),
    EmergencyContactName: document.getElementById("EmergencyContactName").value.trim(),
    EmergencyContactPhone: document.getElementById("EmergencyContactPhone").value.trim()
  };

  try {
    let response;

    if (editingPatientId) {
      response = await fetch(`${API_URL}/${editingPatientId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(patientData)
      });
    } else {
      response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(patientData)
      });
    }

    const result = await response.json();
    alert(result.message || result.error || "Operation completed");

    resetForm();
    loadPatients();
  } catch (error) {
    console.error("Error saving patient:", error);
    alert("Something went wrong while saving the patient.");
  }
});

// Fill form for editing
function editPatient(patient) {
  editingPatientId = patient.PatientID;

  document.getElementById("formTitle").textContent = "Edit Patient";
  document.getElementById("submitBtn").textContent = "Update Patient";
  document.getElementById("cancelEditBtn").style.display = "inline-block";

  document.getElementById("PatientID").value = patient.PatientID;
  document.getElementById("PatientID").disabled = true;

  document.getElementById("FirstName").value = patient.FirstName || "";
  document.getElementById("LastName").value = patient.LastName || "";
  document.getElementById("DOB").value = patient.DOB ? patient.DOB.split("T")[0] : "";
  document.getElementById("Gender").value = patient.Gender || "";
  document.getElementById("Phone").value = patient.Phone || "";
  document.getElementById("Address").value = patient.Address || "";
  document.getElementById("BloodGroup").value = patient.BloodGroup || "";
  document.getElementById("EmergencyContactName").value = patient.EmergencyContactName || "";
  document.getElementById("EmergencyContactPhone").value = patient.EmergencyContactPhone || "";
}

// Cancel edit
document.getElementById("cancelEditBtn").addEventListener("click", () => {
  resetForm();
});

// Reset form
function resetForm() {
  editingPatientId = null;

  document.getElementById("patientForm").reset();
  document.getElementById("PatientID").disabled = false;
  document.getElementById("formTitle").textContent = "Add New Patient";
  document.getElementById("submitBtn").textContent = "Add Patient";
  document.getElementById("cancelEditBtn").style.display = "none";
}

// Delete patient
async function deletePatient(patientId) {
  const confirmDelete = confirm(
    `Are you sure you want to delete patient ${patientId}?\n\nWarning: If this patient has linked records in Appointment, Admission, Prescription, Lab_Order, or Bill, deletion may fail.`
  );

  if (!confirmDelete) return;

  try {
    const response = await fetch(`${API_URL}/${patientId}`, {
      method: "DELETE"
    });

    const result = await response.json();
    alert(result.message || result.error || "Delete attempted");

    loadPatients();
  } catch (error) {
    console.error("Error deleting patient:", error);
    alert("Something went wrong while deleting the patient.");
  }
}

// Initial load
loadPatients();
loadSummary();