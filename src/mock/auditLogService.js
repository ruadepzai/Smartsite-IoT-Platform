// Mock Service cho Module MA-6: Báo cáo & Nhật ký Audit (Audit Log)
// File: src/mock/auditLogService.js

export const AUDIT_ROLES = [
  { value: 'all', label: 'Tất cả Vai trò' },
  { value: 'AT-01', label: 'Quản trị hệ thống (AT-01)' },
  { value: 'AT-02', label: 'Nhân viên vận hành (AT-02)' },
  { value: 'SYSTEM', label: 'Hệ thống tự động (SYSTEM)' },
];

export const AUDIT_ACTORS = [
  { value: 'all', label: 'Tất cả Người thực hiện', role: 'all' },
  { value: 'Nguyễn Văn An', label: 'Nguyễn Văn An (Super Admin)', role: 'AT-01' },
  { value: 'Trần Thị Bình', label: 'Trần Thị Bình (Vận hành)', role: 'AT-02' },
  { value: 'Lê Hoàng Cường', label: 'Lê Hoàng Cường (Kỹ thuật)', role: 'AT-02' },
  { value: 'Phạm Minh Đức', label: 'Phạm Minh Đức (Kinh doanh)', role: 'AT-02' },
  { value: 'Hệ thống tự động', label: 'Hệ thống tự động', role: 'SYSTEM' },
];

export const AUDIT_TIME_RANGES = [
  { value: '7d', label: '7 ngày gần nhất' },
  { value: '30d', label: '30 ngày gần nhất' },
  { value: '90d', label: '90 ngày gần nhất' },
];

