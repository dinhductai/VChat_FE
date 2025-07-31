const form = document.getElementById("chatForm");
const avatar = document.getElementById("avatarCircle");
const chatContainer = document.querySelector(".chat-container");
const chatBox = document.querySelector(".chat-box");
const textarea = document.getElementById("userInput");
let conversationId = null;
// Tự dãn chiều cao textarea khi gõ
textarea.addEventListener("input", () => {
  textarea.style.height = "auto";
  const maxHeight = 300;
  const newHeight = textarea.scrollHeight;

  if (newHeight <= maxHeight) {
    textarea.style.height = newHeight + "px";
    textarea.style.overflowY = "hidden";
  } else {
    textarea.style.height = maxHeight + "px";
    textarea.style.overflowY = "auto";
  }
});

// Gửi khi nhấn Enter
textarea.addEventListener("keydown", function (e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    form.requestSubmit();
  }
});

window.addEventListener("DOMContentLoaded", function () {
  textarea.focus();
});

// XỬ LÝ GỬI TIN NHẮN VÀ HIỆN 2 BÊN
form.addEventListener("submit", async function (e) {
  e.preventDefault();
  avatar.classList.add("hidden");
  const message = textarea.value.trim();
  if (!message) return;

  appendMessage(message, "user");
  textarea.value = "";
  textarea.style.height = "auto";

  try {
    const formData = new FormData();
    formData.append("message", message);
    formData.append("conversationId", conversationId);
    const file = fileInput.files[0];
    if (file) {
      formData.append("file", file); // 👈 thêm vào FormData để gửi lên backend
    }
    const token = localStorage.getItem("accessToken");

    const response = await fetch("http://localhost:8080/api/open-ai", {
      method: "POST",
      body: formData,
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error("Lỗi từ máy chủ: " + response.status);
    }

    const data = await response.json();
    if (!conversationId && data?.data?.conversationId) {
      conversationId = data.data.conversationId;
    }
    const messages = data?.data?.listMessage ?? [];

    if (messages.length === 0) {
      appendMessage("Bot không trả lời được.", "bot");
    } else {
      messages.forEach((msgObj) => {
        if (msgObj.message && msgObj.message.trim() !== "") {
          appendMessage(msgObj.message, "bot");
        }
      });
    }
  } catch (error) {
    console.error("Lỗi fetch:", error);
    appendMessage("Lỗi kết nối đến máy chủ!", "bot");
  }
});

function appendMessage(text, sender) {
  const chatBox = document.querySelector(".chat-box");
  const wrapper = document.createElement("div");
  wrapper.className = `d-flex mb-2 ${
    sender === "user" ? "justify-content-end" : "justify-content-start"
  }`;

  const msgDiv = document.createElement("div");

  if (sender === "user") {
    msgDiv.className = "p-2 text-white rounded";
    msgDiv.style.backgroundColor = "#303030"; // Màu xanh giống ChatGPT
    msgDiv.style.color = "white";
    msgDiv.style.maxWidth = "570px";
    msgDiv.style.textAlign = "justify";
  } else {
    msgDiv.className = "p-2 text-white  rounded";
    msgDiv.style.backgroundColor = "transparent"; // Không nền
    msgDiv.style.maxWidth = "100%";
    msgDiv.style.color = "white";
    msgDiv.style.textAlign = "justify";
  }

  msgDiv.innerText = text;
  wrapper.appendChild(msgDiv);
  chatBox.appendChild(wrapper);

  // Tự động scroll xuống cuối
  chatBox.scrollTop = chatBox.scrollHeight;
}
