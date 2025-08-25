// reports.js
const reportsPerPage = 5;
let currentPage = 1;
let reports = [];

/* ================= Fetch dữ liệu ================= */
async function fetchReports() {
    const token = localStorage.getItem("accessToken");
    // if (!token) {
    //     alert("Bạn chưa đăng nhập! Đang chuyển hướng...");
    //     window.location.href = "../login.html";
    //     return;
    // }

    try {
        const res = await fetch("http://localhost:8080/api/admin/reports", {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!res.ok) {
            console.error("Lỗi khi gọi API:", res.status, res.statusText);
            return;
        }

        const data = await res.json();
        if (data.success) {
            reports = data.data || [];
            renderTable();
            renderPagination();
        }
    } catch (err) {
        console.error("Có lỗi khi tải reports:", err);
    }
}

/* ================= Render bảng ================= */
function renderTable() {
    const tbody = document.getElementById("reportTableBody");
    tbody.innerHTML = "";

    const start = (currentPage - 1) * reportsPerPage;
    const end = start + reportsPerPage;
    const paginatedReports = reports.slice(start, end);

    // Đếm số lần bị báo cáo theo reportedId
    const reportedCountMap = countReportedTimes(reports);

    paginatedReports.forEach(r => {
        const statusIcon = r.reportStatus === 'PENDING'
            ? '<span class="badge bg-warning text-dark"><i class="bi bi-hourglass-split"></i> Đang chờ</span>'
            : r.reportStatus === 'RESOLVED'
                ? '<span class="badge bg-success"><i class="bi bi-check-circle"></i> Đã xử lý</span>'
                : '<span class="badge bg-secondary"><i class="bi bi-x-circle"></i> Từ chối</span>';

        const typeIcon = r.reportTypeName === 'Spam'
            ? '<i class="bi bi-exclamation-circle text-danger"></i>'
            : '<i class="bi bi-flag text-primary"></i>';

        let actionBtn = '';
        if (r.reportStatus === 'PENDING') {
            actionBtn = `
                <button class="btn btn-sm btn-success" onclick="updateStatus('${r.reportedId}', 'block')" title="Khóa tài khoản">
                    <i class="bi bi-person-x"></i> Khóa
                </button>`;
        } else if (r.reportStatus === 'RESOLVED') {
            actionBtn = `
                <button class="btn btn-sm btn-warning" onclick="undoStatus('${r.reportedId}')" title="Kích hoạt lại">
                    <i class="bi bi-person-check"></i> Kích hoạt lại
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
                <td class="text-center"><span class="badge bg-danger">${reportedCountMap[r.reportedId] || 0}</span></td>
                <td class="text-center">${actionBtn}</td>
            </tr>
        `;
    });
}

/* ================= Render phân trang ================= */
function renderPagination() {
    const totalPages = Math.ceil(reports.length / reportsPerPage);
    const pagination = document.getElementById("pagination");
    pagination.innerHTML = "";

    if (totalPages <= 1) return;

    // Nút prev
    pagination.innerHTML += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <button class="page-link" onclick="goToPage(${currentPage - 1})" aria-label="Previous" type="button">
                <i class="bi bi-chevron-left"></i>
            </button>
        </li>
    `;

    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, currentPage + 2);

    if (start > 1) {
        pagination.innerHTML += `
            <li class="page-item"><button class="page-link" onclick="goToPage(1)" type="button">1</button></li>
            <li class="page-item disabled"><span class="page-link">...</span></li>
        `;
    }

    for (let i = start; i <= end; i++) {
        pagination.innerHTML += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <button class="page-link" onclick="goToPage(${i})" type="button">${i}</button>
            </li>
        `;
    }

    if (end < totalPages) {
        pagination.innerHTML += `
            <li class="page-item disabled"><span class="page-link">...</span></li>
            <li class="page-item"><button class="page-link" onclick="goToPage(${totalPages})" type="button">${totalPages}</button></li>
        `;
    }

    // Nút next
    pagination.innerHTML += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <button class="page-link" onclick="goToPage(${currentPage + 1})" aria-label="Next" type="button">
                <i class="bi bi-chevron-right"></i>
            </button>
        </li>
    `;
}

function goToPage(page) {
    currentPage = page;
    renderTable();
    renderPagination();
}

/* ================= API cập nhật user ================= */
async function undoStatus(userId) {
    await changeUserStatus(userId, "active", "Kích hoạt lại tài khoản thành công!");
}

async function updateStatus(userId, status = "block") {
    const msg = status === "block" ? "Khóa tài khoản thành công!" : "Cập nhật trạng thái thành công!";
    await changeUserStatus(userId, status, msg);
}

async function changeUserStatus(userId, status, successMsg) {
    const token = localStorage.getItem("accessToken");
    if (!token) {
        alert("Bạn chưa đăng nhập!");
        return;
    }

    try {
        const res = await fetch(`http://localhost:8080/api/admin/users/${userId}`, {
            method: "PATCH",
            headers: { "Authorization": `Bearer ${token}` }
        });

        const data = await res.json();
        if (data.success) {
            showToast(successMsg);
        } else {
            showToast("Có lỗi xảy ra, vui lòng thử lại.", "danger");
        }
        await fetchReports();
    } catch (err) {
        console.error("Lỗi update status:", err);
        showToast("Lỗi hệ thống!", "danger");
    }
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
            <div class="toast-body">${icon} ${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto"
                    data-bs-dismiss="toast" aria-label="Đóng"></button>
        </div>
    `;
    toastContainer.appendChild(toast);

    const bsToast = new bootstrap.Toast(toast, { delay: 3000 });
    bsToast.show();

    setTimeout(() => toast.remove(), 3200);
}

/* ================= Helper ================= */
function countReportedTimes(reports) {
    // Đếm số lần bị báo cáo theo reportedId
    const countMap = {};
    reports.forEach(r => {
        const key = r.reportedId;
        countMap[key] = (countMap[key] || 0) + 1;
    });
    return countMap;
}

/* ================= Expose & Init ================= */
window.undoStatus = undoStatus;
window.updateStatus = updateStatus;

fetchReports();
