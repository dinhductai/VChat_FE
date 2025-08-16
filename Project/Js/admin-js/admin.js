token = localStorage.getItem("accessToken");
let currentUserId = null;
window.addEventListener("DOMContentLoaded", () => {
  // gọi lần đầu
  loadUsers(0);

  // gọi lại mỗi khi đổi option
  const elStatus = document.getElementById("status");
  const elGender = document.getElementById("gender");
  const elSort = document.getElementById("sort");
  const elKeyword = document.getElementById("keyword");

  [elStatus, elGender, elSort].forEach((el) => {
    if (el) el.addEventListener("change", () => loadUsers(0));
  });

  // nếu có ô từ khoá: debounce để không gọi API liên tục khi đang gõ
  if (elKeyword) {
    let t;
    elKeyword.addEventListener("input", () => {
      clearTimeout(t);
      t = setTimeout(() => loadUsers(0), 300);
    });
  }
});

async function getAllUsers(page, size) {
  const elStatus = document.getElementById("status")?.value?.trim() ?? "";
  const elGender = document.getElementById("gender")?.value?.trim() ?? "";
  const elSort = document.getElementById("sort")?.value?.trim() ?? "";
  const elKeyword = document.getElementById("keyword")?.value?.trim() ?? "";

  // Build query an toàn (tự encode, bỏ param rỗng)
  const params = new URLSearchParams();
  params.set("page", page);
  params.set("size", size);
  if (elStatus) params.set("status", elStatus);
  if (elGender) params.set("gender", elGender);
  if (elSort) params.set("sort", elSort);
  if (elKeyword) params.set("keyword", elKeyword);

  const response = await fetch(
    `http://localhost:8080/api/admin/users?${params.toString()}`,
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
    ${user.accountStatus === "ACTIVE" ? "Active" : "Blocked"}
  </div>
</td>

                <td>
                  <div class="d-flex gap-2">
                    <button class="btn btn-info btn-sm flex-fill">
                      <i class="bi bi-eye-fill"></i>
                    </button>
                    <button
                      class="btn btn-warning btn-sm flex-fill"
                      data-user-id="${user.userId}"
                      data-bs-toggle="modal"
                      data-bs-target="#editModal"
                      onclick="getUserById(${user.userId})"
                    >
                      <i class="bi bi-pencil-square"></i>
                    </button>
                    <button class="btn btn-danger btn-sm flex-fill" onclick="deleteUser(${
                      user.userId
                    })">
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
  prev.innerHTML = `<button class="page-link">Previous</button>`;
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
  next.innerHTML = `<button class="page-link">Next</button>`;
  next.addEventListener("click", () => {
    if (currentPage < totalPages - 1) loadUsers(currentPage + 1);
  });
  pagination.appendChild(next);
}

