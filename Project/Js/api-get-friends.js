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

function loadHomeFriends(page = 0) {
  if (page === 0) {
    const friendList = document.getElementById("friendContainer");
    if (friendList) friendList.innerHTML = "";
  }
  if (loading || page >= totalPages) return;

  loading = true;
  const spinner = document.getElementById("loadingSpinner");
  if (spinner) spinner.style.display = "block"; // Hiện spinner khi bắt đầu load

  fetch(`http://localhost:8080/api/user/random-friends?page=${page}&size=10`, {
    method: "GET",
    headers: {
      Authorization: "Bearer " + token,
    },
  })
    .then(async (response) => {
      if (!response.ok) {
        const errorText = await response.text();
        console.error("HTTP Status:", response.status);
        console.error("Chi tiết lỗi:", errorText);
        throw new Error("Lỗi khi lấy thông tin người dùng");
      }
      return response.json();
    })
    .then((data) => {
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
              <h6 class="card-title mb-1 text-truncate text-start">${
                friend.fullName || "Không rõ"
              }</h6>
              <p class="text-muted small mb-2 text-start">${
                friend.mutualFriends || 0
              } mutual friends</p>
              <button class="btn btn-sm btn-primary w-100 mb-1" onclick="addFriend(${
                friend.userId
              })">Add friend</button>
              <button class="btn btn-sm btn-light w-100 border">Remove</button>
            </div>
          </div>
        `;
        friendList.appendChild(div);
      });

      loading = false;

      // Ẩn spinner nếu đã hết trang hoặc không còn user nào
      if (spinner) {
        if (currentPage + 1 >= totalPages || users.length === 0) {
          spinner.style.display = "none";
        } else {
          spinner.style.display = "block";
        }
      }
    })
    .catch((error) => {
      console.error("Lỗi:", error);
      loading = false;
      if (spinner) spinner.style.display = "none"; // Ẩn spinner khi lỗi
    });
}

function loadAllFriends(page = 0) {
  const friendList = document.getElementById("allFriends");
  // if (page === 0) {
  //   if (friendList) friendList.innerHTML = "";
  // }
  if (allFriendsLoading || page >= allFriendsTotalPages) return;
  allFriendsLoading = true;

  fetch(`http://localhost:8080/api/user/friends?page=${page}&size=10`, {
    method: "GET",
    headers: {
      Authorization: "Bearer " + token,
    },
  })
    .then(async (response) => {
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error("Lỗi khi lấy thông tin người dùng");
      }
      return response.json();
    })
    .then((data) => {
      const users = data.data.content;
      allFriendsTotalPages = data.data.page.totalPages || 1;
      allFriendsPage = page;

      users.forEach((friend) => {
        const avatar =
          friend.photoProfile && friend.photoProfile.trim() !== ""
            ? friend.photoProfile
            : "../images/user-default.webp"; // Đường dẫn ảnh mặc định

        const mutual =
          friend.mutualFriends > 0
            ? `<p class="text-muted small">${user.mutualFriends} bạn chung</p>`
            : "";
        const div = document.createElement("div");
        div.className = "col"; // Bootstrap yêu cầu col để card xếp hàng

        div.innerHTML = `
  <div class="card h-100 shadow-sm friend-card text-center border-0">
    <img src="${avatar}"
        class="card-img-top"
        style="height: 180px; object-fit: cover; border-top-left-radius: 8px; border-top-right-radius: 8px;" />
    <div class="card-body p-2">
      <h6 class="card-title mb-1 text-truncate text-start">${
        friend.fullName || "Không rõ"
      }</h6>
      <p class="text-muted small mb-2 text-start">${
        friend.mutualFriends || 0
      } bạn chung</p>
    <div class="d-flex gap-1">
  <button class="btn btn-sm btn-secondary border w-50 d-flex align-items-center justify-content-center gap-1">
    <i class="bi bi-person-fill-check"></i>
    <span>Friend</span>
  </button>
  <button class="btn btn-sm btn-primary w-50 d-flex align-items-center justify-content-center gap-1 text-white">
    <i class="bi bi-chat-dots-fill"></i>
    <span>Message</span>
  </button>
</div>

    </div>
  </div>
`;

        friendList.appendChild(div);
      });
    })
    .catch((error) => {
      console.error("Lỗi:", error);
      allFriendsLoading = false;
    });
}