const INITIAL_AUDIT_LOGS = [
  // --- 7 NGÀY GẦN NHẤT ---
  {
    id: 'LOG-1025',
    timestamp: '20/08/2026 15:45:10',
    daysAgo: 0,
    actor: 'Nguyễn Văn An',
    actorRole: 'AT-01',
    actorEmail: 'admin@smartsite.io',
    action: 'Tải lên gói Firmware',
    actionType: 'CREATE',
    details: 'Tải lên gói firmware gw500_ota_v2.4.1.bin (v2.4.1-rc3) áp dụng cho model Gateway IoT GW-500 — Phạm vi: Tất cả Doanh nghiệp.',
    ip: '14.232.208.45',
  },
  {
    id: 'LOG-1024',
    timestamp: '20/08/2026 14:12:05',
    daysAgo: 0,
    actor: 'Trần Thị Bình',
    actorRole: 'AT-02',
    actorEmail: 'b.tran@smartsite.io',
    action: 'Cập nhật hạn mức Doanh nghiệp',
    actionType: 'UPDATE',
    details: 'Công ty TNHH MTV Thoát nước Đô thị TP.HCM (TNT-03) — Nâng hạn mức Gateway: 40 -> 60 trạm, Thiết bị: 500 -> 800.',
    ip: '113.190.234.12',
  },
  {
    id: 'LOG-1023',
    timestamp: '20/08/2026 11:30:22',
    daysAgo: 0,
    actor: 'Hệ thống tự động',
    actorRole: 'SYSTEM',
    actorEmail: 'system@smartsite.io',
    action: 'Cảnh báo quá tải hạ tầng',
    actionType: 'ALERT',
    details: 'Phát hiện tải CPU cụm TP.HCM (HCM-DC-02) chạm ngưỡng 88.5% — Tự động kích hoạt cơ chế cân bằng tải phụ trợ.',
    ip: '10.0.2.10',
  },
  {
    id: 'LOG-1022',
    timestamp: '20/08/2026 09:15:40',
    daysAgo: 0,
    actor: 'Nguyễn Văn An',
    actorRole: 'AT-01',
    actorEmail: 'admin@smartsite.io',
    action: 'Đăng nhập hệ thống',
    actionType: 'AUTH',
    details: 'Đăng nhập thành công vào Admin Console qua xác thực mật khẩu quản trị.',
    ip: '14.232.208.45',
  },
  {
    id: 'LOG-1021',
    timestamp: '19/08/2026 16:50:18',
    daysAgo: 1,
    actor: 'Lê Hoàng Cường',
    actorRole: 'AT-02',
    actorEmail: 'c.le@smartsite.io',
    action: 'Cập nhật phạm vi Firmware',
    actionType: 'UPDATE',
    details: 'Sửa phạm vi phân phối gói sn200_ota_v1.8.2.hex — Bổ sung Doanh nghiệp: Viettel Post (TNT-07).',
    ip: '171.244.10.89',
  },
  {
    id: 'LOG-1020',
    timestamp: '19/08/2026 15:20:00',
    daysAgo: 1,
    actor: 'Nguyễn Văn An',
    actorRole: 'AT-01',
    actorEmail: 'admin@smartsite.io',
    action: 'Khóa tài khoản nhân viên',
    actionType: 'LOCK',
    details: 'Khóa tài khoản nhân viên vận hành Hoàng Văn Em (e.hoang@smartsite.io) do chuyển công tác.',
    ip: '14.232.208.45',
  },
  {
    id: 'LOG-1019',
    timestamp: '19/08/2026 10:05:33',
    daysAgo: 1,
    actor: 'Trần Thị Bình',
    actorRole: 'AT-02',
    actorEmail: 'b.tran@smartsite.io',
    action: 'Tạo mới Doanh nghiệp',
    actionType: 'CREATE',
    details: 'Tạo mới hồ sơ Doanh nghiệp: Tổng công ty Cảng Hàng không Việt Nam (ACV) — Gói Custom, Mã hợp đồng: HD-2026-016.',
    ip: '113.190.234.12',
  },
  {
    id: 'LOG-1018',
    timestamp: '18/08/2026 14:40:12',
    daysAgo: 2,
    actor: 'Phạm Minh Đức',
    actorRole: 'AT-02',
    actorEmail: 'd.pham@smartsite.io',
    action: 'Gia hạn hợp đồng dịch vụ',
    actionType: 'UPDATE',
    details: 'Gia hạn hợp đồng dịch vụ 12 tháng cho Công ty Cổ phần Sữa Việt Nam (Vinamilk) — Hạn mới: 31/12/2027.',
    ip: '118.70.180.55',
  },
  {
    id: 'LOG-1017',
    timestamp: '18/08/2026 08:30:19',
    daysAgo: 2,
    actor: 'Trần Thị Bình',
    actorRole: 'AT-02',
    actorEmail: 'b.tran@smartsite.io',
    action: 'Đăng nhập hệ thống',
    actionType: 'AUTH',
    details: 'Đăng nhập thành công vào Admin Console qua trình duyệt Chrome.',
    ip: '113.190.234.12',
  },
  {
    id: 'LOG-1016',
    timestamp: '17/08/2026 17:10:45',
    daysAgo: 3,
    actor: 'Nguyễn Văn An',
    actorRole: 'AT-01',
    actorEmail: 'admin@smartsite.io',
    action: 'Cập nhật gói Plan Catalog',
    actionType: 'UPDATE',
    details: 'Chỉnh sửa thông tin gói Pro Catalog — Đổi đơn giá từ 2.200.000 ₫/tháng thành 2.500.000 ₫/tháng (Áp dụng cho hợp đồng mới).',
    ip: '14.232.208.45',
  },
  {
    id: 'LOG-1015',
    timestamp: '16/08/2026 11:25:00',
    daysAgo: 4,
    actor: 'Hệ thống tự động',
    actorRole: 'SYSTEM',
    actorEmail: 'system@smartsite.io',
    action: 'Sao lưu cơ sở dữ liệu định kỳ',
    actionType: 'SYSTEM',
    details: 'Sao lưu tự động toàn bộ cơ sở dữ liệu TimescaleDB và PostgreSQL snapshot lên S3 Cold Storage hoàn tất.',
    ip: '10.0.1.10',
  },
  {
    id: 'LOG-1014',
    timestamp: '15/08/2026 16:45:20',
    daysAgo: 5,
    actor: 'Lê Hoàng Cường',
    actorRole: 'AT-02',
    actorEmail: 'c.le@smartsite.io',
    action: 'Tải lên gói Firmware',
    actionType: 'CREATE',
    details: 'Tải lên gói firmware sm100_ota_v3.1.0.bin (v3.1.0) cho dòng Smart Meter SM-100 — Phạm vi: 3 Doanh nghiệp.',
    ip: '171.244.10.89',
  },
  {
    id: 'LOG-1013',
    timestamp: '14/08/2026 09:50:11',
    daysAgo: 6,
    actor: 'Nguyễn Văn An',
    actorRole: 'AT-01',
    actorEmail: 'admin@smartsite.io',
    action: 'Tạo mới tài khoản nhân viên',
    actionType: 'CREATE',
    details: 'Tạo tài khoản quản trị vận hành mới cho Phạm Minh Đức (d.pham@smartsite.io) — Gán vai trò Nhân viên Kinh doanh.',
    ip: '14.232.208.45',
  },

  // --- 30 NGÀY GẦN NHẤT ---
  {
    id: 'LOG-1012',
    timestamp: '10/08/2026 14:20:30',
    daysAgo: 10,
    actor: 'Nguyễn Văn An',
    actorRole: 'AT-01',
    actorEmail: 'admin@smartsite.io',
    action: 'Xóa gói dịch vụ',
    actionType: 'DELETE',
    details: 'Xóa gói dịch vụ thử nghiệm Test-Package-Beta khỏi Catalog — Đã xác nhận không có Tenant nào sử dụng.',
    ip: '14.232.208.45',
  },
  {
    id: 'LOG-1011',
    timestamp: '05/08/2026 10:15:18',
    daysAgo: 15,
    actor: 'Trần Thị Bình',
    actorRole: 'AT-02',
    actorEmail: 'b.tran@smartsite.io',
    action: 'Chuyển trạng thái Doanh nghiệp',
    actionType: 'UPDATE',
    details: 'Chuyển trạng thái Doanh nghiệp Công ty CP Năng Lượng Xanh từ "Đang hoạt động" sang "Tạm dừng" theo yêu cầu thanh lý hợp đồng.',
    ip: '113.190.234.12',
  },
  {
    id: 'LOG-1010',
    timestamp: '01/08/2026 08:45:00',
    daysAgo: 19,
    actor: 'Nguyễn Văn An',
    actorRole: 'AT-01',
    actorEmail: 'admin@smartsite.io',
    action: 'Đặt lại mật khẩu nhân viên',
    actionType: 'AUTH',
    details: 'Khởi tạo mã OTP và gửi liên kết đặt lại mật khẩu cho tài khoản Lê Hoàng Cường (c.le@smartsite.io).',
    ip: '14.232.208.45',
  },
  {
    id: 'LOG-1009',
    timestamp: '28/07/2026 15:30:22',
    daysAgo: 23,
    actor: 'Lê Hoàng Cường',
    actorRole: 'AT-02',
    actorEmail: 'c.le@smartsite.io',
    action: 'Xóa gói Firmware',
    actionType: 'DELETE',
    details: 'Xóa bản build thử nghiệm cũ gw500_v1.9.0_beta.bin khỏi hệ thống quản lý OTA.',
    ip: '171.244.10.89',
  },
  {
    id: 'LOG-1008',
    timestamp: '22/07/2026 11:00:15',
    daysAgo: 29,
    actor: 'Phạm Minh Đức',
    actorRole: 'AT-02',
    actorEmail: 'd.pham@smartsite.io',
    action: 'Tạo mới Doanh nghiệp',
    actionType: 'CREATE',
    details: 'Tạo mới hồ sơ Doanh nghiệp: Công ty Cổ phần Thép Hòa Phát Hải Dương (TNT-08) — Gói Custom, Hạn mức Gateway: 80 trạm.',
    ip: '118.70.180.55',
  },

  // --- 90 NGÀY GẦN NHẤT ---
  {
    id: 'LOG-1007',
    timestamp: '15/07/2026 09:10:40',
    daysAgo: 36,
    actor: 'Nguyễn Văn An',
    actorRole: 'AT-01',
    actorEmail: 'admin@smartsite.io',
    action: 'Tạo mới gói Plan Catalog',
    actionType: 'CREATE',
    details: 'Tạo mới gói dịch vụ tiêu chuẩn "Enterprise" với hạn mức 150 Gateway, 5000 Thiết bị, Lưu trữ 24 tháng, Đơn giá: 10.000.000 ₫/tháng.',
    ip: '14.232.208.45',
  },
  {
    id: 'LOG-1006',
    timestamp: '02/07/2026 16:40:11',
    daysAgo: 49,
    actor: 'Trần Thị Bình',
    actorRole: 'AT-02',
    actorEmail: 'b.tran@smartsite.io',
    action: 'Cập nhật thông tin Doanh nghiệp',
    actionType: 'UPDATE',
    details: 'Cập nhật địa chỉ liên hệ và người đại diện pháp luật của Công ty CP Cảng Đà Nẵng (TNT-04).',
    ip: '113.190.234.12',
  },
  {
    id: 'LOG-1005',
    timestamp: '20/06/2026 14:15:00',
    daysAgo: 61,
    actor: 'Hệ thống tự động',
    actorRole: 'SYSTEM',
    actorEmail: 'system@smartsite.io',
    action: 'Nâng cấp cụm máy chủ Broker',
    actionType: 'SYSTEM',
    details: 'Cập nhật phiên bản EMQX Broker Cluster lên v5.4.1 trên toàn bộ các node Hà Nội và TP.HCM.',
    ip: '10.0.1.10',
  },
  {
    id: 'LOG-1004',
    timestamp: '05/06/2026 10:20:18',
    daysAgo: 76,
    actor: 'Nguyễn Văn An',
    actorRole: 'AT-01',
    actorEmail: 'admin@smartsite.io',
    action: 'Khởi tạo hệ thống ban đầu',
    actionType: 'SYSTEM',
    details: 'Khởi tạo cơ sở dữ liệu hệ thống SmartSite Multi-Tenant Admin Console giai đoạn 1 hoàn tất.',
    ip: '14.232.208.45',
  },
];

