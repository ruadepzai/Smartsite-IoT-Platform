// Mock Service cho Module MA-5: Quản lý Firmware OTA
// File: src/mock/firmwareService.js
import { tenantService } from './tenantService';

const FIRMWARE_STORAGE_KEY = 'smartsite_firmwares';

export const COMPATIBLE_MODELS = [
  { value: 'Gateway IoT GW-500', label: 'Gateway IoT GW-500 (Công nghiệp Cao cấp)' },
  { value: 'Gateway IoT GW-200', label: 'Gateway IoT GW-200 (Compact Edge)' },
  { value: 'Sensor Node SN-200', label: 'Sensor Node SN-200 (Cảm biến Môi trường)' },
  { value: 'Smart Meter SM-100', label: 'Smart Meter SM-100 (Đo đếm Năng lượng)' },
];

const INITIAL_FIRMWARES = [
  {
    id: 'FW-01',
    fileName: 'gw500_ota_v2.4.1.bin',
    version: 'v2.4.1-rc3',
    targetModel: 'Gateway IoT GW-500',
    size: '14.2 MB',
    scope: 'all',
    assignedTenants: [],
    status: 'Phát hành',
    updatedDevices: 145,
    totalCompatibleDevices: 298,
    createdAt: '15/08/2026 10:30',
    notes: 'Bản cập nhật tối ưu hóa TLS 1.3 và vá lỗi tràn bộ nhớ buffer MQTT.',
  },
  {
    id: 'FW-02',
    fileName: 'gw500_ota_v2.4.0.bin',
    version: 'v2.4.0',
    targetModel: 'Gateway IoT GW-500',
    size: '13.8 MB',
    scope: 'all',
    assignedTenants: [],
    status: 'Ổn định',
    updatedDevices: 280,
    totalCompatibleDevices: 298,
    createdAt: '01/07/2026 14:15',
    notes: 'Phiên bản ổn định hỗ trợ chuẩn EMQX v5 và cấu hình từ xa OTA.',
  },
  {
    id: 'FW-03',
    fileName: 'sn200_ota_v1.8.2.hex',
    version: 'v1.8.2',
    targetModel: 'Sensor Node SN-200',
    size: '2.1 MB',
    scope: 'specific',
    assignedTenants: ['TNT-01', 'TNT-02', 'TNT-07'],
    status: 'Ổn định',
    updatedDevices: 820,
    totalCompatibleDevices: 1250,
    createdAt: '12/06/2026 09:40',
    notes: 'Cải thiện thời lượng pin và thuật toán tiết kiệm năng lượng Deep Sleep.',
  },
  {
    id: 'FW-04',
    fileName: 'gw200_ota_v1.5.0.bin',
    version: 'v1.5.0',
    targetModel: 'Gateway IoT GW-200',
    size: '8.6 MB',
    scope: 'all',
    assignedTenants: [],
    status: 'Ổn định',
    updatedDevices: 95,
    totalCompatibleDevices: 110,
    createdAt: '25/05/2026 16:20',
    notes: 'Bản phát hành chính thức cho dòng Gateway Compact.',
  },
  {
    id: 'FW-05',
    fileName: 'sm100_ota_v3.1.0.bin',
    version: 'v3.1.0',
    targetModel: 'Smart Meter SM-100',
    size: '4.2 MB',
    scope: 'specific',
    assignedTenants: ['TNT-01', 'TNT-06', 'TNT-11'],
    status: 'Phát hành',
    updatedDevices: 450,
    totalCompatibleDevices: 600,
    createdAt: '18/05/2026 11:10',
    notes: 'Hỗ trợ đo chỉ số công suất phản kháng và giao thức DLMS chuẩn quốc tế.',
  },
  {
    id: 'FW-06',
    fileName: 'gw500_ota_v2.3.9.bin',
    version: 'v2.3.9',
    targetModel: 'Gateway IoT GW-500',
    size: '13.5 MB',
    scope: 'all',
    assignedTenants: [],
    status: 'Lưu trữ',
    updatedDevices: 298,
    totalCompatibleDevices: 298,
    createdAt: '10/04/2026 08:30',
    notes: 'Bản build lưu trữ cũ phục vụ rollback dự phòng.',
  },
];

function initFirmwareStorage() {
  if (!localStorage.getItem(FIRMWARE_STORAGE_KEY)) {
    localStorage.setItem(FIRMWARE_STORAGE_KEY, JSON.stringify(INITIAL_FIRMWARES));
  }
}

initFirmwareStorage();

