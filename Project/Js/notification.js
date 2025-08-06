const bellIcon = document.getElementById("notificationBell");
const dropdown = document.getElementById("notificationDropdown");
const badge = document.getElementById("notificationBadge");
let currentNotificationPage = 0;
// 👉 Kết nối WebSocket và nhận thông báo realtime

// 👉 Khi bấm chuông
bellIcon.addEventListener("click", () => {
  const isVisible = dropdown.style.display === "block";
  dropdown.style.display = isVisible ? "none" : "block";

  if (!isVisible) badge.classList.add("d-none");

  if (dropdown.dataset.loaded !== "true") {
    requestNotificationHistory(0, 10);
    dropdown.dataset.loaded = "true";
  }
});

// 👉 Click ngoài thì ẩn dropdown
document.addEventListener("click", function (event) {
  if (!bellIcon.contains(event.target) && !dropdown.contains(event.target)) {
    dropdown.style.display = "none";
  }
});

// 👉 Gửi yêu cầu lấy lịch sử thông báo
function requestNotificationHistory(page, size) {
  const payload = { page: page, size: size };
  stompClient.send("/app/notification.history", {}, JSON.stringify(payload));
}

// 👉 Hiển thị danh sách thông báo
function renderNotifications(list) {
  const container = document.getElementById("notificationList");
  container.innerHTML = "";

  if (list.length === 0 && currentNotificationPage === 0) {
    container.innerHTML = `<div class="text-muted text-center">📭 Không có thông báo nào</div>`;
    badge.classList.add("d-none");
    return;
  }

  if (list.length > 0) {
    badge.classList.remove("d-none");
    badge.textContent = list.length;
  } else {
    badge.classList.add("d-none");
  }

  list.forEach((noti) => appendNotification(noti));
}

// 👉 Thêm 1 thông báo mới
function appendNotification(noti) {
  const container = document.getElementById("notificationList");

  const div = document.createElement("div");
  const acceptBtn = div.querySelector(".btn-accept");
  const denyBtn = div.querySelector(".btn-deny");
  div.className = "d-flex align-items-start gap-3 mb-3 p-2 bg-light rounded";

  const createdAt = new Date(noti.createAt).toLocaleString("vi-VN");

  div.innerHTML = `
    <img src="${noti.profileUrl || "../images/user-default.webp"}" 
         class="rounded-circle mt-1" 
         style="width: 40px; height: 40px; object-fit: cover; border: 1px solid #bdc3c7" />

    <div class="flex-grow-1">
      <div style="font-weight:bold;">${noti.content}</div>
      <small class="text-muted">${createdAt}</small>

      <div class="mt-2 d-flex gap-2">
        <button class="btn btn-sm btn-primary btn-accept" onclick="acceptFriend(${
          noti.senderId
        }, this)">Chấp nhận</button>
        <button class="btn btn-sm btn-outline-secondary btn-deny" >Từ chối</button>
      </div>
    </div>
  `;

  container.prepend(div);
}

// 👉 Cập nhật số badge (mỗi khi có noti mới)
function updateNotificationBadge() {
  const isVisible = dropdown.style.display === "block";
  if (!isVisible) {
    badge.classList.remove("d-none");

    const current = parseInt(badge.textContent) || 0;
    const newCount = current + 1;

    badge.textContent = newCount > 99 ? "99+" : newCount;
  }
}

// 👉 Chấp nhận lời mời
function acceptFriend(senderId, btn) {
  const token = localStorage.getItem("accessToken");

  fetch(
    `http://localhost:8080/api/match/update?receiverId=${senderId}&matchStatus=MATCHED`,
    {
      method: "PUT",
      headers: {
        Authorization: "Bearer " + token,
      },
    }
  )
    .then((res) => res.json())
    .then(() => {
      console.log("✅ Chấp nhận thành công");
      btn.closest(".d-flex").remove();
    });
}

// 👉 Từ chối lời mời
function denyFriend(senderId, btn) {
  const token = localStorage.getItem("accessToken");

  fetch(
    `http://localhost:8080/api/match/update?receiverId=${senderId}&matchStatus=REJECTED`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    }
  )
    .then((res) => res.json())
    .then(() => {
      console.log("❌ Đã từ chối");
      btn.closest(".d-flex").remove();
    })
    .catch((err) => {
      console.error("❌ Lỗi:", err);
    });
}

function subscribeToNotifications() {
  connectWebSocket(() => {
    // Nếu đã sub post khác, hủy sub cũ
    stompClient.subscribe("/user/queue/notification.history", (message) => {
      const pageData = JSON.parse(message.body);
      renderNotifications(pageData.content || []);
      currentPage = pageData.number;
    });

    requestNotificationHistory(0, 10);
  });
}

window.loaded = subscribeToNotifications();
