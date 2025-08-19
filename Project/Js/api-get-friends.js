token = localStorage.getItem("accessToken");
console.log(token);
let currentPage = 0;
let totalPages = 1;
let loading = false;

let allFriendsPage = 0;
let allFriendsTotalPages = 1;
let allFriendsLoading = false;

let suggestPage = 0;
let suggestTotalPages = 1;
let suggestLoading = false;

let friendRequestPage = 0;
let friendRequestTotalPages = 1;
let friendRequestLoading = false;

async function getFriends(page, type) {
  try {
    const response = await fetch(
      `http://localhost:8080/api/user/friends?page=${page}&size=10&type=${type}`,
      {
        method: "GET",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data; // trả về dữ liệu cho nơi gọi hàm xử lý
  } catch (error) {
    console.error("Error fetching friends:", error);
    return null; // hoặc return [] nếu muốn luôn trả về mảng
  }
}

async function loadHomeFriends(page = 0) {
  if (page === 0) {
    const friendList = document.getElementById("friendContainer");
    if (friendList) friendList.innerHTML = "";
  }
  if (loading || page >= totalPages) return;

  loading = true;
  const spinner = document.getElementById("loadingSpinner");
  if (spinner) spinner.style.display = "block";

  try {
    const data = await getFriends(page, "random"); // Gọi API với type=random
    if (!data || !data.data) throw new Error("Dữ liệu không hợp lệ");

    const friendList = document.getElementById("friendContainer");
    const users = data.data.content;

    totalPages = data.data.page.totalPages || 1;
    currentPage = page;

    users.forEach((friend) => {
      const avatar =
        friend.photoProfile && friend.photoProfile.trim() !== ""
          ? friend.photoProfile
          : "../images/user-default.webp";

      const div = document.createElement("div");
      div.className = "col";
      div.innerHTML = `
        <div class="card h-100 shadow-sm friend-card text-center border-0">
          <img src="${avatar}" class="card-img-top" style="height: 180px; object-fit: cover; border-top-left-radius: 8px; border-top-right-radius: 8px;" />
          <div class="card-body p-2" data-id="${friend.userId}">
            <h6 class="card-title mb-1 text-truncate text-start">
              ${friend.fullName || "Không rõ"}
            </h6>
            <p class="text-muted small mb-2 text-start">
              ${friend.mutualFriends || 0} mutual friends
            </p>
            <button class="btn btn-sm btn-primary w-100 mb-1" onclick="addFriend(${
              friend.userId
            })">Thêm bạn bè</button>
            <button class="btn btn-sm btn-secondary w-100 border">Gỡ/Xoá</button>
          </div>
        </div>
      `;
      friendList.appendChild(div);
    });

    // Ẩn spinner nếu hết trang hoặc không còn user nào
    if (spinner) {
      if (currentPage + 1 >= totalPages || users.length === 0) {
        spinner.style.display = "none";
      } else {
        spinner.style.display = "block";
      }
    }
  } catch (error) {
    console.error("Lỗi:", error);
    if (spinner) spinner.style.display = "none";
  } finally {
    loading = false;
  }
}

async function loadAllFriends(page = 0) {
  const friendList = document.getElementById("allFriends");
  if (!friendList) return;

  // Clear khi load trang đầu
  if (page === 0) {
    friendList.innerHTML = "";
    allFriendsPage = 0;
    allFriendsTotalPages = 1;
  }

  if (allFriendsLoading || page >= allFriendsTotalPages) return;
  allFriendsLoading = true;

  try {
    // Gọi API qua hàm getFriends với type = matched
    const data = await getFriends(page, "matched");
    if (!data || !data.data) throw new Error("Không có dữ liệu");

    const users = data.data.content || [];
    allFriendsTotalPages = data.data.page?.totalPages ?? 1;
    allFriendsPage = page;

    // Empty state
    if (users.length === 0 && page === 0) {
      friendList.innerHTML = `<div class="w-100 text-center text-muted py-4">Không có bạn nào để hiển thị</div>`;
      return;
    }

    users.forEach((friend) => {
      const avatar =
        friend.photoProfile && friend.photoProfile.trim() !== ""
          ? friend.photoProfile
          : "../images/user-default.webp";

      const mutual =
        (friend.mutualFriends ?? 0) > 0
          ? `<p class="text-muted small mb-2 text-start">${friend.mutualFriends} bạn chung</p>`
          : `<p class="text-muted small mb-2 text-start">0 bạn chung</p>`;

      const div = document.createElement("div");
      div.className = "col";

      div.innerHTML = `
        <div class="card h-100 shadow-sm friend-card text-center border-0">
          <img src="${avatar}" alt="avatar"
               loading="lazy"
               class="card-img-top"
               style="height:180px;object-fit:cover;border-top-left-radius:8px;border-top-right-radius:8px;" />
          <div class="card-body p-2">
            <h6 class="card-title mb-1 text-truncate text-start">
              ${friend.fullName || "Không rõ"}
            </h6>
            ${mutual}
            <div class="d-flex gap-1">
              <button class="btn btn-sm btn-secondary border w-50 d-flex align-items-center justify-content-center gap-1">
                <i class="bi bi-person-fill-check"></i>
                <span>Bạn bè</span>
              </button>
              <button class="btn btn-sm btn-primary w-50 d-flex align-items-center justify-content-center gap-1 text-white">
                <i class="bi bi-chat-dots-fill"></i>
                <span>Nhắn tin</span>
              </button>
            </div>
          </div>
        </div>
      `;

      friendList.appendChild(div);
    });
  } catch (error) {
    console.error("Lỗi:", error);
    if (page === 0 && friendList.innerHTML.trim() === "") {
      friendList.innerHTML = `<div class="w-100 text-center text-danger py-4">Lỗi tải danh sách bạn</div>`;
    }
  } finally {
    allFriendsLoading = false;
  }
}

async function loadFriendsSuggest(page = 0) {
  const friendList = document.getElementById("friendSuggestions");
  if (!friendList) return;

  // Clear khi load trang đầu
  if (page === 0) {
    friendList.innerHTML = "";
    suggestPage = 0;
    suggestTotalPages = 1;
  }

  if (suggestLoading || page >= suggestTotalPages) return;
  suggestLoading = true;

  try {
    // Gọi API qua hàm getFriends với type = friends_of_friends
    const data = await getFriends(page, "friends_of_friends");
    if (!data || !data.data) throw new Error("Không có dữ liệu");

    const users = data.data.content || [];
    suggestTotalPages = data.data.page?.totalPages ?? 1;
    suggestPage = page;

    // Empty state
    if (users.length === 0 && page === 0) {
      friendList.innerHTML = `<div class="w-100 text-center text-muted py-4">No friend suggestions available</div>`;
      return;
    }

    users.forEach((friend) => {
      const avatar =
        friend.photoProfile && friend.photoProfile.trim() !== ""
          ? friend.photoProfile
          : "../images/user-default.webp";

      const mutual =
        (friend.mutualFriends ?? 0) > 0
          ? `<p class="text-muted small mb-2 text-start">${friend.mutualFriends} mutual friends</p>`
          : `<p class="text-muted small mb-2 text-start">0 mutual friends</p>`;

      const div = document.createElement("div");
      div.className = "col";

      div.innerHTML = `
        <div class="card h-100 shadow-sm friend-card text-center border-0">
          <img src="${avatar}" alt="avatar"
               loading="lazy"
               class="card-img-top"
               style="height:180px;object-fit:cover;border-top-left-radius:8px;border-top-right-radius:8px;" />
          <div class="card-body p-2" style="margin-bottom:5px;" data-id="${
            friend.userId
          }">
            <h6 class="card-title mb-1 text-truncate text-start">${
              friend.fullName || "Unknown"
            }</h6>
            ${mutual}
            <button class="btn btn-sm btn-primary w-100 mb-1" onclick="addFriend(${
              friend.userId
            })">
              Thêm bạn bè
            </button>
            <button class="btn btn-sm btn-secondary w-100 border">
              Gỡ/Xoá
            </button>
          </div>
        </div>
      `;

      friendList.appendChild(div);
    });
  } catch (error) {
    console.error("Error loading friend suggestions:", error);
    if (page === 0 && friendList.innerHTML.trim() === "") {
      friendList.innerHTML = `<div class="w-100 text-center text-danger py-4">Error loading friend suggestions</div>`;
    }
  } finally {
    suggestLoading = false;
  }
}

function addFriend(receiverId) {
  console.log(token);
  fetch(`http://localhost:8080/api/match/create?receiverId=${receiverId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({ receiverId: receiverId }),
  })
    .then(async (response) => {
      if (!response.ok) {
        const err = await response.text();
        throw new Error(err);
      }
      return response.json();
    })
    .then((data) => {
      alert("🎉 Gửi lời mời kết bạn thành công!");
      console.log("✅ Server trả về:", data);
      // 👉 Ví dụ: disable nút gửi lời mời hoặc thay đổi giao diện
      const cardBody = document.querySelector(`[data-id="${receiverId}"]`);
      if (cardBody) {
        cardBody.querySelector(".btn-primary").remove(); // Xóa nút Add friend

        const cancelBtn = document.createElement("button");
        cancelBtn.className = "btn btn-sm btn-warning w-100 mb-1";
        cancelBtn.innerHTML = '<i class="bi bi-x-circle"></i> Cancel';
        cancelBtn.onclick = () => cancelRequest(receiverId);

        cardBody.insertBefore(cancelBtn, cardBody.children[2]); // Chèn lên trên nút "Remove"
      }
    })
    .catch((error) => {
      console.error("❌ Gửi lời mời thất bại:", error.message);
      alert("❌ Gửi lời mời kết bạn thất bại!");
    });
}

function showSection(section) {
  // Danh sách tất cả container cần ẩn/hiện
  const containers = [
    "friendContainer",
    "all-friend",
    "friend-request",
    "friend-suggestions",
  ];

  // Ẩn tất cả section
  containers.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.classList.add("d-none");
  });

  // Bỏ active trên tất cả nav-link
  document.querySelectorAll(".left-sidebar .nav-link").forEach((link) => {
    link.classList.remove("active");
  });

  // Hiện section được chọn + reset dữ liệu
  if (section === "home") {
    document.getElementById("friendContainer").classList.remove("d-none");
    currentPage = 0;
    totalPages = 1;
    loadHomeFriends(currentPage);
  } else if (section === "all") {
    document.getElementById("all-friend").classList.remove("d-none");
    allFriendsPage = 0;
    allFriendsTotalPages = 1;
    loadAllFriends(allFriendsPage);
  } else if (section === "requests") {
    document.getElementById("friend-request").classList.remove("d-none");
    friendRequestPage = 0;
    friendRequestTotalPages = 1;
    loadFriendRequests(friendRequestPage);
  } else if (section === "suggestions") {
    document.getElementById("friend-suggestions").classList.remove("d-none");
    suggestPage = 0;
    suggestTotalPages = 1;
    loadFriendsSuggest(suggestPage);
  }

  // Đánh dấu nav-link đang active
  const activeLink = document.querySelector(
    `.left-sidebar .nav-link[onclick="showSection('${section}')"]`
  );
  if (activeLink) activeLink.classList.add("active");
}

// Thêm đoạn này vào cuối file hoặc sau khi khai báo các hàm
document.addEventListener("DOMContentLoaded", () => {
  // Mặc định load Home Friends
  currentPage = 0;
  loadHomeFriends(currentPage);

  // Sự kiện cuộn cho Home Friends (toàn trang)
  window.addEventListener("scroll", () => {
    if (
      window.innerHeight + window.scrollY >= document.body.offsetHeight - 200 &&
      !loading &&
      currentPage + 1 < totalPages &&
      document.getElementById("friendContainer").offsetParent !== null // tab đang hiển thị
    ) {
      loadHomeFriends(currentPage + 1);
    }
  });

  // Sự kiện cuộn cho All Friends (nếu cuộn trong div)
  const allFriendsDiv = document.getElementById("allFriends");
  if (allFriendsDiv) {
    allFriendsDiv.addEventListener("scroll", () => {
      if (
        allFriendsDiv.scrollTop + allFriendsDiv.clientHeight >=
          allFriendsDiv.scrollHeight - 200 &&
        !allFriendsLoading &&
        allFriendsPage + 1 < allFriendsTotalPages &&
        allFriendsDiv.offsetParent !== null // tab đang hiển thị
      ) {
        loadAllFriends(allFriendsPage + 1);
      }
    });
  }

  // Sự kiện cuộn cho Suggestions (nếu cuộn trong div)
  const suggestDiv = document.getElementById("friendSuggestions");
  if (suggestDiv) {
    suggestDiv.addEventListener("scroll", () => {
      if (
        suggestDiv.scrollTop + suggestDiv.clientHeight >=
          suggestDiv.scrollHeight - 200 &&
        !suggestLoading &&
        suggestPage + 1 < suggestTotalPages &&
        suggestDiv.offsetParent !== null // tab đang hiển thị
      ) {
        loadFriendsSuggest(suggestPage + 1);
      }
    });
  }
});

async function loadFriendRequests(page = 0) {
  const container = document.getElementById("friendRequests");
  if (!container) return;

  // Reset khi load trang đầu
  if (page === 0) {
    container.innerHTML = "";
    friendRequestPage = 0;
    friendRequestTotalPages = 1;
  }

  if (friendRequestLoading || page >= friendRequestTotalPages) return;
  friendRequestLoading = true;

  try {
    const data = await getFriends(page, "pending");
    if (!data || !data.data) throw new Error("Không có dữ liệu");

    const requests = data.data.content || [];
    friendRequestTotalPages = data.data.page?.totalPages ?? 1;
    friendRequestPage = page;

    // Empty state
    if (requests.length === 0 && page === 0) {
      container.innerHTML = `<div class="w-100 text-center text-muted py-4">Không có lời mời kết bạn nào</div>`;
      return;
    }

    requests.forEach((user) => {
      const avatar =
        user.photoProfile && user.photoProfile.trim() !== ""
          ? user.photoProfile
          : "../images/user-default.webp";

      const mutual =
        (user.mutualFriends ?? 0) > 0
          ? `<p class="text-muted small mb-2 text-start">${user.mutualFriends} bạn chung</p>`
          : `<p class="text-muted small mb-2 text-start">0 bạn chung</p>`;

      const div = document.createElement("div");
      div.className = "col";

      div.innerHTML = `
        <div class="card h-100 shadow-sm friend-card text-center border-0">
          <img src="${avatar}" alt="avatar"
               loading="lazy"
               class="card-img-top"
               style="height:180px;object-fit:cover;border-top-left-radius:8px;border-top-right-radius:8px;" />
          <div class="card-body p-2">
            <h6 class="card-title mb-1 text-truncate text-start">
              ${user.fullName || "Không rõ"}
            </h6>
            ${mutual}
            <div class="d-flex gap-1">
              <button class="btn btn-sm btn-primary w-50 d-flex align-items-center justify-content-center gap-1" onclick="acceptFriend(${
                user.userId
              })">
                <i class="bi bi-person-check-fill"></i>
                <span>Đồng ý</span>
              </button>
              <button class="btn btn-sm btn-danger w-50 d-flex align-items-center justify-content-center gap-1" onclick="declineFriend(${
                user.userId
              })">
                <i class="bi bi-x-circle-fill"></i>
                <span>Huỷ </span>
              </button>
            </div>
          </div>
        </div>
      `;

      container.appendChild(div);
    });
  } catch (error) {
    console.error("Error loading friend requests:", error);
    if (page === 0 && container.innerHTML.trim() === "") {
      container.innerHTML = `<div class="w-100 text-center text-danger py-4">Lỗi tải lời mời kết bạn</div>`;
    }
  } finally {
    friendRequestLoading = false;
  }
}

async function updateRequestFriend(receiverId, matchStatus) {
  if (!receiverId || !matchStatus) {
    Swal.fire({
      title: "Thiếu tham số",
      text: "receiverId hoặc matchStatus trống.",
      icon: "warning",
    });
    return;
  }

  // Xác nhận theo hành động
  const actionText =
    matchStatus === "ACCEPTED"
      ? "accept this friend request?"
      : "reject this friend request?";
  const confirm = await Swal.fire({
    title: "Confirm",
    text: `Are you sure you want to ${actionText}`,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Yes",
    cancelButtonText: "No",
    reverseButtons: true,
  });
  if (!confirm.isConfirmed) return;

  try {
    // Loading
    Swal.fire({
      title: "Processing...",
      html: "Please wait.",
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => Swal.showLoading(),
    });

    const qs = new URLSearchParams({
      receiverId: String(receiverId),
      matchStatus: String(matchStatus), // ví dụ: ACCEPTED | REJECTED
    }).toString();

    const res = await fetch(`http://localhost:8080/api/match/update?${qs}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // cố gắng đọc JSON để lấy message
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
      text: payload?.message || "Update request friend successful.",
      icon: "success",
      timer: 1600,
      showConfirmButton: false,
    });

    // Cập nhật UI: nếu đang ở tab Requests thì reload danh sách
    if (typeof loadFriendRequests === "function") {
      friendRequestPage = 0;
      friendRequestTotalPages = 1;
      loadFriendRequests(friendRequestPage);
    } else {
      // hoặc xoá card ngay nếu bạn có data-id theo userId
      const card = document
        .querySelector(`[data-id="${receiverId}"]`)
        ?.closest(".col");
      if (card) card.remove();
    }
  } catch (err) {
    Swal.fire({
      title: "Update Failed!",
      text: err.message || "An error occurred while updating.",
      icon: "error",
      confirmButtonText: "OK",
    });
  }
}

// Helper gọn cho nút bấm
function acceptFriend(userId) {
  return updateRequestFriend(userId, "MATCHED");
}
function declineFriend(userId) {
  return updateRequestFriend(userId, "REJECTED");
}
