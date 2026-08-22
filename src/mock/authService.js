// Mock Auth & Employee Service cho Module MA-1
// File: src/mock/authService.js
import { INITIAL_EMPLOYEES, MOCK_TEST_ACCOUNTS, INITIAL_LOGIN_HISTORY, ROLE_OPTIONS } from './mockData';

const EMPLOYEES_KEY = 'smartsite_employees';
const CURRENT_USER_KEY = 'smartsite_current_user';
const FAILED_ATTEMPTS_KEY = 'smartsite_failed_attempts';
const LOGIN_HISTORY_KEY = 'smartsite_login_history';

// Khởi tạo localStorage nếu chưa có hoặc cập nhật dữ liệu mới
function initStorage() {
  if (!localStorage.getItem(EMPLOYEES_KEY)) {
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(INITIAL_EMPLOYEES));
  } else {
    // Tự động đồng bộ nếu dữ liệu cũ còn tên cũ
    try {
      const data = JSON.parse(localStorage.getItem(EMPLOYEES_KEY));
      if (Array.isArray(data) && data.some((e) => e.name === 'Nguyễn Văn Quản Trị')) {
        const synced = data.map((e) => {
          if (e.name === 'Nguyễn Văn Quản Trị') return { ...e, name: 'Nguyễn Văn An' };
          if (e.name === 'Trần Kỹ Thuật') return { ...e, name: 'Trần Văn Bình' };
          if (e.name === 'Lê CSKH Khóa') return { ...e, name: 'Lê Thị Cúc' };
          return e;
        });
        localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(synced));
      }
    } catch {}
  }

  if (!localStorage.getItem(CURRENT_USER_KEY)) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(MOCK_TEST_ACCOUNTS[0]));
  } else {
    try {
      const u = JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
      if (u && u.name === 'Nguyễn Văn Quản Trị') {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({ ...u, name: 'Nguyễn Văn An' }));
      }
    } catch {}
  }

  if (!localStorage.getItem(LOGIN_HISTORY_KEY)) {
    localStorage.setItem(LOGIN_HISTORY_KEY, JSON.stringify(INITIAL_LOGIN_HISTORY));
  }
}

// Gọi khởi tạo ngay
initStorage();

