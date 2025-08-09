token = localStorage.getItem("accessToken");

window.addEventListener("DOMContentLoaded", () => {
  loadUsers(0); // Tải trang đầu tiên
});

async function getAllUsers(page, size) {
  const response = await fetch(
    `http://localhost:8080/api/admin/users?page=${page}&size=${size}`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!response.ok) {
    throw new Error(`Lỗi HTTP ${response.status}`);
  }

  const result = await response.json();
  if (result.success && result.data && Array.isArray(result.data.content)) {
    return {
      users: result.data.content,
      pageInfo: result.data.page,
    };
  } else {
    return {
      users: [],
      pageInfo: null,
    };
  }
}

function renderTable(users) {
  const tbody = document.querySelector("#userTable tbody");
  tbody.innerHTML = ""; // xoá bảng cũ

  users.forEach((user, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
                <td>${user.userId}</td>
                <td>${user.fullName}</td>
                <td>${user.email}</td>
                <td>${user.phone}</td>
                <td>${user.registrationDate}</td>
<td class="text-center">
  <div class="d-inline-block ${
    user.accountStatus === "ACTIVE" ? "bg-success" : "bg-danger"
  } text-white px-2 py-1 rounded text-center" style="width: 80px">
    ${user.accountStatus === "ACTIVE" ? "Active" : "Inactive"}
  </div>
</td>

                <td>
                  <div class="d-flex gap-2">
                    <button class="btn btn-info btn-sm flex-fill">
                      <i class="bi bi-eye-fill"></i>
                    </button>
                    <button
                      class="btn btn-warning btn-sm flex-fill"
                      data-bs-toggle="modal"
                      data-bs-target="#editModal"
                    >
                      <i class="bi bi-pencil-square"></i>
                    </button>
                    <button class="btn btn-danger btn-sm flex-fill">
                      <i class="bi bi-trash3"></i>
                    </button>
                  </div>
                </td>
    `;
    tbody.appendChild(row);
  });
}

async function loadUsers(page) {
  try {
    const { users, pageInfo } = await getAllUsers(page, 10);
    renderTable(users);
    if (pageInfo) renderPagination(pageInfo);
  } catch (err) {
    console.error("Lỗi khi tải trang:", err);
  }
}

function renderPagination(pageInfo) {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  const currentPage = pageInfo.number;
  const totalPages = pageInfo.totalPages;

  // Nút Trước
  const prev = document.createElement("li");
  prev.className = `page-item ${currentPage === 0 ? "disabled" : ""}`;
  prev.innerHTML = `<button class="page-link">Trước</button>`;
  prev.addEventListener("click", () => {
    if (currentPage > 0) loadUsers(currentPage - 1);
  });
  pagination.appendChild(prev);

  // Các số trang
  for (let i = 0; i < totalPages; i++) {
    const pageItem = document.createElement("li");
    pageItem.className = `page-item ${i === currentPage ? "active" : ""}`;
    pageItem.innerHTML = `<button class="page-link">${i + 1}</button>`;
    pageItem.addEventListener("click", () => loadUsers(i));
    pagination.appendChild(pageItem);
  }

  // Nút Sau
  const next = document.createElement("li");
  next.className = `page-item ${
    currentPage === totalPages - 1 ? "disabled" : ""
  }`;
  next.innerHTML = `<button class="page-link">Sau</button>`;
  next.addEventListener("click", () => {
    if (currentPage < totalPages - 1) loadUsers(currentPage + 1);
  });
  pagination.appendChild(next);
}
