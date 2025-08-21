// let stompClient = null;
// let currentSubscribedPostId = null;
// let currentReceiverId = null;
// let subscribedChannel = "";
// const token = localStorage.getItem("accessToken");
// const userId = JSON.parse(atob(token.split(".")[1])).sub;

// function connect(postId) {
//   const socket = new SockJS("http://localhost:8080/ws");
//   stompClient = Stomp.over(socket);

//   stompClient.connect({ Authorization: "Bearer " + token }, (frame) => {
//     console.log("Đã kết nối WebSocket:", frame);

//     currentSubscribedPostId = postId;

//     stompClient.subscribe(`/topic/posts/${postId}/comments`, (message) => {
//       const comment = JSON.parse(message.body);
//       console.log(comment);
//       appendSingleComment(comment);
//     });

//     stompClient.subscribe("/user/queue/comments", (message) => {
//       const commentList = JSON.parse(message.body);
//       displayComments(commentList);
//     });

//     stompClient.send(`/app/comments.fetchAll/${postId}`, {}, {});
//   });
// }

let stompClient = null;
let currentSubscribedPostId = null;
let subscribedChannel = null;
const token = localStorage.getItem("accessToken");

function connectWebSocket(callback) {
  if (stompClient && stompClient.connected) return callback();

  const socket = new SockJS("http://localhost:8080/ws");
  stompClient = Stomp.over(socket);

  stompClient.connect({ Authorization: "Bearer " + token }, (frame) => {
    console.log("✅ WebSocket connected:", frame);
    callback();
  });
}

function disconnectWebSocket() {
  if (stompClient && stompClient.connected) {
    stompClient.disconnect(() => {
      console.log("🔌 WebSocket disconnected");
    });
    stompClient = null;
    currentSubscribedPostId = null;
    subscribedChannel = null;
  }
}

// function appendSingleComment(comment) {
//   const el = renderComment(comment, comment.level || 1);

//   if (comment.parentCommentId) {
//     const parent = document.querySelector(
//       `[data-comment-id='${comment.parentCommentId}']`
//     );
//     if (parent) {
//       const repliesContainer = parent.querySelector(".replies-container");
//       if (repliesContainer) {
//         repliesContainer.appendChild(el);
//       } else {
//         console.warn(
//           "Không tìm thấy .replies-container trong comment cha:",
//           comment.parentCommentId
//         );
//       }
//     } else {
//       console.warn("Không tìm thấy comment cha:", comment.parentCommentId);
//     }
//   } else {
//     const commentList = document.getElementById("commentList");
//     commentList.appendChild(el);
//   }
// }

// function sendComment() {
//   const modal = document.getElementById("imageModal");
//   const commentInput = document.getElementById("commentInput");
//   const content = commentInput.value;
//   const postId = modal.getAttribute("data-post-id");

//   const commentRequest = {
//     content,
//     postId,
//     parentCommentId: null,
//     level: 1,
//     isEdited: false,
//     isDeleted: false,
//     token,
//   };

//   stompClient.send(
//     `/app/comments.add/${postId}`,
//     {},
//     JSON.stringify(commentRequest)
//   );
//   commentInput.value = ""; // Reset nội dung
//   commentInput.style.height = "auto"; // Reset chiều cao nếu có autoGrow
// }

// function renderComment(comment, level = 1) {
//   const container = document.createElement("div");
//   container.className = `ms-${(level - 1) * 4} mb-2`;
//   container.setAttribute("data-comment-id", comment.commentId);

//   container.innerHTML = `
//     <div class="d-flex">
//       <img src="${
//         comment.photoUrl || "../images/user-default.webp"
//       }" class="rounded-circle me-2" style="width: 32px; height: 32px" />
//       <div>
//         <div class="bg-light rounded-3 p-2">
//           <strong>${comment.fullName || "Ẩn danh"}</strong>
//           <div class="text-muted small" style="word-break: break-word; white-space: pre-wrap;">${
//             comment.content
//           }</div>
//         </div>
//         <div class="d-flex gap-2" style="font-size: 12px;">
//           <a style="cursor: pointer">5d</a>
//           <a style="cursor: pointer">Like</a>
//           <a style="cursor: pointer" onclick="repComment(${
//             comment.commentId
//           })">Reply</a>
//         </div>
//         <div id="reply-input-${comment.commentId}" class="mt-2"></div>
//         <div class="replies-container"></div> <!-- ✅ nơi chứa các reply con -->
//       </div>
//     </div>
//   `;

//   if (comment.replies && comment.replies.length > 0) {
//     const repliesContainer = container.querySelector(".replies-container");
//     comment.replies.forEach((reply) => {
//       const replyEl = renderComment(reply, level + 1);
//       repliesContainer.appendChild(replyEl); // ✅ chèn vào đúng vùng reply
//     });
//   }

//   return container;
// }

