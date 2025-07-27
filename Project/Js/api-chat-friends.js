const chatInput = document.getElementById("chatInput");

chatInput.addEventListener("input", function () {
  this.style.height = "auto"; // Reset chiều cao
  this.style.height = this.scrollHeight + "px"; // Set chiều cao theo nội dung
});
