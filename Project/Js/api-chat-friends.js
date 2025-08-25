const chatInput = document.getElementById("chatInput");

chatInput.addEventListener("input", function () {
  this.style.height = "auto"; // Reset chiều cao
  this.style.height = this.scrollHeight + "px"; // Set chiều cao theo nội dung
});

function createChatChannel(id1, id2) {
  const min = Math.min(id1, id2);
  const max = Math.max(id1, id2);
  return "/topic/chat/" + min + "-" + max;
}

function startChat() {
  const receiverId = parseInt(
    document.getElementById("chatBox").dataset.friendId
  );
  currentReceiverId = receiverId;

  const userId = JSON.parse(atob(token.split(".")[1])).sub;
  const newChannel = createChatChannel(userId, currentReceiverId);

  if (subscribedChannel !== newChannel) {
    if (subscribedChannel && stompClient && stompClient.connected) {
      stompClient.unsubscribe(subscribedChannel);
      console.log("🔌 Unsubscribed from:", subscribedChannel);
    }

    // 👉 Sub kênh mới
    const subscription = stompClient.subscribe(newChannel, (message) => {
      const msg = JSON.parse(message.body);
      const senderId = parseInt(msg.senderId);

      console.log("📨 Nhận được response:", msg);

      // 👉 Nếu là event xoá message realtime
      if (msg.isDeleted && msg.messageId) {
        const bubble = document.querySelector(
          `.message-bubble[data-message-id="${msg.messageId}"]`
        );
        if (bubble) {
          bubble.textContent = "Tin nhắn đã xoá";
          bubble.className =
            "bg-light text-muted px-3 py-2 rounded-3 fst-italic message-bubble";
        }
        return;
      }

      // 👉 Nếu messageId đã tồn tại → coi là tin nhắn sửa
      const existingBubble = document.querySelector(
        `.message-bubble[data-message-id="${msg.messageId}"]`
      );
      if (existingBubble) {
        existingBubble.textContent = msg.message;
        return;
      }

      // 👉 Nếu là tin nhắn mới
      showMessage(msg, senderId === parseInt(userId));
    });

    subscribedChannel = subscription.id;
    console.log("📡 Subscribed to:", newChannel);
  }

  // 👉 Clear tin nhắn cũ và load lịch sử
  document.getElementById("chatMessages").innerHTML = "";
  getHistoryChat(parseInt(userId), currentReceiverId);
}