async function updateStatus() {
  try {
    const response = await fetch(
      `http://localhost:8080/api/admin/users/${currentUserId}?status=`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log(result.message); // hoặc hiển thị lên UI

    // Nếu muốn cập nhật giao diện
    // refreshUserList();
    loadUsers(0);
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái:", error);
    alert("Cập nhật trạng thái thất bại!");
  }
}

async function getUserById(userId) {
  try {
    const response = await fetch(
      `http://localhost:8080/api/admin/users/${userId}/edit`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log(result.data); // hoặc hiển thị lên UI
    currentUserId = result.data.userId;
    document.getElementById("user-name").value = result.data.email;
    document.getElementById("email").value = result.data.email;
    document.getElementById("fullName").value = result.data.fullName;
    document.getElementById("phone").value = result.data.phoneNumber;
    document.getElementById("dob").value = result.data.birthDate;
    document.getElementById("genderEdit").value = result.data.gender;
    document.getElementById("address").value = result.data.location;
    document.getElementById("admin-note").value = "";
    document.getElementById("image").src = result.data.photoUrl;
    document.getElementById("statusEdit").value = result.data.accountStatus;

    // Nếu muốn cập nhật giao diện
    // refreshUserList();
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái:", error);
    alert("Lấy thông tin người dùng thất bại!");
  }
}

document
  .getElementById("editUserForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    if (!currentUserId) {
      Swal.fire({
        title: "Thiếu thông tin",
        text: "Không tìm thấy userId.",
        icon: "warning",
      });
      return;
    }

    // Thu thập dữ liệu từ form
    const body = {
      email: document.getElementById("email").value.trim(),
      fullName: document.getElementById("fullName").value.trim(),
      phoneNumber: document.getElementById("phone").value.trim(),
      birthDate: document.getElementById("dob").value || null,
      gender: document.getElementById("genderEdit").value,
      location: document.getElementById("address").value.trim(),
      description: document.getElementById("introduce").value.trim(),
      accountStatus: document.getElementById("statusEdit").value,
    };

    // Hỏi xác nhận
    const confirmResult = await Swal.fire({
      title: "Confirm Save Changes?",
      text: "Are you sure you want to update this user's information?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Save",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!confirmResult.isConfirmed) return;

    try {
      // Hiện trạng thái đang lưu
      Swal.fire({
        title: "Saving...",
        html: "Please wait a moment.",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => Swal.showLoading(),
      });

      const res = await fetch(
        `http://localhost:8080/api/admin/users/${currentUserId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        }
      );

      // Thử lấy message từ server
      let serverMsg = "";
      try {
        const data = await res.json();
        serverMsg = data?.message || "";
      } catch (_) {
        // nếu không phải JSON, bỏ qua
      }

      if (!res.ok) {
        throw new Error(serverMsg || `HTTP ${res.status}`);
      }

      // Thành công
      await Swal.fire({
        title: "Thành công!",
        text: serverMsg || "Cập nhật thành công!",
        icon: "success",
        timer: 1800,
        showConfirmButton: false,
      });

      // Đóng modal
      const modalEl = document.getElementById("editModal");
      const modalInstance =
        bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
      modalInstance.hide();

      // Load lại danh sách
      loadUsers(0);
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: "Update Failed!",
        text: err.message || "Something went wrong during the update.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  });

async function deleteUser(userId) {
  // Hộp thoại xác nhận
  const confirmResult = await Swal.fire({
    title: "Delete Confirmation",
    text: "Are you sure you want to delete this user?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Delete",
    cancelButtonText: "Cancel",
    reverseButtons: true,
  });

  if (!confirmResult.isConfirmed) return;

  try {
    const res = await fetch(`http://localhost:8080/api/admin/users/${userId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || `HTTP ${res.status}`);
    }

    Swal.fire({
      title: "Success!",
      text: "The user has been deleted.",
      icon: "success",
      confirmButtonText: "OK",
      timer: 2000,
      timerProgressBar: true,
    });

    loadUsers(0);
  } catch (err) {
    Swal.fire({
      title: "Failed!",
      text: "Could not delete the user: " + err.message,
      icon: "error",
      confirmButtonText: "OK",
    });
  }
}

// Submit Add User (JSON theo DTO)
document
  .getElementById("addUserForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const fullName = document.getElementById("fullNameAdd").value.trim();
    const email = document.getElementById("emailAdd").value.trim();
    const phoneNumber = document.getElementById("phoneAdd").value.trim();
    const birthDate = document.getElementById("dobAdd").value || null; // yyyy-MM-dd
    const gender = document.getElementById("genderAdd").value;
    const accountStatus = document.getElementById("statusAdd").value;
    const roleName = document.getElementById("roleAdd").value;
    const location = document.getElementById("addressAdd").value.trim();
    const description = document.getElementById("descriptionAdd").value.trim();
    const password = document.getElementById("passwordAdd").value;
    const passwordConfirm = document.getElementById("passwordConfirmAdd").value;

    const interestRaw = document.getElementById("interestsAdd").value.trim();
    const interestName = interestRaw
      ? interestRaw
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    // Validate cơ bản
    if (
      !fullName ||
      !email ||
      !password ||
      !passwordConfirm ||
      !gender ||
      !accountStatus ||
      !roleName
    ) {
      Swal.fire({
        title: "Missing fields",
        text: "Please fill all required fields.",
        icon: "warning",
      });
      return;
    }
    if (password !== passwordConfirm) {
      Swal.fire({
        title: "Password mismatch",
        text: "Password and confirmation do not match.",
        icon: "error",
      });
      return;
    }

    // Xác nhận
    const cf = await Swal.fire({
      title: "Create this user?",
      text: "A new user account will be created.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Create",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });
    if (!cf.isConfirmed) return;

    // Body theo DTO đã cho
    const body = {
      fullName,
      password,
      passwordConfirm,
      birthDate,
      location,
      description,
      interestName, // List<String>
      phoneNumber,
      email,
      gender, // Gender enum
      accountStatus, // AccountStatus enum
      roleName, // RoleName enum
    };

    try {
      Swal.fire({
        title: "Saving...",
        html: "Please wait while we create the user.",
        didOpen: () => Swal.showLoading(),
        allowOutsideClick: false,
      });

      const res = await fetch(`http://localhost:8080/api/admin/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // đảm bảo biến token tồn tại
        },
        body: JSON.stringify(body),
      });

      let payload = null;
      try {
        payload = await res.json();
      } catch (_) {}

      if (!res.ok) {
        const msg = payload?.message || `HTTP ${res.status}`;
        throw new Error(msg);
      }

      await Swal.fire({
        title: "Success!",
        text: payload?.message || "User created successfully.",
        icon: "success",
        timer: 1600,
        showConfirmButton: false,
      });

      // Đóng modal + refresh list
      const modalEl = document.getElementById("addUserModal");
      const modalInstance =
        bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
      modalInstance.hide();

      document.getElementById("addUserForm").reset();
      if (typeof loadUsers === "function") loadUsers(0); // reload bảng
    } catch (err) {
      Swal.fire({
        title: "Create Failed!",
        text: err.message || "An error occurred.",
        icon: "error",
      });
    }
  });

// Preview ảnh ở modal Edit (đoạn này bạn đã có)
document.getElementById("image").addEventListener("change", function (e) {
  const file = e.target.files[0];
  const preview = document.getElementById("previewImage");
  if (file) {
    const reader = new FileReader();
    reader.onload = (e2) => {
      preview.src = e2.target.result;
      preview.style.display = "block";
    };
    reader.readAsDataURL(file);
  } else {
    preview.src = "#";
    preview.style.display = "none";
  }
});
