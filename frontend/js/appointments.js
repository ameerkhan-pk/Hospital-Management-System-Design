const APPOINTMENT_API_URL = "http://127.0.0.1:3001/api/appointments";

let editingAppointmentId = null;

// Load summary cards
async function loadAppointmentSummary() {
  try {
    const response = await fetch(`${APPOINTMENT_API_URL}/summary`);
    const data = await response.json();

    document.getElementById("totalAppointments").textContent = data.totalAppointments || 0;
    document.getElementById("scheduledAppointments").textContent = data.scheduledAppointments || 0;
    document.getElementById("completedAppointments").textContent = data.completedAppointments || 0;
  } catch (error) {
    console.error("Error loading appointment summary:", error);
  }
}

// Load patients dropdown
async function loadPatientsDropdown() {
  try {
    const response = await fetch(`${APPOINTMENT_API_URL}/patients`);
    const patients = await response.json();

    const patientSelect = document.getElementById("PatientID");
    patientSelect.innerHTML = `<option value="">Select Patient</option>`;

    patients.forEach((patient) => {
      const option = document.createElement("option");
      option.value = patient.PatientID;
      option.textContent = `${patient.PatientName} (${patient.PatientID})`;
      patientSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Error loading patients dropdown:", error);
  }
}

// Load doctors dropdown
async function loadDoctorsDropdown() {
  try {
    const response = await fetch(`${APPOINTMENT_API_URL}/doctors`);
    const doctors = await response.json();

    const doctorSelect = document.getElementById("DoctorID");
    doctorSelect.innerHTML = `<option value="">Select Doctor</option>`;

    doctors.forEach((doctor) => {
      const option = document.createElement("option");
      option.value = doctor.DoctorID;
      option.textContent = `${doctor.FullName} (${doctor.DeptName || doctor.DoctorID})`;
      doctorSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Error loading doctors dropdown:", error);
  }
}

// Load all appointments
async function loadAppointments() {
  try {
    const response = await fetch(APPOINTMENT_API_URL);
    const appointments = await response.json();
    renderAppointments(appointments);
    loadAppointmentSummary();
  } catch (error) {
    console.error("Error loading appointments:", error);
  }
}

// Search appointments
async function searchAppointments() {
  const searchValue = document.getElementById("appointmentSearchInput").value.trim();

  if (!searchValue) {
    loadAppointments();
    return;
  }

  try {
    const response = await fetch(`${APPOINTMENT_API_URL}/search?q=${encodeURIComponent(searchValue)}`);
    const appointments = await response.json();
    renderAppointments(appointments);
  } catch (error) {
    console.error("Error searching appointments:", error);
  }
}

// Render appointment table
function renderAppointments(appointments) {
  const tableBody = document.getElementById("appointmentTableBody");
  tableBody.innerHTML = "";

  if (!appointments || appointments.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align:center;">No appointments found</td>
      </tr>
    `;
    return;
  }

  appointments.forEach((appointment) => {
    const row = `
      <tr>
        <td>${appointment.AppointmentID}</td>
        <td>${appointment.PatientName || appointment.PatientID}</td>
        <td>${appointment.DoctorName || appointment.DoctorID}</td>
        <td>${appointment.DeptName || ""}</td>
        <td>${formatDateTime(appointment.ApptDateTime)}</td>
        <td>${appointment.Status || ""}</td>
        <td>${appointment.Reason || ""}</td>
        <td>
          <div class="action-buttons">
            <button class="edit-btn" onclick='editAppointment(${JSON.stringify(appointment)})'>Edit</button>
            <button class="delete-btn" onclick='deleteAppointment("${appointment.AppointmentID}")'>Delete</button>
          </div>
        </td>
      </tr>
    `;
    tableBody.innerHTML += row;
  });
}

// Add or update appointment
document.getElementById("appointmentForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const appointmentData = {
    AppointmentID: document.getElementById("AppointmentID").value.trim(),
    PatientID: document.getElementById("PatientID").value,
    DoctorID: document.getElementById("DoctorID").value,
    ApptDateTime: document.getElementById("ApptDateTime").value,
    Status: document.getElementById("Status").value,
    Reason: document.getElementById("Reason").value.trim()
  };

  try {
    let response;

    if (editingAppointmentId) {
      response = await fetch(`${APPOINTMENT_API_URL}/${editingAppointmentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(appointmentData)
      });
    } else {
      response = await fetch(APPOINTMENT_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(appointmentData)
      });
    }

    const result = await response.json();
    alert(result.message || result.error || "Operation completed");

    resetAppointmentForm();
    loadAppointments();
  } catch (error) {
    console.error("Error saving appointment:", error);
    alert("Something went wrong while saving the appointment.");
  }
});

// Fill form for editing
function editAppointment(appointment) {
  editingAppointmentId = appointment.AppointmentID;

  document.getElementById("appointmentFormTitle").textContent = "Edit Appointment";
  document.getElementById("appointmentSubmitBtn").textContent = "Update Appointment";
  document.getElementById("appointmentCancelEditBtn").style.display = "inline-block";

  document.getElementById("AppointmentID").value = appointment.AppointmentID;
  document.getElementById("AppointmentID").disabled = true;

  document.getElementById("PatientID").value = appointment.PatientID || "";
  document.getElementById("DoctorID").value = appointment.DoctorID || "";
  document.getElementById("ApptDateTime").value = formatForDateTimeLocal(appointment.ApptDateTime);
  document.getElementById("Status").value = appointment.Status || "";
  document.getElementById("Reason").value = appointment.Reason || "";
}

// Cancel edit
document.getElementById("appointmentCancelEditBtn").addEventListener("click", () => {
  resetAppointmentForm();
});

// Reset form
function resetAppointmentForm() {
  editingAppointmentId = null;

  document.getElementById("appointmentForm").reset();
  document.getElementById("AppointmentID").disabled = false;
  document.getElementById("appointmentFormTitle").textContent = "Add New Appointment";
  document.getElementById("appointmentSubmitBtn").textContent = "Add Appointment";
  document.getElementById("appointmentCancelEditBtn").style.display = "none";
}

// Delete appointment
async function deleteAppointment(appointmentId) {
  const confirmDelete = confirm(
    `Are you sure you want to delete appointment ${appointmentId}?`
  );

  if (!confirmDelete) return;

  try {
    const response = await fetch(`${APPOINTMENT_API_URL}/${appointmentId}`, {
      method: "DELETE"
    });

    const result = await response.json();
    alert(result.message || result.error || "Delete attempted");

    loadAppointments();
  } catch (error) {
    console.error("Error deleting appointment:", error);
    alert("Something went wrong while deleting the appointment.");
  }
}

// Helpers
function formatDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  return date.toLocaleString();
}

function formatForDateTimeLocal(value) {
  if (!value) return "";
  const date = new Date(value);
  const pad = (num) => String(num).padStart(2, "0");

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// Initial load
loadPatientsDropdown();
loadDoctorsDropdown();
loadAppointments();
loadAppointmentSummary();