export const auditLogService = {
  // Lấy danh sách logs kèm bộ lọc (FN-MA6-01 / UC-MA6-01)
  getAuditLogs(filters = {}) {
    const { timeRange = '7d', role = 'all', actor = 'all', keyword = '' } = filters;

    let maxDays = 7;
    if (timeRange === '30d') maxDays = 30;
    if (timeRange === '90d') maxDays = 90;

    const term = (keyword || '').trim().toLowerCase();

    return INITIAL_AUDIT_LOGS.filter((item) => {
      // 1. Lọc theo thời gian (7d, 30d, 90d)
      if (item.daysAgo > maxDays) return false;

      // 2. Lọc theo Vai trò (Role: AT-01, AT-02, SYSTEM)
      if (role !== 'all' && item.actorRole !== role) return false;

      // 3. Lọc theo Actor
      if (actor !== 'all' && item.actor !== actor) return false;

      // 4. Lọc theo từ khóa Hành động & Chi tiết (debounce)
      if (term) {
        const matchAction = item.action.toLowerCase().includes(term);
        const matchDetails = item.details.toLowerCase().includes(term);
        const matchActor = item.actor.toLowerCase().includes(term);
        const matchIp = item.ip.toLowerCase().includes(term);
        if (!matchAction && !matchDetails && !matchActor && !matchIp) {
          return false;
        }
      }

      return true;
    });
  },

  // Xuất file Excel (.xlsx) theo đúng bộ lọc đang áp dụng (FN-MA6-02 / UC-MA6-02)
  exportToExcel(logs = []) {
    if (!logs || logs.length === 0) {
      return {
        success: false,
        message: 'Không có dữ liệu để xuất — vui lòng điều chỉnh bộ lọc. (MSG-03)',
      };
    }

    // Tạo nội dung file Excel Spreadsheet dạng XML định dạng chuẩn .xlsx / .xml
    const headerRow = `
      <Row>
        <Cell><Data ss:Type="String">Mã Log</Data></Cell>
        <Cell><Data ss:Type="String">Thời gian</Data></Cell>
        <Cell><Data ss:Type="String">Người thực hiện (Actor)</Data></Cell>
        <Cell><Data ss:Type="String">Vai trò</Data></Cell>
        <Cell><Data ss:Type="String">Email</Data></Cell>
        <Cell><Data ss:Type="String">Loại hành động</Data></Cell>
        <Cell><Data ss:Type="String">Chi tiết thao tác</Data></Cell>
        <Cell><Data ss:Type="String">Địa chỉ IP</Data></Cell>
      </Row>
    `;

    const dataRows = logs
      .map(
        (log) => `
      <Row>
        <Cell><Data ss:Type="String">${escapeXml(log.id)}</Data></Cell>
        <Cell><Data ss:Type="String">${escapeXml(log.timestamp)}</Data></Cell>
        <Cell><Data ss:Type="String">${escapeXml(log.actor)}</Data></Cell>
        <Cell><Data ss:Type="String">${escapeXml(log.actorRole)}</Data></Cell>
        <Cell><Data ss:Type="String">${escapeXml(log.actorEmail)}</Data></Cell>
        <Cell><Data ss:Type="String">${escapeXml(log.action)}</Data></Cell>
        <Cell><Data ss:Type="String">${escapeXml(log.details)}</Data></Cell>
        <Cell><Data ss:Type="String">${escapeXml(log.ip)}</Data></Cell>
      </Row>
    `
      )
      .join('');

    const excelXml = `<?xml version="1.0"?>
      <?mso-application progid="Excel.Sheet"?>
      <Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
        xmlns:o="urn:schemas-microsoft-com:office:office"
        xmlns:x="urn:schemas-microsoft-com:office:excel"
        xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
        xmlns:html="http://www.w3.org/TR/REC-html40">
        <Worksheet ss:Name="Nhat_ky_Audit">
          <Table>
            ${headerRow}
            ${dataRows}
          </Table>
        </Worksheet>
      </Workbook>`;

    const blob = new Blob([excelXml], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
    link.href = url;
    link.download = `Nhat_ky_Audit_SmartSite_${dateStr}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return {
      success: true,
      message: 'Đã xuất file Nhật ký Audit. (MSG-04)',
    };
  },
};

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
