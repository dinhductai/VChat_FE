document.addEventListener("DOMContentLoaded", function () {
    const btnReport = document.getElementById("btn-report-user");
    let reportTypes = [];
    let selectedReportTypeId = null;

    // Tạo modal nếu chưa có
    let modal = document.getElementById("report-modal");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "report-modal";
        modal.className = "modal";
        modal.style.display = "none";
        modal.innerHTML = `
			<div class="modal-content upload-modal" style="max-width:400px;min-width:280px;">
				<span class="close-modal" id="close-report-modal" title="Đóng">×</span>
				<h3 style="margin-bottom:18px;text-align:center;color:#d32f2f;">Chọn lý do báo cáo</h3>
				<div id="report-type-list" style="margin-bottom:18px;"></div>
				<button id="btn-send-report" class="btn btn-danger w-100" style="font-weight:bold;">Gửi báo cáo</button>
			</div>
		`;
        document.body.appendChild(modal);
    }

    // Đóng modal
    document.getElementById("close-report-modal").onclick = function () {
        modal.style.display = "none";
    };

    // Sự kiện nút Báo cáo
    btnReport.onclick = async function () {
        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch("http://localhost:8080/api/report-types", {
                headers: { "Authorization": "Bearer " + token }
            });
            const json = await res.json();
            if (json.success && Array.isArray(json.data)) {
                reportTypes = json.data;
                showReportModal(reportTypes);
            } else {
                alert("Không lấy được danh sách loại báo cáo!");
            }
        } catch (err) {
            console.error("Lỗi khi lấy report type:", err);
            alert("Lỗi khi lấy loại báo cáo!");
        }
    };

    function showReportModal(types) {
        const listDiv = modal.querySelector("#report-type-list");
        listDiv.innerHTML = types.map(type => `
            <div class="form-check" style="margin-bottom:10px;">
                <input class="form-check-input" type="radio" name="reportType" id="reportType${type.reportTypeId}" value="${type.reportTypeId}" data-typename="${type.typeName}">
                <label class="form-check-label" for="reportType${type.reportTypeId}">
                    <b>${type.typeName}</b><br><span style="font-size:13px;color:#888;">${type.description}</span>
                </label>
            </div>
        `).join("");
        // Thêm ô nhập typeName và ghi chú
        listDiv.innerHTML += `
                <input type="text" id="input-typeName" style="display:none;" />
                <div style="margin-top:8px;">
                    <label for="input-additionalDetails" style="font-weight:500;">Ghi chú thêm:</label>
                    <textarea id="input-additionalDetails" class="form-control" rows="2" placeholder="Nhập ghi chú nếu có..."></textarea>
                </div>
            `;
        // Sự kiện chọn radio
        listDiv.querySelectorAll("input[name='reportType']").forEach(input => {
            input.onchange = function () {
                selectedReportTypeId = this.value;
                // Tự động điền typeName vào ô nhập
                const typeNameInput = document.getElementById("input-typeName");
                typeNameInput.value = this.getAttribute("data-typename");
            };
        });
        selectedReportTypeId = null;
        modal.style.display = "flex";
    }

    // Sự kiện gửi báo cáo
    modal.querySelector("#btn-send-report").onclick = async function () {
        // Kiểm tra đã chọn loại báo cáo
        const typeNameInput = document.getElementById("input-typeName");
        const additionalDetailsInput = document.getElementById("input-additionalDetails");
        const typeName = typeNameInput.value.trim();
        if (!selectedReportTypeId || !typeName) {
            alert("Vui lòng chọn loại báo cáo và nhập typeName!");
            return;
        }
        // Lấy thông tin người dùng
        const reporterId = localStorage.getItem("userId");
        // Lấy reportedId từ URL (?user-id=...)
        const params = new URLSearchParams(window.location.search);
        const reportedId = params.get("user-id");
        const additionalDetails = additionalDetailsInput.value.trim();
        const reportDate = new Date().toISOString();
        const token = localStorage.getItem("accessToken");

        // Gửi API
        try {
            const res = await fetch(`http://localhost:8080/api/report?typeName=${encodeURIComponent(typeName)}`, {
                method: "POST",
                headers: {
                    "Authorization": "Bearer " + token,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    reporterId: Number(reporterId),
                    reportedId: Number(reportedId),
                    additionalDetails,
                    reportDate
                })
            });
            const json = await res.json();
            if (json.success) {
                alert("Gửi báo cáo thành công!");
                modal.style.display = "none";
            } else {
                alert(json.message || "Gửi báo cáo thất bại!");
            }
        } catch (err) {
            console.error("Lỗi gửi báo cáo:", err);
            alert("Lỗi gửi báo cáo!");
        }
    };
});