export const authService = {
  // Lấy danh sách nhân viên
  getEmployees() {
    initStorage();
    try {
      const data = localStorage.getItem(EMPLOYEES_KEY);
      return data ? JSON.parse(data) : INITIAL_EMPLOYEES;
    } catch {
      return INITIAL_EMPLOYEES;
    }
  },

  // Tạo tài khoản nhân viên mới (MH-MA1-04 Thêm)
  createEmployee(payload) {
    const employees = this.getEmployees();
    const cleanEmail = (payload.email || '').trim().toLowerCase();

    // EF-01: Kiểm tra email đã tồn tại trong danh sách
    const isDuplicate = employees.some(
      (emp) => (emp.email || '').toLowerCase() === cleanEmail
    );
    if (isDuplicate) {
      return {
        success: false,
        error: 'duplicate_email',
        message: 'Email này đã được sử dụng bởi tài khoản khác.',
      };
    }

    // Bắt buộc nhập đầy đủ thông tin & tick ít nhất 1 module
    if (
      !payload.name?.trim() ||
      !cleanEmail ||
      !payload.role ||
      !payload.modules ||
      payload.modules.length === 0
    ) {
      return {
        success: false,
        error: 'missing_fields',
        message: 'Vui lòng nhập đầy đủ thông tin bắt buộc.',
      };
    }

    const nextNumber = employees.length + 1;
    const newId = `EMP-${String(nextNumber).padStart(2, '0')}`;

    const newEmployee = {
      id: newId,
      name: payload.name.trim(),
      email: cleanEmail,
      role: payload.role,
      status: 'Đang hoạt động', // Tạo mới luôn là Đang hoạt động
      modules: payload.modules || [],
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    const updatedList = [newEmployee, ...employees];
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(updatedList));

    return {
      success: true,
      employee: newEmployee,
      message: 'Tạo tài khoản thành công. Email kích hoạt đã được gửi.', // MSG-03
    };
  },

  // Cập nhật thông tin nhân viên (MH-MA1-04 Sửa)
  updateEmployee(id, payload) {
    const employees = this.getEmployees();
    const index = employees.findIndex((emp) => emp.id === id);

    if (index === -1) {
      return { success: false, message: 'Không tìm thấy nhân viên.' };
    }

    const cleanEmail = (payload.email || '').trim().toLowerCase();

    // EF-01: Kiểm tra trùng email với nhân viên khác
    const isDuplicate = employees.some(
      (emp) => emp.id !== id && (emp.email || '').toLowerCase() === cleanEmail
    );
    if (isDuplicate) {
      return {
        success: false,
        error: 'duplicate_email',
        message: 'Email này đã được sử dụng bởi tài khoản khác.',
      };
    }

    // Bắt buộc nhập đủ & tick ít nhất 1 module
    if (
      !payload.name?.trim() ||
      !cleanEmail ||
      !payload.role ||
      !payload.modules ||
      payload.modules.length === 0
    ) {
      return {
        success: false,
        error: 'missing_fields',
        message: 'Vui lòng nhập đầy đủ thông tin bắt buộc.',
      };
    }

    const oldStatus = employees[index].status;
    const newStatus = payload.isLocked ? 'Đã khóa' : 'Đang hoạt động';
    const statusChangedToLocked = oldStatus !== 'Đã khóa' && newStatus === 'Đã khóa';

    const updatedEmployee = {
      ...employees[index],
      name: payload.name.trim(),
      email: cleanEmail,
      role: payload.role,
      status: newStatus,
      modules: payload.modules || [],
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    employees[index] = updatedEmployee;
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(employees));

    // Message theo BR-A11 / MH-MA1-04
    const message = payload.isLocked
      ? 'Cập nhật thông tin thành công. Tài khoản đã bị khóa.' // MSG-05
      : 'Cập nhật thông tin thành công.'; // MSG-04

    return {
      success: true,
      employee: updatedEmployee,
      isLocked: payload.isLocked,
      message,
    };
  },

  // Xóa nhân viên (MH-MA1-03 Xóa / soft-delete BR-A19)
  deleteEmployee(id) {
    const employees = this.getEmployees();
    const updatedList = employees.filter((emp) => emp.id !== id);
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(updatedList));
    return {
      success: true,
      message: 'Xóa tài khoản thành công.', // MSG-03
    };
  },

  // Validate độ mạnh mật khẩu theo BR-A17:
  // Tối thiểu 6 ký tự, có ít nhất 1 chữ hoa, 1 số, 1 ký tự đặc biệt
  validatePasswordStrength(password) {
    const pwd = password || '';
    const lengthOk = pwd.length >= 6;
    const uppercaseOk = /[A-Z]/.test(pwd);
    const numberOk = /[0-9]/.test(pwd);
    const specialOk = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pwd);

    const valid = lengthOk && uppercaseOk && numberOk && specialOk;
    return {
      valid,
      lengthOk,
      uppercaseOk,
      numberOk,
      specialOk,
    };
  },

  // Đăng nhập (MH-MA1-01)
  login(email, password) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPwd = password || '';

    // Kiểm tra số lần thử sai liên tiếp (BR-A03: sau 5 lần sai -> khóa 15 phút)
    const failedMap = JSON.parse(localStorage.getItem(FAILED_ATTEMPTS_KEY) || '{}');
    const currentFailed = failedMap[cleanEmail] || 0;

    // Tìm tài khoản trong danh sách test hoặc danh sách nhân viên
    const testAccount = MOCK_TEST_ACCOUNTS.find(
      (a) => (a.email || '').toLowerCase() === cleanEmail
    );
    const employeeAccount = this.getEmployees().find(
      (e) => (e.email || '').toLowerCase() === cleanEmail
    );

    const account = testAccount || employeeAccount;

    // Tầng 1 (Cấp Doanh nghiệp - BR-T05): Tenant ở trạng thái Tạm ngưng hoặc Hết hạn -> Chặn đăng nhập toàn bộ AT-03/AT-04
    if (account && (account.tenantStatus === 'Tạm ngưng' || account.tenantStatus === 'Hết hạn')) {
      return {
        success: false,
        error: 'tenant_suspended',
        message: 'Tài khoản đã bị khóa.', // MSG-02 / EF-03: Dùng chung câu thông báo, không lộ nguyên nhân
      };
    }

    // Tầng 2 (Cấp Tài khoản - BR-T21/BR-T22/BR-T04): Tài khoản cá nhân bị khóa hoặc sai >= 5 lần
    if (account && (account.status === 'Đã khóa' || account.status === 'Vô hiệu hóa')) {
      return {
        success: false,
        error: 'account_locked',
        message: 'Tài khoản đã bị khóa.', // MSG-02 / EF-02
      };
    }

    if (currentFailed >= 5) {
      return {
        success: false,
        error: 'account_locked',
        message: 'Tài khoản đã bị khóa.', // MSG-02 (khóa 15 phút demo theo BR-T04 / BR-A03)
      };
    }

    // Tình huống 2: Kiểm tra mật khẩu
    // Mock password hợp lệ: theo test account hoặc 'Admin@123!' mặc định cho demo
    const validPassword = testAccount?.password || 'Admin@123!';
    const isPasswordCorrect = cleanPwd === validPassword;

    if (!account || !isPasswordCorrect) {
      // Tăng bộ đếm sai liên tiếp
      failedMap[cleanEmail] = currentFailed + 1;
      localStorage.setItem(FAILED_ATTEMPTS_KEY, JSON.stringify(failedMap));

      return {
        success: false,
        error: 'invalid_credentials',
        message: 'Email hoặc mật khẩu không đúng.', // MSG-01 (dùng chung)
        failedCount: failedMap[cleanEmail],
      };
    }

    // Đăng nhập thành công: reset bộ đếm sai, lưu session hiện tại
    failedMap[cleanEmail] = 0;
    localStorage.setItem(FAILED_ATTEMPTS_KEY, JSON.stringify(failedMap));

    const isTenantAdmin = account.role?.includes('Doanh nghiệp') || account.email?.includes('tenant');
    const loggedInUser = {
      id: account.id || 'EMP-01',
      name: account.name || 'Nguyễn Văn An',
      email: account.email,
      phone: account.phone || '0901234567',
      role: account.role || 'Quản trị hệ thống',
      company: account.company || (isTenantAdmin ? 'Tổng công ty Cảng Hàng không Việt Nam (ACV)' : null),
      assignedRooms: account.assignedRooms || (isTenantAdmin ? 'Toàn bộ Cơ sở / Tòa nhà' : null),
      status: 'Đang hoạt động',
      modules: account.modules || ['tenant', 'plans', 'firmware', 'audit'],
      targetUrl: account.targetUrl || (isTenantAdmin ? '/tenant/dashboard' : '/admin/dashboard/system'),
      password: validPassword,
    };

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(loggedInUser));

    return {
      success: true,
      user: loggedInUser,
    };
  },

  // Kiểm tra email tồn tại trong hệ thống (MH-MA1-02 Quên mật khẩu)
  checkEmailExists(email) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const employees = this.getEmployees();
    const testAccounts = MOCK_TEST_ACCOUNTS;

    return (
      employees.some((e) => (e.email || '').toLowerCase() === cleanEmail) ||
      testAccounts.some((a) => (a.email || '').toLowerCase() === cleanEmail)
    );
  },

  // Lấy thông tin tài khoản hiện tại (MH-MA1-05)
  getCurrentUser() {
    initStorage();
    try {
      const data = localStorage.getItem(CURRENT_USER_KEY);
      return data ? JSON.parse(data) : MOCK_TEST_ACCOUNTS[0];
    } catch {
      return MOCK_TEST_ACCOUNTS[0];
    }
  },

  // Cập nhật thông tin cá nhân (MH-MA1-05 Tab 1)
  updateCurrentUser(payload) {
    const current = this.getCurrentUser();
    const updated = {
      ...current,
      name: (payload.name || current.name).trim(),
      email: (payload.email || current.email).trim(),
      phone: (payload.phone || '').trim(),
    };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updated));

    // Đồng bộ lại vào danh sách nhân viên nếu có
    const employees = this.getEmployees();
    const empIndex = employees.findIndex((e) => e.id === current.id || e.email === current.email);
    if (empIndex !== -1) {
      employees[empIndex] = { ...employees[empIndex], name: updated.name, email: updated.email };
      localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(employees));
    }

    return {
      success: true,
      user: updated,
      message: 'Cập nhật thông tin thành công.', // MSG-02
    };
  },

  // Đổi mật khẩu tài khoản hiện tại (MH-MA1-05 Tab 2)
  changePassword(currentPassword, newPassword) {
    const user = this.getCurrentUser();
    const userStoredPassword = user.password || 'Admin@123!';

    // Kiểm tra mật khẩu hiện tại
    if (currentPassword !== userStoredPassword) {
      return {
        success: false,
        error: 'wrong_current_password',
        message: 'Mật khẩu hiện tại không đúng.', // MSG-03
      };
    }

    // Kiểm tra độ mạnh mật khẩu mới BR-A17
    const strength = this.validatePasswordStrength(newPassword);
    if (!strength.valid) {
      return {
        success: false,
        error: 'weak_password',
        message:
          'Mật khẩu mới chưa đạt yêu cầu: tối thiểu 6 ký tự, có chữ hoa, số và ký tự đặc biệt.', // MSG-04
      };
    }

    // Cập nhật mật khẩu mới
    const updatedUser = { ...user, password: newPassword };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));

    return {
      success: true,
      message: 'Đổi mật khẩu thành công.', // MSG-05
    };
  },

  // Đặt lại mật khẩu mới từ link email (MH-MA1-06)
  resetPasswordWithToken(newPassword) {
    const strength = this.validatePasswordStrength(newPassword);
    if (!strength.valid) {
      return {
        success: false,
        error: 'weak_password',
        message:
          'Mật khẩu mới chưa đạt yêu cầu: tối thiểu 6 ký tự, có chữ hoa, số và ký tự đặc biệt.', // MSG-04
      };
    }

    const user = this.getCurrentUser();
    const updatedUser = { ...user, password: newPassword };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));

    return {
      success: true,
      message: 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập bằng mật khẩu mới.',
    };
  },

  // Lấy lịch sử đăng nhập (MH-MA1-05 Tab 3)
  getLoginHistory() {
    initStorage();
    try {
      const data = localStorage.getItem(LOGIN_HISTORY_KEY);
      return data ? JSON.parse(data) : INITIAL_LOGIN_HISTORY;
    } catch {
      return INITIAL_LOGIN_HISTORY;
    }
  },

  // Reset dữ liệu về ban đầu (phục vụ test)
  resetToDefault() {
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(INITIAL_EMPLOYEES));
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(MOCK_TEST_ACCOUNTS[0]));
    localStorage.setItem(LOGIN_HISTORY_KEY, JSON.stringify(INITIAL_LOGIN_HISTORY));
    localStorage.removeItem(FAILED_ATTEMPTS_KEY);
  },
};
