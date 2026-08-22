// Mock Tenant Service cho Module MA-2 (Quản lý Doanh nghiệp)
// File: src/mock/tenantService.js
import { INITIAL_TENANTS, PACKAGE_PLANS } from './tenantData';

const TENANTS_STORAGE_KEY = 'smartsite_tenants';

function initTenantStorage() {
  if (!localStorage.getItem(TENANTS_STORAGE_KEY)) {
    localStorage.setItem(TENANTS_STORAGE_KEY, JSON.stringify(INITIAL_TENANTS));
  }
}

initTenantStorage();

export const tenantService = {
  // Lấy danh sách toàn bộ Doanh nghiệp
  getTenants() {
    initTenantStorage();
    try {
      const data = localStorage.getItem(TENANTS_STORAGE_KEY);
      const parsed = data ? JSON.parse(data) : INITIAL_TENANTS;
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_TENANTS;
    } catch {
      return INITIAL_TENANTS;
    }
  },

  // Lấy chi tiết 1 Doanh nghiệp theo ID (hỗ trợ cả TNT-xx và mã cũ CP-xxxx)
  getTenantById(id) {
    if (!id) return null;
    const list = this.getTenants();
    const cleanId = String(id).trim();

    // Tìm chính xác theo id
    let found = list.find(
      (t) => t.id === cleanId || t.id.toLowerCase() === cleanId.toLowerCase()
    );
    if (found) return found;

    // Fallback cho mã cũ CP-1001 hoặc số thứ tự
    if (cleanId.startsWith('CP-') || !isNaN(cleanId)) {
      const digits = cleanId.replace(/\D/g, '');
      const num = parseInt(digits, 10);
      const idx = !isNaN(num) && num > 0 ? (num - 1) % list.length : 0;
      return list[idx] || list[0];
    }

    return null;
  },

  // Validate định dạng Mã số thuế: 10 hoặc 13 chữ số (BR-A24)
  validateTaxCode(taxCode) {
    const clean = (taxCode || '').trim();
    return /^\d{10}$|^\d{13}$/.test(clean);
  },

  // Tạo Doanh nghiệp mới (MH-MA2-02, FN-MA2-01 / UC-MA2-01)
  createTenant(payload) {
    const tenants = this.getTenants();

    const name = (payload.name || '').trim();
    const taxCode = (payload.taxCode || '').trim();
    const industry = payload.industry || 'Viễn thông';
    const adminEmail = (payload.adminEmail || '').trim().toLowerCase();
    const contractCode = (payload.contractCode || '').trim();
    const plan = payload.plan || 'Standard';
    const status = payload.status || 'Dùng thử';

    const planObj = PACKAGE_PLANS.find((p) => p.value === plan);
    const maxDevices =
      payload.max_devices !== undefined &&
      payload.max_devices !== null &&
      payload.max_devices !== ''
        ? Number(payload.max_devices)
        : planObj?.max_devices || 50;

    const maxUsers =
      payload.max_users !== undefined &&
      payload.max_users !== null &&
      payload.max_users !== ''
        ? Number(payload.max_users)
        : planObj?.max_users || 5;

    // EF-01: Thiếu thông tin bắt buộc
    if (!name || !taxCode || !industry || !adminEmail || !plan) {
      return {
        success: false,
        error: 'missing_fields',
        message: 'Vui lòng nhập đầy đủ thông tin bắt buộc.', // MSG-01
      };
    }

    // Validate Mã số thuế (BR-A24 / MSG-04)
    if (!this.validateTaxCode(taxCode)) {
      return {
        success: false,
        error: 'invalid_tax_code',
        message: 'Mã số thuế phải gồm 10 hoặc 13 chữ số.', // MSG-04
      };
    }

    // Kiểm tra trùng Mã số thuế toàn hệ thống (BR-A24)
    const isTaxCodeDuplicate = tenants.some(
      (t) => (t.taxCode || '').trim() === taxCode
    );
    if (isTaxCodeDuplicate) {
      return {
        success: false,
        error: 'duplicate_tax_code',
        message: 'Mã số thuế này đã được sử dụng bởi Doanh nghiệp khác.',
      };
    }

    // EF-02: Email Quản trị Doanh nghiệp đã tồn tại (BR-A04 / MSG-02)
    const isEmailDuplicate = tenants.some(
      (t) => (t.adminEmail || '').toLowerCase() === adminEmail
    );
    if (isEmailDuplicate) {
      return {
        success: false,
        error: 'duplicate_email',
        message: 'Email này đã được sử dụng bởi Doanh nghiệp khác.', // MSG-02
      };
    }

    // EF-03: Hạn mức không phải số nguyên dương (MSG-03)
    if (!Number.isInteger(maxDevices) || maxDevices <= 0 || !Number.isInteger(maxUsers) || maxUsers <= 0) {
      return {
        success: false,
        error: 'invalid_limit',
        message: 'Hạn mức phải là số nguyên dương.', // MSG-03
      };
    }

    // Sinh ID mới (VD: TNT-17)
    const nextNum = tenants.length + 1;
    const newId = `TNT-${String(nextNum).padStart(2, '0')}`;

    const todayStr = new Date().toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    const nowFullStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const newTenant = {
      id: newId,
      name,
      taxCode,
      industry,
      adminEmail,
      contractCode: contractCode || `HD-2026-${String(nextNum).padStart(3, '0')}`,
      plan,
      max_devices: maxDevices,
      used_devices: 0,
      max_users: maxUsers,
      used_users: 1, // Tự động tạo 1 tài khoản Tenant Admin (BR-A16)
      gateways: 0,
      sensors: 0,
      status,
      createdAt: todayStr,
      history: [
        {
          id: `H-${Date.now()}`,
          time: nowFullStr,
          actor: 'Nguyễn Văn An (SysAdmin)',
          action: 'Khởi tạo Tenant mới',
          detail: `Tạo Doanh nghiệp với gói ${plan} (${maxDevices} thiết bị, ${maxUsers} người dùng). Trạng thái: ${status}. Tự động tạo Tenant Admin (${adminEmail}) theo BR-A16.`,
        },
      ],
    };

    const updatedList = [newTenant, ...tenants];
    localStorage.setItem(TENANTS_STORAGE_KEY, JSON.stringify(updatedList));

    return {
      success: true,
      tenant: newTenant,
      message: 'Tạo Tenant thành công. Email kích hoạt đã được gửi tới Quản trị Doanh nghiệp.', // MSG-05
    };
  },

  // Sửa thông tin Doanh nghiệp (MH-MA2-04, FN-MA2-02 / UC-MA2-04)
  updateTenant(id, payload) {
    const tenants = this.getTenants();
    const cleanId = String(id).trim();
    const index = tenants.findIndex(
      (t) => t.id === cleanId || t.id.toLowerCase() === cleanId.toLowerCase()
    );

    if (index === -1) {
      return { success: false, message: 'Không tìm thấy Doanh nghiệp.' };
    }

    const current = tenants[index];
    const name = (payload.name || '').trim();
    const taxCode = (payload.taxCode || '').trim();
    const industry = payload.industry || current.industry;
    const adminEmail = (payload.adminEmail || '').trim().toLowerCase();
    const contractCode = (payload.contractCode || '').trim();
    const plan = payload.plan || current.plan;
    const status = payload.status || current.status;

    const planObj = PACKAGE_PLANS.find((p) => p.value === plan);
    const maxDevices =
      payload.max_devices !== undefined &&
      payload.max_devices !== null &&
      payload.max_devices !== ''
        ? Number(payload.max_devices)
        : current.max_devices;

    const maxUsers =
      payload.max_users !== undefined &&
      payload.max_users !== null &&
      payload.max_users !== ''
        ? Number(payload.max_users)
        : current.max_users;

    // Validate bắt buộc
    if (!name || !taxCode || !industry || !adminEmail || !plan) {
      return {
        success: false,
        error: 'missing_fields',
        message: 'Vui lòng nhập đầy đủ thông tin bắt buộc.',
      };
    }

    // Validate Mã số thuế (BR-A24 / MSG-04)
    if (!this.validateTaxCode(taxCode)) {
      return {
        success: false,
        error: 'invalid_tax_code',
        message: 'Mã số thuế phải gồm 10 hoặc 13 chữ số.',
      };
    }

    // Kiểm tra trùng Mã số thuế với DN khác
    const isTaxCodeDuplicate = tenants.some(
      (t) => t.id !== current.id && (t.taxCode || '').trim() === taxCode
    );
    if (isTaxCodeDuplicate) {
      return {
        success: false,
        error: 'duplicate_tax_code',
        message: 'Mã số thuế này đã được sử dụng bởi Doanh nghiệp khác.',
      };
    }

    // EF-02: Email admin mới trùng với Doanh nghiệp khác (MSG-02)
    const isEmailDuplicate = tenants.some(
      (t) => t.id !== current.id && (t.adminEmail || '').toLowerCase() === adminEmail
    );
    if (isEmailDuplicate) {
      return {
        success: false,
        error: 'duplicate_email',
        message: 'Email này đã được sử dụng bởi Doanh nghiệp khác.', // MSG-02
      };
    }

    // EF-01 & BR-A14: Hạn mức mới không được nhỏ hơn số lượng đang sử dụng thực tế
    if (maxDevices < (current.used_devices || 0)) {
      return {
        success: false,
        error: 'limit_device_too_low',
        message: `Hạn mức mới nhỏ hơn số lượng đang sử dụng (${current.used_devices}). Vui lòng giảm số lượng thiết bị/tài khoản trước hoặc chọn hạn mức khác.`, // MSG-01
      };
    }

    if (maxUsers < (current.used_users || 0)) {
      return {
        success: false,
        error: 'limit_user_too_low',
        message: `Hạn mức mới nhỏ hơn số lượng đang sử dụng (${current.used_users}). Vui lòng giảm số lượng thiết bị/tài khoản trước hoặc chọn hạn mức khác.`, // MSG-01
      };
    }

    // Ghi nhận nhật ký thay đổi
    const historyList = [...(current.history || [])];
    const nowFullStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const changes = [];
    if (current.name !== name) changes.push(`Đổi tên: ${current.name} → ${name}`);
    if (current.plan !== plan) changes.push(`Đổi gói: ${current.plan} → ${plan}`);
    if (current.max_devices !== maxDevices) changes.push(`Hạn mức thiết bị: ${current.max_devices} → ${maxDevices}`);
    if (current.max_users !== maxUsers) changes.push(`Hạn mức người dùng: ${current.max_users} → ${maxUsers}`);
    if (current.status !== status) changes.push(`Trạng thái: ${current.status} → ${status}`);
    if (current.adminEmail !== adminEmail) changes.push(`Email admin: ${current.adminEmail} → ${adminEmail}`);

    if (changes.length > 0) {
      historyList.unshift({
        id: `H-${Date.now()}`,
        time: nowFullStr,
        actor: 'Nguyễn Văn An (SysAdmin)',
        action: 'Cập nhật thông tin / Hạn mức / Trạng thái',
        detail: changes.join('; '),
      });
    }

    const updatedTenant = {
      ...current,
      name,
      taxCode,
      industry,
      adminEmail,
      contractCode,
      plan,
      max_devices: maxDevices,
      max_users: maxUsers,
      status,
      history: historyList,
      updatedAt: nowFullStr,
    };

    tenants[index] = updatedTenant;
    localStorage.setItem(TENANTS_STORAGE_KEY, JSON.stringify(tenants));

    return {
      success: true,
      tenant: updatedTenant,
      message: 'Cập nhật thông tin Doanh nghiệp thành công.', // MSG-04
    };
  },

  // Reset về danh sách mặc định
  resetToDefault() {
    localStorage.setItem(TENANTS_STORAGE_KEY, JSON.stringify(INITIAL_TENANTS));
  },
};
