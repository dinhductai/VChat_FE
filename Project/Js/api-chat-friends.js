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
  const newChannel = createChatChannel(userId, currentReceiverId); // ví dụ: /topic/chat/12_17

  if (subscribedChannel !== newChannel) {
    // Bỏ sub cũ nếu có
    if (subscribedChannel && stompClient && stompClient.connected) {
      stompClient.unsubscribe(subscribedChannel);
      console.log("🔌 Unsubscribed from:", subscribedChannel);
    }

    // Sub kênh mới
    const subscription = stompClient.subscribe(newChannel, (message) => {
      const msg = JSON.parse(message.body);
      const senderId = parseInt(msg.senderId);

      console.log("📨 Nhận được response:", msg);

      // Nếu người gửi không phải là chính mình thì mới hiển thị
      if (senderId !== parseInt(userId)) {
        showMessage(msg, false); // Hiển thị message bên trái (friend)
      }
    });

    subscribedChannel = subscription.id;
    console.log("📡 Subscribed to:", newChannel);
  }
  document.getElementById("chatMessages").innerHTML = ""; // clear tin nhắn cũ
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
      editBtn.addEventListener("click", () => {
        const chatInput = document.getElementById("chatInput");
        chatInput.value = msg.message;
        chatInput.focus();
        chatInput.dataset.editing = "true";
        chatInput.dataset.messageId = msg.id;
        menu.style.display = "none";
      });

      // 👉 Khi bấm xoá
      deleteBtn.addEventListener("click", () => {
        // Gửi socket xoá (nếu có backend)
        stompClient.send(
          "/app/message.delete",
          {},
          JSON.stringify({ messageId: msg.id, token: token })
        );

        // Cập nhật UI ngay
        bubble.textContent = "Tin nhắn đã xoá";
        bubble.className =
          "bg-light text-muted px-3 py-2 rounded-3 fst-italic message-bubble";
        menu.style.display = "none";
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
