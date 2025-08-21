document.addEventListener("DOMContentLoaded", async function () {
    console.log("match-other-profile.js loaded");
    const params = new URLSearchParams(window.location.search);
    const otherUserId = params.get("user-id");
    const token = localStorage.getItem("accessToken");
    const btnAddFriend = document.getElementById("btn-add-friend");
    console.log("otherUserId:", otherUserId);
    console.log("btnAddFriend:", btnAddFriend);

    if (!otherUserId || !btnAddFriend) {
        console.error("Không tìm thấy otherUserId hoặc nút btn-add-friend!");
        return;
    }

    let matchType = "UNKNOWN";

    try {
        const res = await fetch(`http://localhost:8080/api/match?otherUserId=${encodeURIComponent(otherUserId)}`, {
            headers: { Authorization: "Bearer " + token }
        });
        if (!res.ok) {
            console.error("API /api/match trả về lỗi:", res.status, res.statusText);
        }
        const json = await res.json();

        if (json.success && json.data && json.data.matchResponseType) {
            matchType = json.data.matchResponseType;
            switch (matchType) {
                case "MATCHED":
                    btnAddFriend.innerHTML = `<i class="fas fa-user-minus"></i> Hủy kết bạn`;
                    btnAddFriend.className = "btn btn-danger d-flex align-items-center";
                    break;
                case "UNKNOWN":
                    btnAddFriend.innerHTML = `<i class="fas fa-user-plus"></i> Kết bạn`;
                    btnAddFriend.className = "btn btn-primary d-flex align-items-center";
                    break;
                case "PENDING":
                    btnAddFriend.innerHTML = `<i class="fas fa-user-clock"></i> Hủy lời mời`;
                    btnAddFriend.className = "btn btn-warning d-flex align-items-center";
                    break;
                default:
                    btnAddFriend.innerHTML = `<i class="fas fa-user-plus"></i> Kết bạn`;
                    btnAddFriend.className = "btn btn-primary d-flex align-items-center";
            }
        } else {
            console.error("API /api/match trả về dữ liệu không hợp lệ:", json);
        }
    } catch (err) {
        console.error("Lỗi khi gọi API /api/match:", err);
    }

    btnAddFriend.onclick = async function () {
        console.log("Đã ấn nút kết bạn, matchType:", matchType);
        if (matchType === "UNKNOWN") {
            try {
                const res = await fetch(`http://localhost:8080/api/match/create?receiverId=${encodeURIComponent(otherUserId)}`, {
                    method: "POST",
                    headers: {
                        "Authorization": "Bearer " + token
                    }
                });
                if (!res.ok) {
                    console.error("API /api/match/create trả về lỗi:", res.status, res.statusText);
                }
                const json = await res.json();
                if (json.success) {
                    btnAddFriend.innerHTML = `<i class='fas fa-user-clock'></i> Hủy lời mời`;
                    btnAddFriend.className = "btn btn-warning d-flex align-items-center";
                    matchType = "PENDING";
                    console.log("Gửi lời mời kết bạn thành công!");
                } else {
                    console.error("API /api/match/create trả về lỗi:", json);
                    alert(json.message || "Gửi lời mời thất bại!");
                }
            } catch (err) {
                console.error("Lỗi khi gửi lời mời kết bạn:", err);
                alert("Lỗi khi gửi lời mời kết bạn!");
            }
        } else if (matchType === "PENDING") {
            // Hủy lời mời kết bạn
            try {
                const res = await fetch(`http://localhost:8080/api/match/update?receiverId=${encodeURIComponent(otherUserId)}&matchStatus=CANCEL`, {
                    method: "PUT",
                    headers: {
                        "Authorization": "Bearer " + token
                    }
                });
                if (!res.ok) {
                    console.error("API /api/match/update trả về lỗi:", res.status, res.statusText);
                }
                const json = await res.json();
                if (json.success) {
                    btnAddFriend.innerHTML = `<i class='fas fa-user-plus'></i> Kết bạn`;
                    btnAddFriend.className = "btn btn-primary d-flex align-items-center";
                    matchType = "UNKNOWN";
                    console.log("Hủy lời mời kết bạn thành công!");
                } else {
                    console.error("API /api/match/update trả về lỗi:", json);
                    alert(json.message || "Hủy lời mời thất bại!");
                }
            } catch (err) {
                console.error("Lỗi khi hủy lời mời kết bạn:", err);
                alert("Lỗi khi hủy lời mời kết bạn!");
            }
        } else if (matchType === "MATCHED") {
            // Hủy kết bạn
            try {
                const res = await fetch(`http://localhost:8080/api/match/update?receiverId=${encodeURIComponent(otherUserId)}&matchStatus=CANCEL`, {
                    method: "PUT",
                    headers: {
                        "Authorization": "Bearer " + token
                    }
                });
                if (!res.ok) {
                    console.error("API /api/match/update trả về lỗi:", res.status, res.statusText);
                }
                const json = await res.json();
                if (json.success) {
                    btnAddFriend.innerHTML = `<i class='fas fa-user-plus'></i> Kết bạn`;
                    btnAddFriend.className = "btn btn-primary d-flex align-items-center";
                    matchType = "UNKNOWN";
                    console.log("Hủy kết bạn thành công!");
                } else {
                    console.error("API /api/match/update trả về lỗi:", json);
                    alert(json.message || "Hủy kết bạn thất bại!");
                }
            } catch (err) {
                console.error("Lỗi khi hủy kết bạn:", err);
                alert("Lỗi khi hủy kết bạn!");
            }
        }
        // Các trường hợp khác sẽ xử lý sau
    };
});