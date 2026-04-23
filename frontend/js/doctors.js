const DOCTOR_API_URL = "http://127.0.0.1:3001/api/doctors";

let editingDoctorId = null;

// Load summary cards
async function loadDoctorSummary() {
  try {
    const response = await fetch(`${DOCTOR_API_URL}/summary`);
    const data = await response.json();

    document.getElementById("totalDoctors").textContent = data.totalDoctors || 0;
    document.getElementById("totalDepartments").textContent = data.totalDepartments || 0;
    document.getElementById("totalSpecializations").textContent = data.totalSpecializations || 0;
  } catch (error) {
    console.error("Error loading doctor summary:", error);
  }
}

// Load department dropdown
async function loadDepartments() {
  try {
    const response = await fetch(`${DOCTOR_API_URL}/departments`);
    const departments = await response.json();

    const deptSelect = document.getElementById("DeptID");
    deptSelect.innerHTML = `<option value="">Select Department</option>`;

    departments.forEach((dept) => {
      const option = document.createElement("option");
      option.value = dept.DeptID;
      option.textContent = `${dept.DeptName} (${dept.DeptID})`;
      deptSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Error loading departments:", error);
  }
}

// Load all doctors
async function loadDoctors() {
  try {
    const response = await fetch(DOCTOR_API_URL);
    const doctors = await response.json();
    renderDoctors(doctors);
    loadDoctorSummary();
  } catch (error) {
    console.error("Error loading doctors:", error);
  }
}

// Search doctors
async function searchDoctors() {
  const searchValue = document.getElementById("doctorSearchInput").value.trim();

  if (!searchValue) {
    loadDoctors();
    return;
  }

  try {
    const response = await fetch(`${DOCTOR_API_URL}/search?q=${encodeURIComponent(searchValue)}`);
    const doctors = await response.json();
    renderDoctors(doctors);
  } catch (error) {
    console.error("Error searching doctors:", error);
  }
}

// Render doctors table
function renderDoctors(doctors) {
  const tableBody = document.getElementById("doctorTableBody");
  tableBody.innerHTML = "";

  if (!doctors || doctors.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center;">No doctors found</td>
      </tr>
    `;
    return;
  }

  doctors.forEach((doctor) => {
    const row = `
      <tr>
        <td>${doctor.DoctorID}</td>
        <td>${doctor.FullName || ""}</td>
        <td>${doctor.Specialization || ""}</td>
        <td>${doctor.DeptName || doctor.DeptID || ""}</td>
        <td>${doctor.Phone || ""}</td>
        <td>${doctor.Email || ""}</td>
        <td>
          <div class="action-buttons">
            <button class="edit-btn" onclick='editDoctor(${JSON.stringify(doctor)})'>Edit</button>
            <button class="delete-btn" onclick='deleteDoctor("${doctor.DoctorID}")'>Delete</button>
          </div>
        </td>
      </tr>
    `;
    tableBody.innerHTML += row;
  });
}

// Add or update doctor
document.getElementById("doctorForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const doctorData = {
    DoctorID: document.getElementById("DoctorID").value.trim(),
    DeptID: document.getElementById("DeptID").value,
    FullName: document.getElementById("FullName").value.trim(),
    Phone: document.getElementById("Phone").value.trim(),
    Email: document.getElementById("Email").value.trim(),
    Specialization: document.getElementById("Specialization").value.trim()
  };

  try {
    let response;

    if (editingDoctorId) {
      response = await fetch(`${DOCTOR_API_URL}/${editingDoctorId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(doctorData)
      });
    } else {
      response = await fetch(DOCTOR_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(doctorData)
      });
    }

    const result = await response.json();
    alert(result.message || result.error || "Operation completed");

    resetDoctorForm();
    loadDoctors();
  } catch (error) {
    console.error("Error saving doctor:", error);
    alert("Something went wrong while saving the doctor.");
  }
});

// Fill form for editing
function editDoctor(doctor) {
  editingDoctorId = doctor.DoctorID;

  document.getElementById("doctorFormTitle").textContent = "Edit Doctor";
  document.getElementById("doctorSubmitBtn").textContent = "Update Doctor";
  document.getElementById("doctorCancelEditBtn").style.display = "inline-block";

  document.getElementById("DoctorID").value = doctor.DoctorID;
  document.getElementById("DoctorID").disabled = true;

  document.getElementById("DeptID").value = doctor.DeptID || "";
  document.getElementById("FullName").value = doctor.FullName || "";
  document.getElementById("Phone").value = doctor.Phone || "";
  document.getElementById("Email").value = doctor.Email || "";
  document.getElementById("Specialization").value = doctor.Specialization || "";
}

// Cancel edit
document.getElementById("doctorCancelEditBtn").addEventListener("click", () => {
  resetDoctorForm();
});

// Reset form
function resetDoctorForm() {
  editingDoctorId = null;

  document.getElementById("doctorForm").reset();
  document.getElementById("DoctorID").disabled = false;
  document.getElementById("doctorFormTitle").textContent = "Add New Doctor";
  document.getElementById("doctorSubmitBtn").textContent = "Add Doctor";
  document.getElementById("doctorCancelEditBtn").style.display = "none";
}

// Delete doctor
async function deleteDoctor(doctorId) {
  const confirmDelete = confirm(
    `Are you sure you want to delete doctor ${doctorId}?\n\nWarning: If this doctor has linked records in Appointment, Prescription, or Lab_Order, deletion may fail.`
  );

  if (!confirmDelete) return;

  try {
    const response = await fetch(`${DOCTOR_API_URL}/${doctorId}`, {
      method: "DELETE"
    });

    const result = await response.json();
    alert(result.message || result.error || "Delete attempted");

    loadDoctors();
  } catch (error) {
    console.error("Error deleting doctor:", error);
    alert("Something went wrong while deleting the doctor.");
  }
}

// Initial load
loadDepartments();
loadDoctors();
loadDoctorSummary();