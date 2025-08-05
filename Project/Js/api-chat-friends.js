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

  wrapper.className = isMe ? "text-end mb-2" : "text-start mb-2";

  wrapper.innerHTML = `
    <div
      class="${isMe ? "bg-primary text-white" : "bg-light "} 
                 px-3 py-2 rounded-3 d-inline-block"
      style="max-width: 70%; word-break: break-word;"
    >
      ${msg.message}
    </div>
  `;

  const chatMessages = document.getElementById("chatMessages");
  chatMessages.appendChild(wrapper);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function getHistoryChat(currentUserId, receiverId) {
  const token = localStorage.getItem("accessToken");
  console.log(token);
  fetch(
    `http://localhost:8080/api/message/history?receiverId=${receiverId}&page=0&size=20`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    }
  )
    .then(async (res) => {
      if (!res.ok) {
        const text = await res.text(); // lấy nội dung để debug nếu là lỗi
        throw new Error(`❌ Server error (${res.status}): ${text}`);
      }

      const text = await res.text();
      if (!text) {
        throw new Error("❌ Empty response from server");
      }

      let resJson;
      try {
        resJson = JSON.parse(text);
      } catch (e) {
        throw new Error("❌ Response is not valid JSON:\n" + text);
      }

      if (resJson.success) {
        const messages = resJson.data.content;
        const chatBox = document.getElementById("chatBox");

        messages.forEach((msg) => {
          const isMe = msg.senderId === currentUserId;
          showMessage(msg, isMe);
        });

        chatBox.scrollTop = chatBox.scrollHeight;
      } else {
        console.error("❌ Lỗi lấy lịch sử:", resJson.message);
      }
    })
    .catch((err) => console.error("❌ Lỗi fetch:", err.message));
}
