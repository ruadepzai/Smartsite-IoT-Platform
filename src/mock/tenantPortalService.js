// Mock Service cho Tenant Portal (Giai đoạn 2 — MT-1 -> MT-5)
// File: src/mock/tenantPortalService.js
import { tenantService } from './tenantService';

// Danh sách các Tenant tiêu biểu để chuyển đổi ngữ cảnh
export const TENANT_PROFILES = [
  {
    id: 'TNT-01',
    code: 'CP-1001',
    name: 'Tổng công ty Cảng Hàng không Việt Nam (ACV)',
    shortName: 'ACV Airport IoT',
    plan: 'Enterprise',
    maxGateways: 40,
    usedGateways: 28,
    maxDevices: 600,
    usedDevices: 450,
    maxUsers: 50,
    usedUsers: 14,
    status: 'Đang hoạt động',
    logoText: 'ACV',
    themeColor: '#0B72E7',
  },
  {
    id: 'TNT-02',
    code: 'CP-1002',
    name: 'Công ty Cổ phần Sữa Việt Nam (Vinamilk)',
    shortName: 'Vinamilk Smart Farm & Factory',
    plan: 'Enterprise',
    maxGateways: 50,
    usedGateways: 36,
    maxDevices: 800,
    usedDevices: 620,
    maxUsers: 60,
    usedUsers: 22,
    status: 'Đang hoạt động',
    logoText: 'VNM',
    themeColor: '#10B981',
  },
  {
    id: 'TNT-03',
    code: 'CP-1003',
    name: 'Công ty TNHH MTV Thoát nước Đô thị TP.HCM',
    shortName: 'TP.HCM Drainage IoT',
    plan: 'Pro',
    maxGateways: 20,
    usedGateways: 14,
    maxDevices: 250,
    usedDevices: 180,
    maxUsers: 20,
    usedUsers: 8,
    status: 'Đang hoạt động',
    logoText: 'UDC',
    themeColor: '#06B6D4',
  },
];

