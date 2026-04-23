const BILL_API_URL = "http://127.0.0.1:3001/api/bills";

let editingBillId = null;
let selectedBillId = null;

// Load summary cards
async function loadBillSummary() {
  try {
    const response = await fetch(`${BILL_API_URL}/summary`);
    const data = await response.json();

    document.getElementById("totalBills").textContent = data.totalBills || 0;
    document.getElementById("paidBills").textContent = data.paidBills || 0;
    document.getElementById("unpaidOrPartialBills").textContent = data.unpaidOrPartialBills || 0;
  } catch (error) {
    console.error("Error loading bill summary:", error);
  }
}

// Load patients dropdown
async function loadBillPatientsDropdown() {
  try {
    const response = await fetch(`${BILL_API_URL}/patients`);
    const patients = await response.json();

    const patientSelect = document.getElementById("BillPatientID");
    patientSelect.innerHTML = `<option value="">Select Patient</option>`;

    patients.forEach((patient) => {
      const option = document.createElement("option");
      option.value = patient.PatientID;
      option.textContent = `${patient.PatientName} (${patient.PatientID})`;
      patientSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Error loading bill patients dropdown:", error);
  }
}

// Load admissions dropdown
async function loadAdmissionsDropdown() {
  try {
    const response = await fetch(`${BILL_API_URL}/admissions`);
    const admissions = await response.json();

    const admissionSelect = document.getElementById("AdmissionID");
    admissionSelect.innerHTML = `<option value="">Select Admission (optional)</option>`;

    admissions.forEach((admission) => {
      const option = document.createElement("option");
      option.value = admission.AdmissionID;
      option.textContent = `${admission.AdmissionID} (${admission.PatientID})`;
      admissionSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Error loading admissions dropdown:", error);
  }
}

// Load bill IDs for payment dropdown
async function loadBillIdsDropdown() {
  try {
    const response = await fetch(BILL_API_URL);
    const bills = await response.json();

    const billSelect = document.getElementById("PaymentBillID");
    billSelect.innerHTML = `<option value="">Select Bill</option>`;

    bills.forEach((bill) => {
      const option = document.createElement("option");
      option.value = bill.BillID;
      option.textContent = `${bill.BillID} - ${bill.PatientName}`;
      billSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Error loading bill IDs dropdown:", error);
  }
}

// Load all bills
async function loadBills() {
  try {
    const response = await fetch(BILL_API_URL);
    const bills = await response.json();
    renderBills(bills);
    loadBillSummary();
    loadBillIdsDropdown();
  } catch (error) {
    console.error("Error loading bills:", error);
  }
}

// Search bills
async function searchBills() {
  const searchValue = document.getElementById("billSearchInput").value.trim();

  if (!searchValue) {
    loadBills();
    return;
  }

  try {
    const response = await fetch(`${BILL_API_URL}/search?q=${encodeURIComponent(searchValue)}`);
    const bills = await response.json();
    renderBills(bills);
  } catch (error) {
    console.error("Error searching bills:", error);
  }
}

// Render bills table
function renderBills(bills) {
  const tableBody = document.getElementById("billTableBody");
  tableBody.innerHTML = "";

  if (!bills || bills.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align:center;">No bills found</td>
      </tr>
    `;
    return;
  }

  bills.forEach((bill) => {
    const row = `
      <tr onclick="loadPaymentsForBill('${bill.BillID}')" style="cursor:pointer;">
        <td>${bill.BillID}</td>
        <td>${bill.PatientName || bill.PatientID}</td>
        <td>${bill.AdmissionID || ""}</td>
        <td>${formatDate(bill.BillDate)}</td>
        <td>${formatMoney(bill.TotalAmount)}</td>
        <td>${bill.Status || ""}</td>
        <td>${formatMoney(bill.AmountPaid)}</td>
        <td>${formatMoney(bill.Balance)}</td>
        <td>
          <div class="action-buttons">
            <button class="edit-btn" onclick='event.stopPropagation(); editBill(${JSON.stringify(bill)})'>Edit</button>
            <button class="delete-btn" onclick='event.stopPropagation(); deleteBill("${bill.BillID}")'>Delete</button>
          </div>
        </td>
      </tr>
    `;
    tableBody.innerHTML += row;
  });
}

// Load payments for selected bill
async function loadPaymentsForBill(billId) {
  selectedBillId = billId;

  try {
    const response = await fetch(`${BILL_API_URL}/${billId}/payments`);
    const payments = await response.json();

    const tableBody = document.getElementById("paymentTableBody");
    tableBody.innerHTML = "";

    if (!payments || payments.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align:center;">No payments found for ${billId}</td>
        </tr>
      `;
      return;
    }

    payments.forEach((payment) => {
      const row = `
        <tr>
          <td>${payment.PaymentID}</td>
          <td>${payment.BillID}</td>
          <td>${formatDate(payment.PaymentDate)}</td>
          <td>${formatMoney(payment.AmountPaid)}</td>
          <td>${payment.Method || ""}</td>
        </tr>
      `;
      tableBody.innerHTML += row;
    });
  } catch (error) {
    console.error("Error loading payments:", error);
  }
}

// Add or update bill
document.getElementById("billForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const billData = {
    BillID: document.getElementById("BillID").value.trim(),
    PatientID: document.getElementById("BillPatientID").value,
    AdmissionID: document.getElementById("AdmissionID").value,
    BillDate: document.getElementById("BillDate").value,
    TotalAmount: document.getElementById("TotalAmount").value,
    Status: document.getElementById("BillStatus").value
  };

  try {
    let response;

    if (editingBillId) {
      response = await fetch(`${BILL_API_URL}/${editingBillId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(billData)
      });
    } else {
      response = await fetch(BILL_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(billData)
      });
    }

    const result = await response.json();
    alert(result.message || result.error || "Operation completed");

    resetBillForm();
    loadBills();
  } catch (error) {
    console.error("Error saving bill:", error);
    alert("Something went wrong while saving the bill.");
  }
});

// Record payment
document.getElementById("paymentForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const paymentData = {
    PaymentID: document.getElementById("PaymentID").value.trim(),
    BillID: document.getElementById("PaymentBillID").value,
    PaymentDate: document.getElementById("PaymentDate").value,
    AmountPaid: document.getElementById("AmountPaid").value,
    Method: document.getElementById("PaymentMethod").value
  };

  try {
    const response = await fetch(`${BILL_API_URL}/payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(paymentData)
    });

    const result = await response.json();
    alert(result.message || result.error || "Payment recorded");

    document.getElementById("paymentForm").reset();
    loadBills();

    if (paymentData.BillID) {
      loadPaymentsForBill(paymentData.BillID);
    }
  } catch (error) {
    console.error("Error recording payment:", error);
    alert("Something went wrong while recording the payment.");
  }
});

// Fill form for editing
function editBill(bill) {
  editingBillId = bill.BillID;

  document.getElementById("billFormTitle").textContent = "Edit Bill";
  document.getElementById("billSubmitBtn").textContent = "Update Bill";
  document.getElementById("billCancelEditBtn").style.display = "inline-block";

  document.getElementById("BillID").value = bill.BillID;
  document.getElementById("BillID").disabled = true;

  document.getElementById("BillPatientID").value = bill.PatientID || "";
  document.getElementById("AdmissionID").value = bill.AdmissionID || "";
  document.getElementById("BillDate").value = formatDateForInput(bill.BillDate);
  document.getElementById("TotalAmount").value = bill.TotalAmount || "";
  document.getElementById("BillStatus").value = bill.Status || "";
}

// Cancel edit
document.getElementById("billCancelEditBtn").addEventListener("click", () => {
  resetBillForm();
});

// Reset bill form
function resetBillForm() {
  editingBillId = null;

  document.getElementById("billForm").reset();
  document.getElementById("BillID").disabled = false;
  document.getElementById("billFormTitle").textContent = "Add New Bill";
  document.getElementById("billSubmitBtn").textContent = "Add Bill";
  document.getElementById("billCancelEditBtn").style.display = "none";
}

// Delete bill
async function deleteBill(billId) {
  const confirmDelete = confirm(
    `Are you sure you want to delete bill ${billId}?\n\nRelated payment records will also be deleted.`
  );

  if (!confirmDelete) return;

  try {
    const response = await fetch(`${BILL_API_URL}/${billId}`, {
      method: "DELETE"
    });

    const result = await response.json();
    alert(result.message || result.error || "Delete attempted");

    if (selectedBillId === billId) {
      document.getElementById("paymentTableBody").innerHTML = "";
    }

    loadBills();
  } catch (error) {
    console.error("Error deleting bill:", error);
    alert("Something went wrong while deleting the bill.");
  }
}

// Helpers
function formatDate(value) {
  if (!value) return "";
  return new Date(value).toISOString().split("T")[0];
}

function formatDateForInput(value) {
  if (!value) return "";
  return new Date(value).toISOString().split("T")[0];
}

function formatMoney(value) {
  const number = Number(value || 0);
  return `$${number.toFixed(2)}`;
}

// Initial load
loadBillPatientsDropdown();
loadAdmissionsDropdown();
loadBillIdsDropdown();
loadBills();
loadBillSummary();