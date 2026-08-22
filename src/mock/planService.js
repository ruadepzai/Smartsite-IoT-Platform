// Mock Service cho Module MA-3: Quản lý Gói dịch vụ & Theo dõi mức sử dụng
// File: src/mock/planService.js
import { tenantService } from './tenantService';

const PLANS_STORAGE_KEY = 'smartsite_plans';

const INITIAL_PLANS = [
  {
    id: 'PLAN-01',
    name: 'Standard',
    max_devices: 50,
    max_users: 5,
    price: '5.000.000 ₫/tháng',
    description: 'Dành cho doanh nghiệp vừa và nhỏ, quy mô thử nghiệm',
    badge: 'Cơ bản',
    featured: false,
  },
  {
    id: 'PLAN-02',
    name: 'Pro',
    max_devices: 200,
    max_users: 20,
    price: '15.000.000 ₫/tháng',
    description: 'Dành cho doanh nghiệp đang mở rộng số lượng trạm/thiết bị',
    badge: 'Phổ biến nhất',
    featured: true,
  },
  {
    id: 'PLAN-03',
    name: 'Enterprise',
    max_devices: 1000,
    max_users: 100,
    price: 'Liên hệ',
    description: 'Dành cho tập đoàn quy mô lớn & hạ tầng trọng điểm quốc gia',
    badge: 'Nâng cao',
    featured: false,
  },
  {
    id: 'PLAN-04',
    name: 'Custom',
    max_devices: 500,
    max_users: 50,
    price: 'Theo hợp đồng',
    description: 'Thiết lập hạn mức riêng theo phụ lục hợp đồng đặc thù',
    badge: 'Đặc thù',
    featured: false,
  },
];

function initPlanStorage() {
  if (!localStorage.getItem(PLANS_STORAGE_KEY)) {
    localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(INITIAL_PLANS));
  } else {
    // Migration: nếu có gói 'Tùy chỉnh' trong storage, đổi tên thành 'Custom'
    try {
      const data = JSON.parse(localStorage.getItem(PLANS_STORAGE_KEY));
      if (Array.isArray(data)) {
        let changed = false;
        const updated = data.map((p) => {
          if (p.name === 'Tùy chỉnh') {
            changed = true;
            return { ...p, name: 'Custom' };
          }
          return p;
        });
        if (changed) {
          localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(updated));
        }
      }
    } catch {}
  }
}

initPlanStorage();

