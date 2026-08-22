# SmartSite Admin Console — Cấu trúc Dự án & Kiến trúc Layout (Giai đoạn 1)

Tài liệu mô tả chi tiết kiến trúc thư mục, luồng điều hướng (Routing), cấu hình Theme Design Tokens và quy ước đặt tên của prototype **SmartSite Admin Console** (Nền tảng Quản trị Nội bộ IoT).

---

## 1. Công nghệ sử dụng (Tech Stack)

| Thư viện / Công cụ | Phiên bản | Mục đích sử dụng |
| :--- | :--- | :--- |
| **React** | `^18.3.1` | Thư viện UI Component |
| **Vite** | `^6.1.0` | Build tool và Dev server tốc độ cao |
| **Ant Design (antd)** | `^5.24.0` | Thư viện giao diện chuẩn Enterprise B2B |
| **React Router** | `^6.28.0` | Điều hướng Client-side (Data Router API) |
| **Lucide React** | `^0.475.0` | Bộ icon SVG hiện đại, tối giản |
| **Inter Font** | `@fontsource/inter` | Font chữ tiêu chuẩn toàn hệ thống |

---

## 2. Cây thư mục dự án (Project File Tree)

```text
prototype/
├── index.html                           # Entry HTML template (font Inter, favicon)
├── package.json                         # Danh sách dependencies và npm scripts
├── vite.config.js                       # Cấu hình Vite dev server & React plugin
├── PROJECT_STRUCTURE.md                 # Tài liệu mô tả kiến trúc & cấu trúc file
└── src/
    ├── main.jsx                         # React Root entrypoint
    ├── App.jsx                          # Root component bọc ThemeProvider & Router
    ├── index.css                        # Reset CSS toàn cục & cấu hình scrollbars
    │
    ├── theme/                           # Quản trị Design Tokens & Light/Dark Theme
    │   ├── themeConfig.js               # Tokens màu sắc chuẩn BRD (lightTokens, darkTokens)
    │   └── ThemeContext.jsx             # React Context quản lý isDark, localStorage('theme-mode')
    │
    ├── layouts/                         # Khung bố cục tổng thể (App Shells)
    │   ├── AdminLayout.jsx              # Layout chính Admin (Sidebar 240px/80px + Header có nút thu phóng + Content)
    │   └── TenantLayout.jsx             # [TODO Giai đoạn 2] Layout cho Tenant Portal
    │
    ├── routes/
    │   └── index.jsx                    # Định nghĩa toàn bộ Router (React Router v6)
    │
    └── pages/                           # Các màn hình chức năng
        ├── Login.jsx                    # MH-MA1-01 & MH-MA1-02: Đăng nhập / Quên MK + Mock Role Switcher
        ├── ResetPassword.jsx            # MH-MA1-06: Đặt lại mật khẩu mới
        │
        ├── tenant/
        │   └── ComingSoon.jsx           # Placeholder cho route /tenant (Tenant Portal)
        │
        └── admin/                       # Toàn bộ 12 màn hình nghiệp vụ Admin Console
            ├── dashboard/
            │   ├── SystemDashboard.jsx      # MH-MA4-02: Dashboard hệ thống (Giám sát IoT, Gateway, CPU)
            │   └── BusinessDashboard.jsx    # MH-MA4-01: Dashboard kinh doanh (MRR, tăng trưởng DN)
            │
            ├── companies/
            │   ├── CompanyList.jsx          # MH-MA2-01: Danh sách Doanh nghiệp
            │   ├── CompanyForm.jsx          # MH-MA2-02 & MH-MA2-04: Form Tạo mới / Sửa Doanh nghiệp
            │   └── CompanyDetail.jsx        # MH-MA2-03: Chi tiết Doanh nghiệp
            │
            ├── plans/
            │   ├── PlanList.jsx             # MH-MA3-01: Danh sách gói Plan (Standard, Pro, Enterprise)
            │   └── PlanUsage.jsx            # MH-MA3-02: Theo dõi mức sử dụng hạn mức thiết bị
            │
            ├── firmware/
            │   └── FirmwareList.jsx         # MH-MA5-01: Danh sách gói Firmware & bản build OTA
            │
            ├── employees/
            │   ├── EmployeeList.jsx         # MH-MA1-03: Danh sách nhân viên vận hành
            │   └── EmployeeForm.jsx         # MH-MA1-04: Form Thêm/Sửa nhân viên (dùng trong Modal)
            │
            ├── account/
            │   └── MyAccount.jsx            # MH-MA1-05: Tài khoản của tôi (Profile & Đổi mật khẩu)
            │
            └── audit/
                └── AuditLogList.jsx         # MH-MA6-01: Nhật ký Audit (Security & Action Logs)
```

