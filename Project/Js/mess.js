const messengerBtn = document.getElementById("messengerBtn");
const chatSidebar = document.getElementById("chatSidebar");

function toggleChatSidebar() {
  chatSidebar.classList.toggle("show");
}

messengerBtn.addEventListener("click", toggleChatSidebar);