function loadFriendsSuggest(page = 0) {
  const friendList = document.getElementById("friendSuggestions");
  // if (page === 0) {
  //   if (friendList) friendList.innerHTML = "";
  // }
  if (suggestLoading || page >= suggestTotalPages) return;
  suggestLoading = true;

  fetch(`http://localhost:8080/api/user/friends-friends?page=${page}&size=10`, {
    method: "GET",
    headers: {
      Authorization: "Bearer " + token,
    },
  })
    .then(async (response) => {
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error("Lỗi khi lấy thông tin người dùng");
      }
      return response.json();
    })
    .then((data) => {
      const users = data.data.content;
      suggestTotalPages = data.data.page.totalPages || 1;
      suggestPage = page;

      users.forEach((friend) => {
        const avatar =
          friend.photoProfile && friend.photoProfile.trim() !== ""
            ? friend.photoProfile
            : "../images/user-default.webp"; // Đường dẫn ảnh mặc định

        const mutual =
          friend.mutualFriends > 0
            ? `<p class="text-muted small">${user.mutualFriends} bạn chung</p>`
            : "";
        const div = document.createElement("div");
        div.className = "col"; // Bootstrap yêu cầu col để card xếp hàng

        div.innerHTML = `
  <div class="card h-100 shadow-sm friend-card text-center border-0">
    <img src="${avatar || "../images/default-avatar.jpg"}"
         class="card-img-top"
         style="height: 180px; object-fit: cover; border-top-left-radius: 8px; border-top-right-radius: 8px;" />
    <div class="card-body p-2" style="margin-bottom:5px;" data-id="${
      friend.userId
    }">
      <h6 class="card-title mb-1 text-truncate text-start">${
        friend.fullName || "Không rõ"
      }</h6>
      <p class="text-muted small mb-2 text-start">${
        friend.mutualFriends || 0
      } mutual friends</p>
      <button class="btn btn-sm btn-primary w-100 mb-1" onclick="addFriend(${
        friend.userId
      })">Add friend</button>
      <button class="btn btn-sm btn-light w-100 border">Remove</button>
    </div>
  </div>
`;

        friendList.appendChild(div);
      });
    })
    .catch((error) => {
      console.error("Lỗi:", error);
      suggestLoading = false;
    });
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
  // Ẩn tất cả section
  document.getElementById("friendContainer").classList.add("d-none");
  document.getElementById("all-friend").classList.add("d-none");
  document.getElementById("friend-suggestions").classList.add("d-none");
  document.querySelectorAll(".left-sidebar .nav-link").forEach((link) => {
    link.classList.remove("active");
  });
  // Hiện section được chọn và reset dữ liệu
  if (section === "home") {
    document.getElementById("friendContainer").classList.remove("d-none");
    currentPage = 0;
    totalPages = 1;
    loadHomeFriends(currentPage);
  } else if (section === "all") {
    document.getElementById("all-friend").classList.remove("d-none");
    document.getElementById("all-friend").classList.add("active");
    allFriendsPage = 0;
    allFriendsTotalPages = 1;
    loadAllFriends(allFriendsPage);
    // } else if (section === "requests") {
    //   document.getElementById("friend-request").classList.remove("d-none");
    //   friendRequestPage = 0;
    //   friendRequestTotalPages = 1;
    //   loadFriendRequest(friendRequestPage);
  } else if (section === "suggestions") {
    document.getElementById("friend-suggestions").classList.remove("d-none");
    suggestPage = 0;
    suggestTotalPages = 1;
    loadFriendsSuggest(suggestPage);
  }
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
