token = localStorage.getItem("accessToken");
console.log(token);
function loadHomeFriends() {
  fetch("http://localhost:8080/api/user/friends?page=0&size=10", {
    method: "GET",
    headers: {
      Authorization: "Bearer " + token,
    },
  })
    .then(async (response) => {
      if (!response.ok) {
        const errorText = await response.text(); // Lấy chi tiết lỗi trả về
        console.error("HTTP Status:", response.status);
        console.error("Chi tiết lỗi:", errorText);
        throw new Error("Lỗi khi lấy thông tin người dùng");
      }
      return response.json();
    })
    .then((data) => {
      const friendList = document.getElementById("friendContainer");
      const users = data.data.content;
      friendList.innerHTML = ""; // 🧹 Xóa nội dung cũ trước khi thêm mới

      users.forEach((friend) => {
        const avatar =
          friend.photoProfile && friend.photoProfile.trim() !== ""
            ? friend.photoProfile
            : "../images/user-default.webp"; // Đường dẫn ảnh mặc định

        const mutual =
          friend.mutualFriends > 0
            ? `<p class="text-muted small">${friend.mutualFriends} bạn chung</p>`
            : "";

        const div = document.createElement("div");
        div.className = "col"; // Bootstrap yêu cầu col để card xếp hàng

        div.innerHTML = `
  <div class="card h-100 shadow-sm friend-card text-center border-0">
    <img src="${avatar || "../images/default-avatar.jpg"}"
         class="card-img-top"
         style="height: 180px; object-fit: cover; border-top-left-radius: 8px; border-top-right-radius: 8px;" />
    <div class="card-body p-2" style="margin-bottom:5px;">
      <h6 class="card-title mb-1 text-truncate text-start">${
        friend.fullName || "Không rõ"
      }</h6>
      <p class="text-muted small mb-2 text-start">${
        friend.mutualFriends || 0
      } mutual friends</p>
      <button class="btn btn-sm btn-primary w-100 mb-1">Add friend</button>
      <button class="btn btn-sm btn-light w-100 border">Remove</button>
    </div>
  </div>
`;

        friendList.appendChild(div);
      });
    })
    .catch((error) => {
      console.error("Lỗi:", error);
    });
}

function loadAllFriends() {
  fetch("http://localhost:8080/api/user/friends?page=0&size=10", {
    method: "GET",
    headers: {
      Authorization: "Bearer " + token,
    },
  })
    .then(async (response) => {
      if (!response.ok) {
        const errorText = await response.text(); // Lấy chi tiết lỗi trả về
        console.error("HTTP Status:", response.status);
        console.error("Chi tiết lỗi:", errorText);
        throw new Error("Lỗi khi lấy thông tin người dùng");
      }
      return response.json();
    })
    .then((data) => {
      const friendList = document.getElementById("allFriends");
      const users = data.data.content;
      friendList.innerHTML = ""; // 🧹 Xóa nội dung cũ trước khi thêm mới

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
    });
}

function loadFriendsSuggest() {
  fetch("http://localhost:8080/api/user/friends-friends?page=0&size=10", {
    method: "GET",
    headers: {
      Authorization: "Bearer " + token,
    },
  })
    .then(async (response) => {
      if (!response.ok) {
        const errorText = await response.text(); // Lấy chi tiết lỗi trả về
        console.error("HTTP Status:", response.status);
        console.error("Chi tiết lỗi:", errorText);
        throw new Error("Lỗi khi lấy thông tin người dùng");
      }
      return response.json();
    })
    .then((data) => {
      const friendList = document.getElementById("friendSuggestions");
      const users = data.data.content;
      friendList.innerHTML = ""; // 🧹 Xóa nội dung cũ trước khi thêm mới

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
