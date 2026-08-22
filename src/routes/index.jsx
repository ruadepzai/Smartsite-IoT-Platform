// Định tuyến ứng dụng SmartSite — Admin Console & Tenant Portal
// File: src/routes/index.jsx
import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts
import AdminLayout from '../layouts/AdminLayout';
import TenantLayout from '../layouts/TenantLayout';

// Auth Pages
import Login from '../pages/Login';
import ResetPassword from '../pages/ResetPassword';

// Admin Console Pages (Giai đoạn 1)
import SystemDashboard from '../pages/admin/dashboard/SystemDashboard';
import BusinessDashboard from '../pages/admin/dashboard/BusinessDashboard';
import CompanyList from '../pages/admin/companies/CompanyList';
import CompanyForm from '../pages/admin/companies/CompanyForm';
import CompanyDetail from '../pages/admin/companies/CompanyDetail';
import PlanList from '../pages/admin/plans/PlanList';
import PlanUsage from '../pages/admin/plans/PlanUsage';
import FirmwareList from '../pages/admin/firmware/FirmwareList';
import FirmwareForm from '../pages/admin/firmware/FirmwareForm';
import EmployeeList from '../pages/admin/employees/EmployeeList';
import MyAccount from '../pages/admin/account/MyAccount';
import AuditLogList from '../pages/admin/audit/AuditLogList';

// Tenant Portal Pages (Giai đoạn 2 — SSOT v11.0: MT-1 -> MT-5)
import TenantDashboard from '../pages/tenant/dashboard/TenantDashboard';
import TenantMapView from '../pages/tenant/map/TenantMapView';
import TenantAssetList from '../pages/tenant/assets/TenantAssetList';
import TenantDeviceList from '../pages/tenant/devices/TenantDeviceList';
import TenantFirmwareList from '../pages/tenant/firmware/TenantFirmwareList';
import TenantRpcControl from '../pages/tenant/control/TenantRpcControl';
import TenantAlertCenter from '../pages/tenant/alerts/TenantAlertCenter';
import TenantAlertFeed from '../pages/tenant/alerts/TenantAlertFeed';
import TenantAlertConfig from '../pages/tenant/alerts/TenantAlertConfig';
import TenantUserList from '../pages/tenant/users/TenantUserList';
import TenantDeviceReport from '../pages/tenant/reports/TenantDeviceReport';
import TenantAlertSeverityReport from '../pages/tenant/reports/TenantAlertSeverityReport';
import TenantMttrReport from '../pages/tenant/reports/TenantMttrReport';
import TenantAccount from '../pages/tenant/account/TenantAccount';