export const planService = {
  // Lấy danh sách toàn bộ gói Plan trong Catalog
  getPlans() {
    initPlanStorage();
    try {
      const data = localStorage.getItem(PLANS_STORAGE_KEY);
      const parsed = data ? JSON.parse(data) : INITIAL_PLANS;
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_PLANS;
    } catch {
      return INITIAL_PLANS;
    }
  },

  // Lấy chi tiết 1 gói theo ID
  getPlanById(id) {
    const list = this.getPlans();
    return list.find((p) => p.id === id) || null;
  },

  // Đếm số lượng Tenant đang sử dụng gói này (dùng cho cảnh báo BR-A06 khi Xóa)
  getTenantCountUsingPlan(planName) {
    if (!planName) return 0;
    const tenants = tenantService.getTenants();
    return tenants.filter(
      (t) => (t.plan || '').toLowerCase() === planName.trim().toLowerCase()
    ).length;
  },

  // Tạo gói dịch vụ mới (FN-MA3-01 / UC-MA3-01)
  createPlan(payload) {
    const plans = this.getPlans();
    const name = (payload.name || '').trim();
    const description = (payload.description || '').trim();
    const price = (payload.price || '').trim() || 'Liên hệ';
    const maxDevices = Number(payload.max_devices);
    const maxUsers = Number(payload.max_users);

    // Validate bắt buộc
    if (!name || payload.max_devices === undefined || payload.max_users === undefined) {
      return {
        success: false,
        error: 'missing_fields',
        message: 'Vui lòng nhập đầy đủ thông tin bắt buộc.',
      };
    }

    // EF-01 & BR-A22: Tên gói unique trong Catalog
    const isDuplicate = plans.some(
      (p) => p.name.trim().toLowerCase() === name.toLowerCase()
    );
    if (isDuplicate) {
      return {
        success: false,
        error: 'duplicate_name',
        message: 'Tên gói này đã tồn tại trong Catalog.', // MSG-01
      };
    }

    // EF-02: Hạn mức phải là số nguyên dương (> 0)
    if (!Number.isInteger(maxDevices) || maxDevices <= 0 || !Number.isInteger(maxUsers) || maxUsers <= 0) {
      return {
        success: false,
        error: 'invalid_limit',
        message: 'Hạn mức phải là số nguyên dương.', // MSG-02
      };
    }

    const nextId = `PLAN-${String(plans.length + 1).padStart(2, '0')}`;
    const newPlan = {
      id: nextId,
      name,
      description: description || 'Gói dịch vụ cấu hình theo nhu cầu doanh nghiệp',
      price,
      max_devices: maxDevices,
      max_users: maxUsers,
      badge: 'Mới',
      featured: false,
    };

    const updated = [...plans, newPlan];
    localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(updated));

    return {
      success: true,
      plan: newPlan,
      message: 'Tạo gói dịch vụ thành công.', // MSG-03
    };
  },

  // Sửa gói dịch vụ (FN-MA3-02 / UC-MA3-02)
  updatePlan(id, payload) {
    const plans = this.getPlans();
    const index = plans.findIndex((p) => p.id === id);

    if (index === -1) {
      return { success: false, message: 'Không tìm thấy gói dịch vụ.' };
    }

    const current = plans[index];
    const name = (payload.name || '').trim();
    const description = (payload.description || '').trim();
    const price = (payload.price || '').trim() || current.price;
    const maxDevices = Number(payload.max_devices);
    const maxUsers = Number(payload.max_users);

    // Validate bắt buộc
    if (!name || payload.max_devices === undefined || payload.max_users === undefined) {
      return {
        success: false,
        error: 'missing_fields',
        message: 'Vui lòng nhập đầy đủ thông tin bắt buộc.',
      };
    }

    // EF-01 & BR-A22: Tên gói unique trong Catalog (loại trừ chính nó)
    const isDuplicate = plans.some(
      (p) => p.id !== id && p.name.trim().toLowerCase() === name.toLowerCase()
    );
    if (isDuplicate) {
      return {
        success: false,
        error: 'duplicate_name',
        message: 'Tên gói này đã tồn tại trong Catalog.', // MSG-01
      };
    }

    // EF-02: Hạn mức phải là số nguyên dương (> 0)
    if (!Number.isInteger(maxDevices) || maxDevices <= 0 || !Number.isInteger(maxUsers) || maxUsers <= 0) {
      return {
        success: false,
        error: 'invalid_limit',
        message: 'Hạn mức phải là số nguyên dương.', // MSG-02
      };
    }

    const updatedPlan = {
      ...current,
      name,
      description,
      price,
      max_devices: maxDevices,
      max_users: maxUsers,
    };

    plans[index] = updatedPlan;
    localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(plans));

    return {
      success: true,
      plan: updatedPlan,
      message: 'Cập nhật gói dịch vụ thành công.', // MSG-04
    };
  },

  // Xóa gói dịch vụ (FN-MA3-02 / UC-MA3-03 — BR-A06)
  deletePlan(id) {
    const plans = this.getPlans();
    const planToDelete = plans.find((p) => p.id === id);

    if (!planToDelete) {
      return { success: false, message: 'Không tìm thấy gói dịch vụ cần xóa.' };
    }

    const filtered = plans.filter((p) => p.id !== id);
    localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(filtered));

    return {
      success: true,
      message: 'Xóa gói dịch vụ thành công.', // MSG-06
    };
  },

  // Lấy danh sách thống kê sử dụng hạn mức cho MH-MA3-02 (FN-MA3-03 / UC-MA3-04 / BR-A23)
  getUsageReport() {
    const tenants = tenantService.getTenants();

    return tenants.map((t) => {
      const usedDev = t.used_devices || 0;
      const maxDev = t.max_devices || 1;
      const devPct = Math.round((usedDev / maxDev) * 100);

      const usedUsr = t.used_users || 0;
      const maxUsr = t.max_users || 1;
      const usrPct = Math.round((usedUsr / maxUsr) * 100);

      // BR-A23: Màu sắc và mức cảnh báo dựa theo % cao nhất giữa thiết bị và user
      const maxPct = Math.max(devPct, usrPct);

      let colorLevel = 'green'; // < 50%
      let riskLabel = 'Bình thường';
      let strokeColor = '#16A34A'; // Xanh lá

      if (maxPct >= 80) {
        colorLevel = 'red'; // >= 80%
        riskLabel = maxPct >= 100 ? 'Đã vượt hạn mức' : 'Đã chạm ngưỡng (≥80%)';
        strokeColor = '#DC2626'; // Đỏ
      } else if (maxPct >= 50) {
        colorLevel = 'yellow'; // 50% - 79%
        riskLabel = 'Sắp vượt hạn mức';
        strokeColor = '#D97706'; // Vàng cam
      }

      return {
        key: t.id,
        id: t.id,
        name: t.name,
        taxCode: t.taxCode,
        plan: t.plan,
        used_devices: usedDev,
        max_devices: maxDev,
        devicePct: devPct,
        used_users: usedUsr,
        max_users: maxUsr,
        userPct: usrPct,
        maxPct: maxPct,
        colorLevel: colorLevel,
        riskLabel: riskLabel,
        strokeColor: strokeColor,
      };
    });
  },

  // Reset về danh sách ban đầu
  resetToDefault() {
    localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(INITIAL_PLANS));
  },
};
