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
  // Hàng full width + canh trái/phải bằng flex
  wrapper.className = `d-flex w-100 mb-2 ${
    isMe ? "justify-content-end" : "justify-content-start"
  }`;

  const bubble = document.createElement("div");
  bubble.className = `${
    isMe ? "bg-primary text-white" : "bg-light text-dark"
  } px-3 py-2 rounded-3`;
  bubble.style.maxWidth = "70%";
  bubble.style.wordBreak = "break-word";
  bubble.style.whiteSpace = "pre-wrap"; // giữ xuống dòng

  // An toàn: không innerHTML
  bubble.textContent = msg.message ?? "";

  wrapper.appendChild(bubble);

  const chatMessages = document.getElementById("chatMessages"); // container cuộn chính
  chatMessages.appendChild(wrapper);
  chatMessages.scrollTop = chatMessages.scrollHeight; // auto scroll
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