export const router = createBrowserRouter([
  // Route mặc định -> Chuyển hướng đến /login
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },

  // Trang đăng nhập Admin Console (MH-MA1-01 & MH-MA1-02)
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/login/forgot-password',
    element: <Login />,
  },

  // Trang đặt lại mật khẩu mới Admin (MH-MA1-06)
  {
    path: '/reset-password',
    element: <ResetPassword />,
  },
  {
    path: '/login/reset-password',
    element: <ResetPassword />,
  },

  // ================= KHU VỰC TENANT PORTAL (Giai đoạn 2 — MT-1 -> MT-5) =================
  {
    path: '/tenant',
    element: <TenantLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/tenant/dashboard" replace />,
      },
      // MT-3: Giám sát, Điều khiển & Cảnh báo
      {
        path: 'dashboard',
        element: <TenantDashboard />, // MH-MT3-01 / FN-MT3-01 / UC-MT3-01
      },
      {
        path: 'control',
        element: <TenantRpcControl />, // MH-MT3-02/03 / FN-MT3-02/03 / UC-MT3-02/03
      },
      {
        path: 'alerts',
        element: <TenantAlertCenter />, // MH-MT3-04/05/06 / FN-MT3-04/05/06 / UC-MT3-04/05/06
      },
      {
        path: 'alert-feed',
        element: <TenantAlertFeed />, // MH-MT3-08 / FN-MT3-08 / UC-MT3-08
      },
      {
        path: 'alert-rules',
        element: <TenantAlertConfig />, // MH-MT3-07 / FN-MT3-07 / UC-MT3-07
      },
      // MT-2: Quản lý Giám sát & Tài sản
      {
        path: 'map',
        element: <TenantMapView />, // MH-MT2-05/06/07 / FN-MT2-05/06/07 / UC-MT2-09
      },
      {
        path: 'assets',
        element: <TenantAssetList />, // MH-MT2-01/02/03 / FN-MT2-01 / UC-MT2-01/02/03
      },
      {
        path: 'devices',
        element: <TenantDeviceList />, // MH-MT2-04/05/06 / FN-MT2-02/03/04 / UC-MT2-04/05/06
      },
      {
        path: 'firmware',
        element: <TenantFirmwareList />, // MH-MT2-08/09/10 / FN-MT2-08/09/10 / UC-MT2-07/08/10
      },
      // MT-4: Quản lý Người dùng nội bộ
      {
        path: 'users',
        element: <TenantUserList />, // MH-MT4-01/02/03 / FN-MT4-01/02 / UC-MT4-01/02/03
      },
      // MT-5: Báo cáo
      {
        path: 'reports/devices',
        element: <TenantDeviceReport />, // MH-MT5-01 / FN-MT5-01 / UC-MT5-01
      },
      {
        path: 'reports/alert-severity',
        element: <TenantAlertSeverityReport />, // MH-MT5-02 / FN-MT5-02 / UC-MT5-02
      },
      {
        path: 'reports/mttr',
        element: <TenantMttrReport />, // MH-MT5-03 / FN-MT5-03 / UC-MT5-03
      },
      // MT-1: Tài khoản cá nhân
      {
        path: 'account',
        element: <TenantAccount />, // MH-MT1-04/05/06 / FN-MT1-04/05/06 / UC-MT1-04/05/06
      },
    ],
  },

  // ================= KHU VỰC ADMIN CONSOLE (Giai đoạn 1 — MA-1 -> MA-6) =================
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/admin/dashboard/system" replace />,
      },
      // Module MA-4: Tổng quan Hệ thống & KD
      {
        path: 'dashboard/system',
        element: <SystemDashboard />, // MH-MA4-02
      },
      {
        path: 'dashboard/business',
        element: <BusinessDashboard />, // MH-MA4-01
      },
      // Module MA-2: Quản lý Doanh nghiệp
      {
        path: 'companies',
        element: <CompanyList />, // MH-MA2-01
      },
      {
        path: 'companies/new',
        element: <CompanyForm />, // MH-MA2-02
      },
      {
        path: 'companies/:id',
        element: <CompanyDetail />, // MH-MA2-03
      },
      {
        path: 'companies/:id/edit',
        element: <CompanyForm />, // MH-MA2-04
      },
      // Module MA-3: Gói dịch vụ & Cấu hình
      {
        path: 'plans',
        element: <PlanList />, // MH-MA3-01
      },
      {
        path: 'plans/usage',
        element: <PlanUsage />, // MH-MA3-02
      },
      // Module MA-5: Quản lý Firmware
      {
        path: 'firmware',
        element: <FirmwareList />, // MH-MA5-01
      },
      {
        path: 'firmware/new',
        element: <FirmwareForm />, // MH-MA5-02 (Tạo)
      },
      {
        path: 'firmware/:id/edit',
        element: <FirmwareForm />, // MH-MA5-02 (Sửa)
      },
      // Module MA-1: Xác thực & Phân quyền
      {
        path: 'employees',
        element: <EmployeeList />, // MH-MA1-03
      },
      {
        path: 'my-account',
        element: <MyAccount />, // MH-MA1-05
      },
      // Module MA-6: Báo cáo & Nhật ký
      {
        path: 'audit-logs',
        element: <AuditLogList />, // MH-MA6-01
      },
    ],
  },

  // Fallback 404 -> Về trang Login
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
]);