export const firmwareService = {
  // Lấy toàn bộ danh sách gói firmware
  getFirmwares() {
    initFirmwareStorage();
    try {
      const data = localStorage.getItem(FIRMWARE_STORAGE_KEY);
      const parsed = data ? JSON.parse(data) : INITIAL_FIRMWARES;
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_FIRMWARES;
    } catch {
      return INITIAL_FIRMWARES;
    }
  },

  // Lấy chi tiết 1 gói firmware theo ID
  getFirmwareById(id) {
    const list = this.getFirmwares();
    return list.find((f) => f.id === id) || null;
  },

  // Đếm số lượng Tenant đang có quyền truy cập / sử dụng gói này
  getTenantCountUsingFirmware(firmware) {
    if (!firmware) return 0;
    if (firmware.scope === 'all') {
      return tenantService.getTenants().length;
    }
    return firmware.assignedTenants ? firmware.assignedTenants.length : 0;
  },

  // Tạo / Tải lên gói Firmware mới (FN-MA5-01 / UC-MA5-01)
  createFirmware(payload) {
    const list = this.getFirmwares();
    const version = (payload.version || '').trim();
    const targetModel = (payload.targetModel || '').trim();
    const fileName = (payload.fileName || '').trim();
    const scope = payload.scope || 'all';
    const assignedTenants = payload.assignedTenants || [];
    const notes = (payload.notes || '').trim();

    // NL-01 / MSG-01: Kiểm tra file
    if (!fileName) {
      return {
        success: false,
        error: 'missing_file',
        message: 'Vui lòng chọn file firmware để tải lên.', // MSG-01
      };
    }

    // NL-03 / MSG-03: Bắt buộc chọn Model thiết bị
    if (!targetModel) {
      return {
        success: false,
        error: 'missing_model',
        message: 'Vui lòng chọn model thiết bị tương thích.', // MSG-03
      };
    }

    // Bắt buộc nhập version
    if (!version) {
      return {
        success: false,
        error: 'missing_version',
        message: 'Vui lòng nhập phiên bản firmware.',
      };
    }

    // NL-02 / MSG-02: Version bắt buộc unique theo từng Model thiết bị
    const isDuplicateVersion = list.some(
      (f) =>
        f.targetModel.toLowerCase() === targetModel.toLowerCase() &&
        f.version.toLowerCase() === version.toLowerCase()
    );

    if (isDuplicateVersion) {
      return {
        success: false,
        error: 'duplicate_version',
        message: 'Phiên bản đã tồn tại cho model này.', // MSG-02
      };
    }

    // MSG-04: Chọn chỉ định cụ thể nhưng chưa chọn Doanh nghiệp nào
    if (scope === 'specific' && assignedTenants.length === 0) {
      return {
        success: false,
        error: 'missing_tenants',
        message: 'Vui lòng chọn ít nhất 1 Doanh nghiệp.', // MSG-04
      };
    }

    const nextId = `FW-${String(list.length + 1).padStart(2, '0')}`;
    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newFirmware = {
      id: nextId,
      fileName,
      version,
      targetModel,
      size: payload.size || '12.5 MB',
      scope,
      assignedTenants,
      status: 'Phát hành',
      updatedDevices: 0,
      totalCompatibleDevices: 250,
      createdAt: formattedDate,
      notes,
    };

    const updated = [newFirmware, ...list];
    localStorage.setItem(FIRMWARE_STORAGE_KEY, JSON.stringify(updated));

    return {
      success: true,
      firmware: newFirmware,
      message: 'Tải lên gói firmware thành công.', // MSG-05
    };
  },

  // Sửa thông tin gói Firmware (FN-MA5-02 / UC-MA5-02)
  // Quy tắc: File và Version bị khóa read-only ở chế độ Sửa (chỉ sửa Model và Scope)
  updateFirmware(id, payload) {
    const list = this.getFirmwares();
    const index = list.findIndex((f) => f.id === id);

    if (index === -1) {
      return { success: false, message: 'Không tìm thấy gói firmware.' };
    }

    const current = list[index];
    const targetModel = (payload.targetModel || '').trim() || current.targetModel;
    const scope = payload.scope || current.scope;
    const assignedTenants = payload.assignedTenants || current.assignedTenants;
    const notes = payload.notes !== undefined ? payload.notes : current.notes;

    // Validate Model
    if (!targetModel) {
      return {
        success: false,
        error: 'missing_model',
        message: 'Vui lòng chọn model thiết bị tương thích.', // MSG-03
      };
    }

    // MSG-04: Validate Tenant selection
    if (scope === 'specific' && (!assignedTenants || assignedTenants.length === 0)) {
      return {
        success: false,
        error: 'missing_tenants',
        message: 'Vui lòng chọn ít nhất 1 Doanh nghiệp.', // MSG-04
      };
    }

    const updatedFirmware = {
      ...current,
      targetModel,
      scope,
      assignedTenants: scope === 'all' ? [] : assignedTenants,
      notes,
    };

    list[index] = updatedFirmware;
    localStorage.setItem(FIRMWARE_STORAGE_KEY, JSON.stringify(list));

    return {
      success: true,
      firmware: updatedFirmware,
      message: 'Cập nhật gói firmware thành công.', // MSG-06
    };
  },

  // Xóa gói Firmware (FN-MA5-02 / UC-MA5-02)
  deleteFirmware(id) {
    const list = this.getFirmwares();
    const target = list.find((f) => f.id === id);

    if (!target) {
      return { success: false, message: 'Không tìm thấy gói firmware cần xóa.' };
    }

    const filtered = list.filter((f) => f.id !== id);
    localStorage.setItem(FIRMWARE_STORAGE_KEY, JSON.stringify(filtered));

    return {
      success: true,
      message: 'Xóa gói firmware thành công.', // MSG-04
    };
  },

  // Reset về mặc định
  resetToDefault() {
    localStorage.setItem(FIRMWARE_STORAGE_KEY, JSON.stringify(INITIAL_FIRMWARES));
  },
};