// Cây cấu trúc không gian tài sản (Asset Hierarchy: Khu vực -> Tòa nhà -> Tầng -> Phòng)
const INITIAL_ASSET_TREE = [
  {
    id: 'REG-01',
    name: 'Khu vực Miền Bắc — Cảng HKQT Nội Bài',
    type: 'region',
    code: 'KV-NB',
    children: [
      {
        id: 'BLD-01',
        name: 'Nhà ga Hành khách T2 (Quốc tế)',
        type: 'building',
        code: 'T2-INTL',
        lat: 21.2212,
        lng: 105.8072,
        address: 'Sân bay Quốc tế Nội Bài, Sóc Sơn, Hà Nội',
        status: 'warning', // có cảnh báo warning
        deviceCount: 142,
        children: [
          {
            id: 'FLR-01',
            name: 'Tầng 1 — Khu vực Ga đến & Băng chuyền Hành lý',
            type: 'floor',
            children: [
              { id: 'RM-01', name: 'Phòng Kỹ thuật Điện & HVAC Trung tâm (RM-101)', type: 'room', deviceCount: 18 },
              { id: 'RM-02', name: 'Sảnh Đón khách & Băng chuyền số 4 (RM-102)', type: 'room', deviceCount: 24 },
            ],
          },
          {
            id: 'FLR-02',
            name: 'Tầng 3 — Khu vực Ga đi & Quầy Check-in',
            type: 'floor',
            children: [
              { id: 'RM-03', name: 'Khu vực Soát vé An ninh A (RM-301)', type: 'room', deviceCount: 32 },
              { id: 'RM-04', name: 'Phòng Server Cảng Hàng không (RM-302)', type: 'room', deviceCount: 22 },
            ],
          },
        ],
      },
      {
        id: 'BLD-02',
        name: 'Nhà ga Hàng hóa ALS Cargo',
        type: 'building',
        code: 'ALS-CARGO',
        lat: 21.2268,
        lng: 105.8125,
        address: 'Khu công nghiệp Nội Bài, Hà Nội',
        status: 'normal',
        deviceCount: 88,
        children: [
          {
            id: 'FLR-03',
            name: 'Tầng 1 — Kho Lạnh Dược phẩm & Thực phẩm',
            type: 'floor',
            children: [
              { id: 'RM-05', name: 'Kho Lạnh Âm sâu -20°C (RM-C01)', type: 'room', deviceCount: 28 },
              { id: 'RM-06', name: 'Khu Phân loại Tự động (RM-C02)', type: 'room', deviceCount: 35 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'REG-02',
    name: 'Khu vực Miền Nam — Cảng HKQT Tân Sơn Nhất',
    type: 'region',
    code: 'KV-TSN',
    children: [
      {
        id: 'BLD-03',
        name: 'Nhà ga Quốc nội T1',
        type: 'building',
        code: 'T1-DOM',
        lat: 10.8185,
        lng: 106.6588,
        address: 'Quận Tân Bình, TP. Hồ Chí Minh',
        status: 'critical', // có cảnh báo critical
        deviceCount: 165,
        children: [
          {
            id: 'FLR-04',
            name: 'Tầng Trệt — Trung tâm Điều hành Khẩn cấp',
            type: 'floor',
            children: [
              { id: 'RM-07', name: 'Phòng Điều khiển Trung tâm TOC (RM-TOC)', type: 'room', deviceCount: 45 },
            ],
          },
        ],
      },
    ],
  },
];

// Danh sách Thiết bị IoT (MT-2 & MT-3) — Đầy đủ trạng thái Online, Offline, Offline > 24h (BR-T08)
const INITIAL_DEVICES = [
  {
    id: 'DEV-101',
    code: 'GW-NB-001',
    name: 'Gateway Trung tâm Ga T2',
    category: 'Gateway IoT',
    model: 'Gateway IoT GW-500',
    deviceProfile: 'GW-500-MODBUS',
    room: 'Phòng Kỹ thuật Điện & HVAC Trung tâm (RM-101)',
    building: 'Nhà ga Hành khách T2 (Quốc tế)',
    status: 'ONLINE',
    offlineHours: 0,
    firmware: 'v2.4.1-rc3',
    ip: '192.168.10.15',
    lastSeen: 'Vừa xong',
    telemetry: {
      cpu: 42,
      ram: 58,
      connectedSensors: 24,
      networkLatency: '12ms',
    },
  },
  {
    id: 'DEV-102',
    code: 'TH-SVR-01',
    name: 'Cảm biến Nhiệt ẩm Phòng Server RM-302',
    category: 'Cảm biến Môi trường',
    model: 'Sensor Node SN-200',
    deviceProfile: 'SN-200-MQTT',
    room: 'Phòng Server Cảng Hàng không (RM-302)',
    building: 'Nhà ga Hành khách T2 (Quốc tế)',
    status: 'ONLINE',
    offlineHours: 0,
    firmware: 'v1.8.2',
    ip: '192.168.10.42',
    lastSeen: '1 phút trước',
    telemetry: {
      temperature: 23.4,
      humidity: 52.1,
      battery: 94,
      signalRssi: -62,
    },
  },
  {
    id: 'DEV-103',
    code: 'PWR-HVAC-01',
    name: 'Đồng hồ Đo đếm Điện Năng Chiller T2',
    category: 'Đồng hồ Năng lượng',
    model: 'Smart Meter SM-100',
    deviceProfile: 'SM-100-PULSE',
    room: 'Phòng Kỹ thuật Điện & HVAC Trung tâm (RM-101)',
    building: 'Nhà ga Hành khách T2 (Quốc tế)',
    status: 'ONLINE',
    offlineHours: 0,
    firmware: 'v3.1.0',
    ip: '192.168.10.88',
    lastSeen: 'Vừa xong',
    telemetry: {
      voltage: 382.5,
      current: 45.2,
      activePower: 28.4,
      powerFactor: 0.95,
      totalEnergyKwh: 148520,
    },
  },
  {
    id: 'DEV-104',
    code: 'COLD-SN-04',
    name: 'Cảm biến Kho Lạnh Âm sâu #01',
    category: 'Cảm biến Môi trường',
    model: 'Sensor Node SN-200',
    deviceProfile: 'SN-200-MQTT',
    room: 'Kho Lạnh Âm sâu -20°C (RM-C01)',
    building: 'Nhà ga Hàng hóa ALS Cargo',
    status: 'WARNING',
    offlineHours: 0,
    firmware: 'v1.8.2',
    ip: '192.168.20.104',
    lastSeen: '2 phút trước',
    telemetry: {
      temperature: -14.8, // Quá ngưỡng -18°C -> Warning
      humidity: 82.5,
      battery: 88,
      signalRssi: -71,
    },
  },
  {
    id: 'DEV-105',
    code: 'PUMP-TOC-01',
    name: 'Máy bơm Cứu hỏa Tòa nhà TSN',
    category: 'Bộ chấp hành',
    model: 'Gateway IoT GW-200',
    deviceProfile: 'GW-500-MODBUS',
    room: 'Phòng Điều khiển Trung tâm TOC (RM-TOC)',
    building: 'Nhà ga Quốc nội T1',
    status: 'CRITICAL',
    offlineHours: 0,
    firmware: 'v1.5.0',
    ip: '192.168.30.12',
    lastSeen: '10 phút trước',
    telemetry: {
      pressureBar: 2.1, // Quá thấp -> Critical
      motorStatus: 'STOPPED',
      flowRate: 0,
    },
  },
  {
    id: 'DEV-106',
    code: 'GW-ALS-02',
    name: 'Gateway Phân loại Tự động ALS',
    category: 'Gateway IoT',
    model: 'Gateway IoT GW-500',
    deviceProfile: 'GW-500-MODBUS',
    room: 'Khu Phân loại Tự động (RM-C02)',
    building: 'Nhà ga Hàng hóa ALS Cargo',
    status: 'ONLINE',
    offlineHours: 0,
    firmware: 'v2.4.1-rc3',
    ip: '192.168.20.15',
    lastSeen: '30 giây trước',
    telemetry: {
      cpu: 35,
      ram: 50,
      connectedSensors: 16,
      networkLatency: '8ms',
    },
  },
  {
    id: 'DEV-107',
    code: 'TH-CHK-02',
    name: 'Cảm biến Sảnh Soát vé An ninh A',
    category: 'Cảm biến Môi trường',
    model: 'Sensor Node SN-200',
    deviceProfile: 'SN-200-MQTT',
    room: 'Khu vực Soát vé An ninh A (RM-301)',
    building: 'Nhà ga Hành khách T2 (Quốc tế)',
    status: 'OFFLINE',
    offlineHours: 3, // Mất kết nối 3h
    firmware: 'v1.8.2',
    ip: '192.168.10.66',
    lastSeen: '3 giờ trước',
    telemetry: {
      temperature: 26.1,
      humidity: 60.0,
      battery: 12,
      signalRssi: -95,
    },
  },
  {
    id: 'DEV-108',
    code: 'SM-CARGO-01',
    name: 'Đồng hồ Đo Điện Kho Lạnh ALS',
    category: 'Đồng hồ Năng lượng',
    model: 'Smart Meter SM-100',
    deviceProfile: 'SM-100-PULSE',
    room: 'Kho Lạnh Âm sâu -20°C (RM-C01)',
    building: 'Nhà ga Hàng hóa ALS Cargo',
    status: 'OFFLINE',
    offlineHours: 38, // Mất kết nối 38h > 24h kích hoạt cảnh báo đỏ BR-T08
    firmware: 'v3.1.0',
    ip: '192.168.20.88',
    lastSeen: 'Hơn 1 ngày trước',
    telemetry: {
      voltage: 0,
      current: 0,
      activePower: 0,
      powerFactor: 0,
      totalEnergyKwh: 92400,
    },
  },
];

// Danh sách Cảnh báo (Alerts Center - MT-3)
const INITIAL_ALERTS = [
  {
    id: 'ALT-3001',
    severity: 'CRITICAL', // CRITICAL / WARNING / INFO
    title: 'Áp suất máy bơm PUMP-TOC-01 tụt dưới ngưỡng an toàn (2.1 bar)',
    device: 'Máy bơm Cứu hỏa Tòa nhà TSN (DEV-105)',
    room: 'Phòng Điều khiển Trung tâm TOC (RM-TOC)',
    building: 'Nhà ga Quốc nội T1',
    status: 'UNACKNOWLEDGED', // UNACKNOWLEDGED (Chưa xử lý) | IN_PROGRESS (Đang xử lý) | RESOLVED (Hoàn thành)
    triggeredAt: '20/08/2026 15:30:15',
    acknowledgedBy: null,
    resolvedAt: null,
    note: '',
    channels: ['SMS', 'Email', 'In-App'],
  },
  {
    id: 'ALT-3002',
    severity: 'WARNING',
    title: 'Nhiệt độ Kho Lạnh ALS vượt ngưỡng cảnh báo (-14.8°C > -18°C)',
    device: 'Cảm biến Kho Lạnh Âm sâu #01 (DEV-104)',
    room: 'Kho Lạnh Âm sâu -20°C (RM-C01)',
    building: 'Nhà ga Hàng hóa ALS Cargo',
    status: 'IN_PROGRESS',
    triggeredAt: '20/08/2026 14:15:00',
    acknowledgedBy: 'Trần Thị Mai (Kỹ thuật viên)',
    resolvedAt: null,
    note: 'Đang cử nhân viên bảo trì kiểm tra cửa gió dàn bay hơi block B.',
    channels: ['Email', 'In-App'],
  },
  {
    id: 'ALT-3003',
    severity: 'INFO',
    title: 'Gateway GW-NB-001 tự động đồng bộ 24 thiết bị cảm biến',
    device: 'Gateway Trung tâm Ga T2 (DEV-101)',
    room: 'Phòng Kỹ thuật Điện & HVAC Trung tâm (RM-101)',
    building: 'Nhà ga Hành khách T2 (Quốc tế)',
    status: 'RESOLVED',
    triggeredAt: '20/08/2026 10:00:22',
    acknowledgedBy: 'Hệ thống tự động',
    resolvedAt: '20/08/2026 10:01:00',
    note: 'Đồng bộ tham số telemetry chu kỳ 10s hoàn tất.',
    channels: ['In-App'],
  },
];

// Lịch sử lệnh điều khiển RPC (MT-3)
const INITIAL_RPC_LOGS = [
  {
    id: 'RPC-501',
    deviceId: 'DEV-105',
    deviceName: 'Máy bơm Cứu hỏa Tòa nhà TSN',
    method: 'setMotorState',
    params: '{"power": "ON", "speedRpm": 1450}',
    status: 'FAILED', // PENDING / SUCCESS / FAILED / TIMEOUT (BR-T15)
    sentBy: 'Nguyễn Hoàng Long (Tenant Admin)',
    sentAt: '20/08/2026 15:35:10',
    responseMessage: 'Mất áp lực đường ống — Rơ-le an toàn từ chối khởi động (Error: E-PRESSURE-LOW)',
  },
  {
    id: 'RPC-502',
    deviceId: 'DEV-103',
    deviceName: 'Đồng hồ Đo đếm Điện Năng Chiller T2',
    method: 'resetSubMeterKwh',
    params: '{"channel": 1}',
    status: 'SUCCESS',
    sentBy: 'Nguyễn Hoàng Long (Tenant Admin)',
    sentAt: '20/08/2026 09:00:00',
    responseMessage: 'Thiết lập lại bộ đếm chu kỳ tháng mới thành công.',
  },
  {
    id: 'RPC-503',
    deviceId: 'DEV-101',
    deviceName: 'Gateway Trung tâm Ga T2',
    method: 'triggerOtaSync',
    params: '{"targetVersion": "v2.4.1-rc3"}',
    status: 'SUCCESS',
    sentBy: 'Trần Thị Mai (Kỹ thuật viên)',
    sentAt: '19/08/2026 16:30:20',
    responseMessage: 'Khởi chạy nạp Firmware OTA thành công. Thiết bị đã khởi động lại.',
  },
];

// Danh sách Nhân viên / User nội bộ của Tenant (MT-4)
const INITIAL_TENANT_USERS = [
  {
    id: 'USR-01',
    name: 'Nguyễn Hoàng Long',
    email: 'long.nh@acv.vn',
    phone: '0912 345 678',
    role: 'AT-03', // Tenant Admin
    assignedRooms: ['ALL'],
    status: 'ACTIVE', // ACTIVE / SUSPENDED (BR-T21)
    createdAt: '01/06/2026',
    lastLogin: '20/08/2026 15:40:12',
  },
  {
    id: 'USR-02',
    name: 'Trần Thị Mai',
    email: 'mai.tt@acv.vn',
    phone: '0988 123 456',
    role: 'AT-04', // Tenant User
    assignedRooms: ['Phòng Kỹ thuật Điện & HVAC Trung tâm (RM-101)', 'Phòng Server Cảng Hàng không (RM-302)'],
    status: 'ACTIVE',
    createdAt: '15/06/2026',
    lastLogin: '20/08/2026 14:20:00',
  },
  {
    id: 'USR-03',
    name: 'Lê Văn Hùng',
    email: 'hung.lv@acv.vn',
    phone: '0903 789 012',
    role: 'AT-04', // Tenant User
    assignedRooms: ['Kho Lạnh Âm sâu -20°C (RM-C01)', 'Khu Phân loại Tự động (RM-C02)'],
    status: 'ACTIVE',
    createdAt: '20/06/2026',
    lastLogin: '18/08/2026 09:15:30',
  },
  {
    id: 'USR-04',
    name: 'Phạm Minh Tuấn',
    email: 'tuan.pm@acv.vn',
    phone: '0977 654 321',
    role: 'AT-04',
    assignedRooms: [],
    status: 'SUSPENDED', // Vô hiệu hóa
    createdAt: '01/07/2026',
    lastLogin: '05/08/2026 11:00:00',
  },
];

export const tenantPortalService = {
  // Lấy danh sách Tenant Profiles
  getProfiles() {
    return TENANT_PROFILES;
  },

  // Lấy Profile hiện tại (Mặc định ACV)
  getCurrentProfile(profileId = 'TNT-01') {
    return TENANT_PROFILES.find((p) => p.id === profileId) || TENANT_PROFILES[0];
  },

  // Lấy cây tài sản (Asset Hierarchy)
  getAssetTree() {
    return INITIAL_ASSET_TREE;
  },

  // Lấy danh sách thiết bị
  getDevices() {
    return INITIAL_DEVICES;
  },

  // Lấy danh sách cảnh báo
  getAlerts() {
    return INITIAL_ALERTS;
  },

  // Chuyển trạng thái xử lý cảnh báo (FN-MT3-06 / UC-MT3-06)
  updateAlertStatus(alertId, newStatus, note = '') {
    const alert = INITIAL_ALERTS.find((a) => a.id === alertId);
    if (alert) {
      alert.status = newStatus;
      if (newStatus === 'IN_PROGRESS') {
        alert.acknowledgedBy = 'Nguyễn Hoàng Long (Tenant Admin)';
      } else if (newStatus === 'RESOLVED') {
        alert.resolvedAt = '20/08/2026 15:55:00';
      }
      if (note) alert.note = note;
      return { success: true, alert };
    }
    return { success: false, message: 'Không tìm thấy cảnh báo.' };
  },

  // Gửi lệnh RPC điều khiển (FN-MT3-02 / UC-MT3-02 — BR-T15)
  sendRpcCommand(deviceId, method, params) {
    const device = INITIAL_DEVICES.find((d) => d.id === deviceId);
    const newRpc = {
      id: `RPC-${String(INITIAL_RPC_LOGS.length + 501)}`,
      deviceId,
      deviceName: device ? device.name : 'Thiết bị IoT',
      method,
      params: typeof params === 'string' ? params : JSON.stringify(params),
      status: 'SUCCESS',
      sentBy: 'Nguyễn Hoàng Long (Tenant Admin)',
      sentAt: 'Vừa xong',
      responseMessage: 'Lệnh điều khiển đã thực thi thành công trên thiết bị.',
    };
    INITIAL_RPC_LOGS.unshift(newRpc);
    return { success: true, rpc: newRpc };
  },

  // Lấy lịch sử lệnh RPC (FN-MT3-03)
  getRpcLogs() {
    return INITIAL_RPC_LOGS;
  },

  // Lấy danh sách Người dùng / Nhân viên nội bộ (MT-4)
  getTenantUsers() {
    return INITIAL_TENANT_USERS.filter((u) => !u.is_deleted);
  },

  // Tạo tài khoản nhân viên mới (FN-MT4-01 / UC-MT4-01)
  createTenantUser(userData) {
    const activeUsers = INITIAL_TENANT_USERS.filter((u) => !u.is_deleted);
    const maxUsers = 50; // Giới hạn max_users theo gói dịch vụ

    // EF-01: Kiểm tra hạn mức max_users (BR-T18)
    if (activeUsers.length >= maxUsers) {
      return {
        success: false,
        message: `Đã đạt giới hạn số lượng tài khoản người dùng theo gói dịch vụ hiện tại (${activeUsers.length}/${maxUsers}). Vui lòng liên hệ để nâng hạn mức. (EF-01 / BR-T18)`,
      };
    }

    // EF-02: Kiểm tra trùng email
    const duplicateEmail = activeUsers.some(
      (u) => u.email.toLowerCase() === userData.email.trim().toLowerCase()
    );
    if (duplicateEmail) {
      return {
        success: false,
        message: 'Email đã tồn tại trong hệ thống. Vui lòng sử dụng email khác. (EF-02)',
      };
    }

    const newUser = {
      id: `USR-${String(Date.now()).slice(-4)}`,
      name: userData.name.trim(),
      email: userData.email.trim(),
      phone: userData.phone || '',
      role: userData.role || 'AT-04',
      assignedRooms: userData.assignedRooms || [],
      status: 'ACTIVE',
      is_deleted: false,
      createdAt: 'Hôm nay',
      lastLogin: 'Chưa đăng nhập',
    };

    INITIAL_TENANT_USERS.push(newUser);
    return {
      success: true,
      message: `Tạo tài khoản nhân viên ${newUser.name} thành công. Mật khẩu tạm đã được gửi tới ${newUser.email} (BR-T34).`,
      user: newUser,
    };
  },

  // Cập nhật tài khoản nhân viên (FN-MT4-02 / UC-MT4-03)
  updateTenantUser(userId, updateData) {
    const user = INITIAL_TENANT_USERS.find((u) => u.id === userId && !u.is_deleted);
    if (!user) return { success: false, message: 'Không tìm thấy tài khoản người dùng.' };

    // EF-01: Chặn Tenant Admin tự vô hiệu hóa tài khoản của chính mình (BR-T22)
    if (user.role === 'AT-03' && updateData.status === 'SUSPENDED') {
      return {
        success: false,
        message: 'Bạn không thể tự vô hiệu hóa tài khoản của chính mình. (BR-T22 / EF-01)',
      };
    }

    if (updateData.name) user.name = updateData.name.trim();
    if (updateData.phone !== undefined) user.phone = updateData.phone;
    if (updateData.assignedRooms) user.assignedRooms = updateData.assignedRooms;
    if (updateData.status) user.status = updateData.status;

    return {
      success: true,
      message: `Cập nhật thông tin nhân viên ${user.name} thành công. Quyền truy cập mới có hiệu lực ngay lập tức.`,
      user,
    };
  },

  // Xóa tài khoản nhân viên (Soft-delete — BR-T38 / UC-MT4-03)
  deleteTenantUser(userId) {
    const user = INITIAL_TENANT_USERS.find((u) => u.id === userId && !u.is_deleted);
    if (!user) return { success: false, message: 'Không tìm thấy tài khoản người dùng.' };

    // EF-01: Chặn Tenant Admin tự xóa tài khoản của chính mình (BR-T22)
    if (user.role === 'AT-03') {
      return {
        success: false,
        message: 'Bạn không thể tự xóa tài khoản của chính mình. (BR-T22 / EF-01)',
      };
    }

    // Soft-delete (BR-T38)
    user.is_deleted = true;
    return {
      success: true,
      message: `Đã gỡ bỏ tài khoản ${user.name} khỏi hệ thống (Soft-delete — BR-T38).`,
    };
  },

  // Toggle kích hoạt / Vô hiệu hóa tài khoản User (BR-T21 / BR-T22)
  toggleUserStatus(userId) {
    const user = INITIAL_TENANT_USERS.find((u) => u.id === userId && !u.is_deleted);
    if (!user) return { success: false, message: 'Không tìm thấy người dùng.' };

    if (user.role === 'AT-03') {
      return { success: false, message: 'Tenant Admin không thể tự vô hiệu hóa chính mình. (BR-T22)' };
    }

    user.status = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    return {
      success: true,
      message: `Đã ${user.status === 'ACTIVE' ? 'kích hoạt' : 'vô hiệu hóa'} tài khoản ${user.name}.`,
      user,
    };
  },
};