// function displayComments(comments) {
//   const commentList = document.getElementById("commentList");
//   commentList.innerHTML = "";
//   (Array.isArray(comments) ? comments : [comments]).forEach((comment) => {
//     const el = renderComment(comment, 1);
//     commentList.appendChild(el);
//   });
// }

// function repComment(parentCommentId) {
//   document
//     .querySelectorAll("[id^='reply-input-']")
//     .forEach((el) => (el.innerHTML = ""));

//   const replyContainer = document.getElementById(
//     `reply-input-${parentCommentId}`
//   );
//   replyContainer.innerHTML = `
//   <div class="position-relative d-flex bg-white p-3 dark-mode-bg dark-mode-border w-100">
//     <img src="../images/IMG_2007.JPG" alt="" class="rounded-circle me-2" style="width: 35px; height: 35px" />
//     <div class="d-block gap-2 align-items-end rounded-3 p-2 dark-mode-input-container w-100" style="background-color: #f0f2f5">
//       <textarea
//         id="replyInput-${parentCommentId}"
//         class="form-control dark-mode-textarea"
//         placeholder="Viết phản hồi..."
//         rows="1"
//         style="width: 100%; max-height: 292px; overflow-y: auto; resize: none; padding: 10px 0; border: none; background-color: transparent"
//         oninput="autoGrow(this)"></textarea>
//       <div class="d-flex justify-content-between align-items-center mb-1">
//         <div class="d-flex justify-content-center align-items-center rounded-circle icon-hover-dark" style="width: 30px; height: 30px; cursor: pointer">
//           <i class="bi bi-emoji-smile text-dark dark-mode-icon" style="font-size: 15px"></i>
//         </div>
//         <div class="d-flex justify-content-center align-items-center rounded-circle icon-hover-dark" style="width: 30px; height: 30px; cursor: pointer" onclick="sendReply(${parentCommentId})">
//           <i class="bi bi-send-fill text-dark dark-mode-icon" style="font-size: 15px"></i>
//         </div>
//       </div>
//     </div>
//   </div>
// `;
// }

// function sendReply(parentCommentId) {
//   const modal = document.getElementById("imageModal");
//   const postId = modal.getAttribute("data-post-id");
//   const content = document.getElementById(
//     `replyInput-${parentCommentId}`
//   ).value;
//   if (!content.trim()) return;

//   const replyRequest = {
//     content,
//     postId,
//     parentCommentId,
//     level: 2,
//     isEdited: false,
//     isDeleted: false,
//     token,
//   };

//   stompClient.send(
//     `/app/comments.add/${postId}`,
//     {},
//     JSON.stringify(replyRequest)
//   );
//   document.getElementById(`reply-input-${parentCommentId}`).innerHTML = "";
// }

// function toggleReplyBox(commentId) {
//   const box = document.getElementById(`reply-input-${commentId}`);
//   box.style.display = box.style.display === "none" ? "block" : "none";
// }

// document.addEventListener("DOMContentLoaded", () => {
//   const modalElement = document.getElementById("imageModal");
//   if (modalElement) {
//     modalElement.addEventListener("hidden.bs.modal", function () {
//       console.log("❌ Modal bị đóng. Ngắt kết nối WebSocket nếu cần.");

//       if (stompClient && stompClient.connected) {
//         stompClient.disconnect(() => {
//           console.log("🔌 WebSocket đã được ngắt.");
//         });
//       }

//       currentSubscribedPostId = null;
//       resetModalState();
//     });
//   }
// });

// function createChatChannel(id1, id2) {
//   const min = Math.min(id1, id2);
//   const max = Math.max(id1, id2);
//   return "/topic/chat/" + min + "-" + max;
// }

// function startChat() {
//   const input = document.getElementById("receiverId").value;
//   if (!input) return alert("⚠️ Nhập ID người nhận");
//   currentReceiverId = parseInt(input);
//   const channel = createChatChannel(userId, currentReceiverId);

//   if (subscribedChannel !== channel) {
//     stompClient.subscribe(channel, (message) => {
//       const msg = JSON.parse(message.body);
//       console.log("📨 Nhận được response:", msg);
//       showMessage(msg, false);
//     });
//     subscribedChannel = channel;
//     console.log("📡 Subscribed to:", channel);
//   }
// }

// function sendMessage() {
//   const content = document.getElementById("messageInput").value.trim();
//   if (!currentReceiverId || !content)
//     return alert("⚠️ Chưa nhập tin nhắn hoặc người nhận");

//   stompClient.send(
//     "/app/message.private",
//     {},
//     JSON.stringify({
//       receiverId: currentReceiverId,
//       message: content,
//       token: token,
//     })
//   );

//   // 👇 Sửa lại để dùng đúng định dạng
//   showMessage({ message: content }, true);
//   document.getElementById("messageInput").value = "";
// }

// function showMessage(msg, isMe) {
//   const div = document.createElement("div");
//   div.className = isMe ? "me" : "other";
//   div.innerText = (isMe ? "Bạn: " : "Người khác: ") + msg.message;
//   document.getElementById("messages").appendChild(div);
// }