function sendMessage() {
  const chatInput = document.getElementById("chatInput");
  const messageText = chatInput.value.trim();

  if (!currentReceiverId || !messageText) {
    alert("⚠️ Chưa nhập tin nhắn hoặc người nhận");
    return;
  }

  // Gửi tin nhắn qua WebSocket
  stompClient.send(
    "/app/message.private",
    {},
    JSON.stringify({
      receiverId: currentReceiverId,
      message: messageText,
      token: token,
    })
  );

  // Hiển thị tin nhắn của chính mình
  showMessage({ message: messageText }, true);

  // Reset textarea và chiều cao
  chatInput.value = "";
  chatInput.style.height = "auto";
}
function showMessage(msg, isMe) {
  const wrapper = document.createElement("div");
  wrapper.className = `chat-wrapper d-flex w-100 mb-2 ${
    isMe ? "justify-content-end" : "justify-content-start"
  } position-relative`;

  const bubble = document.createElement("div");
  bubble.dataset.messageId = msg.id; // gắn id để dùng cho xoá/sửa sau

  // Nếu tin nhắn đã xoá
  if (msg.isDeleted) {
    bubble.className =
      "bg-light text-muted px-3 py-2 rounded-3 fst-italic message-bubble";
    bubble.textContent = "Tin nhắn đã xoá";
    wrapper.appendChild(bubble);
  } else {
    // Tin nhắn bình thường
    bubble.className = `${
      isMe ? "bg-primary text-white" : "bg-light text-dark"
    } px-3 py-2 rounded-3 message-bubble`;
    bubble.style.maxWidth = "70%";
    bubble.style.wordBreak = "break-word";
    bubble.style.whiteSpace = "pre-wrap";
    bubble.textContent = msg.message ?? "";
    bubble.dataset.messageId = msg.messageId;

    wrapper.appendChild(bubble);

    // Nếu là tin nhắn của mình thì thêm nút ⋮ và menu
    if (isMe) {
      const moreBtn = document.createElement("span");
      moreBtn.className = "three-dots-btn";
      moreBtn.innerHTML = `<i class="bi bi-three-dots"></i>`;
      moreBtn.style.position = "absolute";
      moreBtn.style.top = "50%";
      moreBtn.style.left = "70px"; // tuỳ chỉnh vị trí
      moreBtn.style.transform = "translateY(-50%)";
      moreBtn.style.cursor = "pointer";
      moreBtn.style.display = "none";

      const menu = document.createElement("div");
      menu.className = "message-menu shadow rounded-2";
      menu.style.position = "absolute";
      menu.style.left = "-10px";
      menu.style.top = "50%";
      menu.style.transform = "translateY(-50%)";
      menu.style.background = "#fff";
      menu.style.border = "1px solid #eee";
      menu.style.minWidth = "150px";
      menu.style.display = "none";
      menu.style.zIndex = "1000";
      menu.innerHTML = `
        <div class="message-menu-item px-3 py-2" style="cursor:pointer;">✏️ Sửa tin nhắn</div>
        <div class="message-menu-item px-3 py-2 text-danger" style="cursor:pointer;" onclick="deleteMessage(this)">🗑️ Xoá tin nhắn</div>
      `;

      const editBtn = menu.querySelector(".message-menu-item:nth-child(1)");
      const deleteBtn = menu.querySelector(".message-menu-item:nth-child(2)");

      // 👉 Khi bấm sửa
      editBtn.addEventListener("click", async () => {
        menu.style.display = "none";
        const { value: newText } = await Swal.fire({
          title: "Sửa tin nhắn",
          input: "text",
          inputValue: msg.message,
          showCancelButton: true,
          confirmButtonText: "Lưu",
          cancelButtonText: "Huỷ",
          inputValidator: (value) => {
            if (!value) {
              return "Nội dung không được để trống!";
            }
          },
        });

        if (newText && newText !== msg.message) {
          stompClient.send(
            "/app/message.edit",
            {},
            JSON.stringify({
              token: token,
              receiverId: currentReceiverId,
              messageId: msg.messageId,
              message: newText,
            })
          );

          Swal.fire({
            icon: "success",
            title: "Đã sửa",
            text: "Tin nhắn đã được cập nhật",
            timer: 1500,
            showConfirmButton: false,
          });
        }
      });

      // 👉 Khi bấm xoá
      deleteBtn.addEventListener("click", async () => {
        const result = await Swal.fire({
          title: "Xoá tin nhắn?",
          text: "Bạn có chắc muốn xoá tin nhắn này?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Xoá",
          cancelButtonText: "Huỷ",
          reverseButtons: true,
        });

        if (result.isConfirmed) {
          // Gửi socket xoá
          stompClient.send(
            "/app/message.delete",
            {},
            JSON.stringify({ messageId: msg.messageId, token: token })
          );

          Swal.fire({
            icon: "success",
            title: "Đã xoá",
            text: "Tin nhắn đã được xoá.",
            showConfirmButton: false,
            timer: 1500,
          });
        }
      });

      wrapper.addEventListener("mouseenter", () => {
        moreBtn.style.display = "inline-block";
      });
      wrapper.addEventListener("mouseleave", () => {
        moreBtn.style.display = "none";
        menu.style.display = "none";
      });

      moreBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        menu.style.display = menu.style.display === "none" ? "block" : "none";
      });

      document.addEventListener("click", () => {
        menu.style.display = "none";
      });

      wrapper.appendChild(moreBtn);
      wrapper.appendChild(menu);
    }
  }

  const chatMessages = document.getElementById("chatMessages");
  chatMessages.appendChild(wrapper);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Dummy function, bạn cần tự xử lý logic sửa/xoá
function editMessage(el) {
  alert("Sửa tin nhắn (bạn tự xử lý logic này)");
}
function deleteMessage(el) {
  const bubble = el.closest(".chat-wrapper").querySelector(".message-bubble");
  const messageId = bubble.dataset.messageId;
  console.log("messID: ", messageId);
  console.log("currentReceiverId: ", currentReceiverId);

  if (!messageId || !currentReceiverId) {
    console.error("Thiếu messageId hoặc receiverId");
    return;
  }

  stompClient.send(
    "/app/message.delete",
    {},
    JSON.stringify({
      token: token,
      receiverId: currentReceiverId,
      messageId: parseInt(messageId),
    })
  );
}

async function getHistoryChat(currentUserId, receiverId) {
  const token = localStorage.getItem("accessToken");

  const res = await fetch(
    `http://localhost:8080/api/message/history?receiverId=${receiverId}&page=0&size=20`,
    { headers: { Authorization: "Bearer " + token } }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Server error ${res.status}: ${text}`);
  }

  const json = await res.json();
  if (!json.success) {
    console.error("Lỗi lấy lịch sử:", json.message);
    return;
  }

  const messages = json.data.content ?? [];
  const chatMessages = document.getElementById("chatMessages");
  chatMessages.innerHTML = ""; // clear cũ nếu cần

  // Nếu API trả mới->cũ, có thể đảo lại để hiển thị từ cũ->mới:
  // messages.reverse();

  messages.forEach((m) => {
    const isMe = String(m.senderId) === String(currentUserId);
    showMessage(m, isMe);
  });

  chatMessages.scrollTop = chatMessages.scrollHeight;
}