---

## 3. Bảng ánh xạ Routing & Mã màn hình BRD

| Phân hệ (Module) | Mã màn hình | Tên màn hình hiển thị | Đường dẫn (Route) | File Component | Icon |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **—** | **MH-MA1-01** | Đăng nhập | `/login` | `Login.jsx` | `LogIn` |
| **—** | **MH-MA1-02** | Quên mật khẩu | `/login/forgot-password` | `Login.jsx` | `KeyRound` |
| **—** | **MH-MA1-06** | Đặt lại mật khẩu mới | `/reset-password` | `ResetPassword.jsx` | `Lock` |
| **—** | **—** | Tenant Portal (Placeholder) | `/tenant` | `tenant/ComingSoon.jsx` | `Construction` |
| **MA-4** | **MH-MA4-02** | Dashboard hệ thống *(Mặc định khi login)* | `/admin/dashboard/system` | `dashboard/SystemDashboard.jsx` | `Activity` |
| **MA-4** | **MH-MA4-01** | Dashboard kinh doanh | `/admin/dashboard/business` | `dashboard/BusinessDashboard.jsx` | `TrendingUp` |
| **MA-2** | **MH-MA2-01** | Danh sách Doanh nghiệp | `/admin/companies` | `companies/CompanyList.jsx` | `Building2` |
| **MA-2** | **MH-MA2-02** | Tạo Doanh nghiệp mới | `/admin/companies/new` | `companies/CompanyForm.jsx` | `Plus` |
| **MA-2** | **MH-MA2-03** | Chi tiết Doanh nghiệp | `/admin/companies/:id` | `companies/CompanyDetail.jsx` | `Eye` |
| **MA-2** | **MH-MA2-04** | Form Sửa Doanh nghiệp | `/admin/companies/:id/edit` | `companies/CompanyForm.jsx` | `Edit` |
| **MA-3** | **MH-MA3-01** | Danh sách gói Plan | `/admin/plans` | `plans/PlanList.jsx` | `Package` |
| **MA-3** | **MH-MA3-02** | Theo dõi mức sử dụng hạn mức | `/admin/plans/usage` | `plans/PlanUsage.jsx` | `Gauge` |
| **MA-5** | **MH-MA5-01** | Danh sách gói Firmware | `/admin/firmware` | `firmware/FirmwareList.jsx` | `HardDriveDownload` |
| **MA-1** | **MH-MA1-03** | Danh sách nhân viên vận hành | `/admin/employees` | `employees/EmployeeList.jsx` | `Users` |
| **MA-1** | **MH-MA1-04** | Form tài khoản nhân viên | *Dạng Modal tích hợp* | `employees/EmployeeForm.jsx` | `UserPlus` |
| **MA-1** | **MH-MA1-05** | Tài khoản của tôi | `/admin/my-account` | `account/MyAccount.jsx` | `UserCircle` |
| **MA-6** | **MH-MA6-01** | Nhật ký Audit | `/admin/audit-logs` | `audit/AuditLogList.jsx` | `ScrollText` |

---

## 4. Cơ chế Theme & Tokens (ConfigProvider)

1. **Light / Dark Mode State**:
   - Được quản lý thông qua `ThemeProvider` và hook `useTheme()`.
   - Lựa chọn lưu bền vững vào `localStorage.getItem('theme-mode')`.
   - Khi người dùng bấm nút Mặt trời / Mặt trăng trên Header, toàn bộ app chuyển giao diện tức thì.
2. **Sidebar Độc lập**:
   - Dù ở Light Mode hay Dark Mode, Sidebar **luôn giữ tone màu tối chuyên nghiệp** (`#101828` ở Light và `#0B0F19` ở Dark).
3. **Màu chủ đạo (Primary Tokens)**:
   - Primary Light: `#0B72E7`
   - Primary Dark: `#4098FF`
   - Thành công: `#12B45A` / `#3DD68C`
   - Cảnh báo: `#F79009` / `#FDB022`
   - Lỗi: `#F04438` / `#F97066`
   - Bo góc: `borderRadius: 8px`

---

## 5. Hướng dẫn chạy dự án

1. **Cài đặt thư viện**:
   ```bash
   cd prototype
   npm install
   ```

2. **Chạy môi trường phát triển (Dev Server)**:
   ```bash
   npm run dev
   ```
   Trình duyệt sẽ tự động mở tại địa chỉ: `http://localhost:3000`

3. **Build kiểm tra đóng gói**:
   ```bash
   npm run build
   ```
