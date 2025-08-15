const token = localStorage.getItem('accessToken');
const modal = new bootstrap.Modal(document.getElementById('reportTypeModal'));
const btnReportType = document.getElementById('btnReportType');
const reportTypeTableBody = document.getElementById('reportTypeTableBody');
const reportTypeForm = document.getElementById('reportTypeForm');
const reportTypeId = document.getElementById('reportTypeId');
const reportTypeName = document.getElementById('reportTypeName');
const reportTypeDesc = document.getElementById('reportTypeDesc');
const resetBtn = document.getElementById('resetReportTypeBtn');
const reportTypeSearch = document.getElementById('reportTypeSearch');

let reportTypes = [];

btnReportType.addEventListener('click', () => {
    modal.show();
    fetchReportTypes();
    resetForm();
});

function fetchReportTypes() {
    fetch('http://localhost:8080/api/admin/report-types', {
        headers: { "Authorization": `Bearer ${token}` }
    })
        .then(res => res.json())
        .then(data => {
            reportTypes = data.data || [];
            renderReportTypeTable();
        });
}

function renderReportTypeTable(filteredList) {
    const list = filteredList || reportTypes;
    reportTypeTableBody.innerHTML = '';
    list.forEach(rt => {
        reportTypeTableBody.innerHTML += `
            <tr>
                <td class="text-center">${rt.reportTypeId}</td>
                <td class="text-center">${rt.typeName}</td>
                <td class="text-center">${rt.description}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-warning me-1" onclick="editReportType(${rt.reportTypeId})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteReportType(${rt.reportTypeId})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
}

// Thêm/Sửa loại báo cáo
reportTypeForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const id = reportTypeId.value;
    const name = reportTypeName.value.trim();
    const desc = reportTypeDesc.value.trim();
    if (!name || !desc) {
        alert("Vui lòng nhập đầy đủ tên và mô tả!");
        return;
    }

    const body = JSON.stringify({ typeName: name, description: desc });

    if (id) {
        // Sửa
        fetch(`http://localhost:8080/api/admin/report-types/${id}`, {
            method: 'PUT',
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    alert("Cập nhật loại báo cáo thành công!");
                } else {
                    alert("Có lỗi khi cập nhật!");
                }
                fetchReportTypes();
                resetForm();
            });
    } else {
        // Thêm
        fetch('http://localhost:8080/api/admin/report-types', {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    alert("Thêm loại báo cáo thành công!");
                } else {
                    alert("Có lỗi khi thêm mới!");
                }
                fetchReportTypes();
                resetForm();
            });
    }
});

window.editReportType = function (id) {
    const rt = reportTypes.find(x => x.reportTypeId === id);
    if (rt) {
        reportTypeId.value = rt.reportTypeId;
        reportTypeName.value = rt.typeName;
        reportTypeDesc.value = rt.description;
    }
};

window.deleteReportType = function (id) {
    if (!confirm("Bạn có chắc muốn xóa loại báo cáo này?")) return;
    fetch(`http://localhost:8080/api/admin/report-types/${id}`, {
        method: 'DELETE',
        headers: { "Authorization": `Bearer ${token}` }
    })
        .then(() => {
            fetchReportTypes();
            resetForm();
        });
};

resetBtn.addEventListener('click', resetForm);

function resetForm() {
    reportTypeId.value = '';
    reportTypeName.value = '';
    reportTypeDesc.value = '';
}

reportTypeSearch.addEventListener('input', function () {
    const keyword = this.value.trim().toLowerCase();
    if (!keyword) {
        renderReportTypeTable();
        return;
    }
    const filtered = reportTypes.filter(rt =>
        rt.reportTypeId.toString().includes(keyword) ||
        rt.typeName.toLowerCase().includes(keyword) ||
        rt.description.toLowerCase().includes(keyword)
    );
    renderReportTypeTable(filtered);
});