const reportsPerPage = 5;
let currentPage = 1;
let reports = [];

async function fetchReports() {
    const token = localStorage.getItem("accessToken");
    if (!token) {
        alert("Bạn chưa đăng nhập! Đang chuyển hướng...");
        window.location.href = "login.html"; // Trang login
        return;
    }

    const res = await fetch("http://localhost:8080/api/admin/reports", {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    if (!res.ok) {
        console.error("Lỗi khi gọi API:", res.status, res.statusText);
        return;
    }

    const data = await res.json();
    if (data.success) {
        reports = data.data;
        renderTable();
        renderPagination();
    }
}

function renderTable() {
    const tbody = document.getElementById("reportTableBody");
    tbody.innerHTML = "";

    const start = (currentPage - 1) * reportsPerPage;
    const end = start + reportsPerPage;
    const paginatedReports = reports.slice(start, end);

    paginatedReports.forEach(r => {
        let statusIcon = r.reportStatus === 'PENDING'
            ? '<span class="badge bg-warning text-dark"><i class="bi bi-hourglass-split"></i> Đang chờ</span>'
            : '<span class="badge bg-success"><i class="bi bi-check-circle"></i> Đã xử lý</span>';

        let typeIcon = r.reportTypeName === 'Spam'
            ? '<i class="bi bi-exclamation-circle text-danger"></i>'
            : '<i class="bi bi-flag text-primary"></i>';

        let actionBtn = '';
        if (r.reportStatus === 'PENDING') {
            actionBtn = `<button class="btn btn-sm btn-success" onclick="updateStatus(${r.reportId})" title="Duyệt báo cáo">
                <i class="bi bi-check-lg"></i> Duyệt
               </button>`;
        } else if (r.reportStatus === 'RESOLVED') {
            actionBtn = `<button class="btn btn-sm btn-warning" onclick="undoStatus(${r.reportId})" title="Hoàn tác">
                <i class="bi bi-arrow-counterclockwise"></i> Hoàn tác
               </button>`;
        } else {
            actionBtn = `<span class="text-muted"><i class="bi bi-lock"></i></span>`;
        }

        tbody.innerHTML += `
            <tr>
                <td class="text-center">${r.reportId}</td>
                <td class="text-center"><i class="bi bi-person"></i> ${r.reporterFullName}</td>
                <td class="text-center"><i class="bi bi-person-x"></i> ${r.reportedFullName}</td>
                <td class="text-center">${typeIcon} ${r.reportTypeName}</td>
                <td class="text-center">${r.detail}</td>
                <td class="text-center">${statusIcon}</td>
                <td class="text-center"><i class="bi bi-calendar"></i> ${r.reportDate ? new Date(r.reportDate).toLocaleString() : ''}</td>
                <td class="text-center"><i class="bi bi-calendar-check"></i> ${r.reviewDate ? new Date(r.reviewDate).toLocaleString() : ''}</td>
                <td class="text-center"><i class="bi bi-person-badge"></i> ${r.reviewerFullName ?? ''}</td>
                <td class="text-center">${actionBtn}</td>
            </tr>
        `;
    });
}

function renderPagination() {
    const totalPages = Math.ceil(reports.length / reportsPerPage);
    const pagination = document.getElementById("pagination");
    pagination.innerHTML = "";

    for (let i = 1; i <= totalPages; i++) {
        pagination.innerHTML += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" onclick="goToPage(${i})">${i}</a>
            </li>
        `;
    }
}

function goToPage(page) {
    currentPage = page;
    renderTable();
    renderPagination();
}

async function updateStatus(reportId) {
    const token = localStorage.getItem("accessToken");
    if (!token) {
        alert("Bạn chưa đăng nhập!");
        return;
    }

    const res = await fetch("http://localhost:8080/api/admin/reports/check", {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ reportId: reportId, statusReport: "RESOLVED" })
    });

    const data = await res.json();
    if (data.success) {
        showToast("Duyệt báo cáo thành công!");
    } else {
        showToast("Có lỗi xảy ra, vui lòng thử lại sau.", "danger");
    }

    await fetchReports();
}

async function undoStatus(reportId) {
    const token = localStorage.getItem("accessToken");
    if (!token) {
        alert("Bạn chưa đăng nhập!");
        return;
    }

    const res = await fetch("http://localhost:8080/api/admin/reports/check", {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ reportId: reportId, statusReport: "PENDING" })
    });

    const data = await res.json();
    if (data.success) {
        showToast("Hoàn tác báo cáo thành công!");
    } else {
        showToast("Có lỗi khi hoàn tác!", "danger");
    }

    await fetchReports();
}

function showToast(message, type = "success") {
    const toastContainer = document.getElementById("toastContainer");
    const toastId = "toast-" + Date.now() + Math.random();
    const bg = type === "success" ? "bg-success" : "bg-danger";
    const icon = type === "success"
        ? '<i class="bi bi-check-circle-fill"></i>'
        : '<i class="bi bi-exclamation-triangle-fill"></i>';

    const toast = document.createElement("div");
    toast.className = `toast align-items-center text-white ${bg} mb-2`;
    toast.id = toastId;
    toast.setAttribute("role", "alert");
    toast.setAttribute("aria-live", "assertive");
    toast.setAttribute("aria-atomic", "true");
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${icon} ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;
    toastContainer.appendChild(toast);

    const bsToast = new bootstrap.Toast(toast, { delay: 3000 });
    bsToast.show();

    setTimeout(() => {
        toast.remove();
    }, 3200);
}

// Đảm bảo hàm có thể gọi từ HTML
window.undoStatus = undoStatus;

fetchReports();
