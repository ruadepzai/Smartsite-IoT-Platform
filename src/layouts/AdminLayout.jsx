import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { Layout, Menu, Dropdown, Avatar, Button, Breadcrumb, Typography, Space, theme } from 'antd';
import {
  Activity,
  TrendingUp,
  Building2,
  Package,
  Gauge,
  HardDriveDownload,
  Users,
  UserCircle,
  ScrollText,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ShieldCheck,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';
import { authService } from '../mock/authService';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

// Helper xây dựng Breadcrumb động, phân cấp chuẩn chỉ toàn site và cho phép click quay lại từng cấp trước
function getBreadcrumbItems(pathname) {
  const items = [
    {
      title: <Link to="/admin/dashboard/system">Admin</Link>,
    },
  ];

  // 1. Module MA-2: Quản lý Doanh nghiệp
  if (pathname === '/admin/companies') {
    items.push({
      title: 'Quản lý Doanh nghiệp',
    });
    items.push({
      title: 'Danh sách Doanh nghiệp',
    });
  } else if (pathname === '/admin/companies/new') {
    items.push({
      title: <Link to="/admin/companies">Quản lý Doanh nghiệp</Link>,
    });
    items.push({
      title: 'Tạo Doanh nghiệp mới',
    });
  } else if (pathname.startsWith('/admin/companies/') && pathname.endsWith('/edit')) {
    const id = pathname.replace('/admin/companies/', '').replace('/edit', '');
    items.push({
      title: <Link to="/admin/companies">Quản lý Doanh nghiệp</Link>,
    });
    items.push({
      title: <Link to={`/admin/companies/${id}`}>Chi tiết Doanh nghiệp #{id}</Link>,
    });
    items.push({
      title: 'Chỉnh sửa',
    });
  } else if (pathname.startsWith('/admin/companies/')) {
    const id = pathname.replace('/admin/companies/', '');
    items.push({
      title: <Link to="/admin/companies">Quản lý Doanh nghiệp</Link>,
    });
    items.push({
      title: `Chi tiết Doanh nghiệp #${id}`,
    });
  }
  // 2. Module MA-3: Gói dịch vụ & Cấu hình
  else if (pathname === '/admin/plans') {
    items.push({
      title: 'Gói dịch vụ & Cấu hình',
    });
    items.push({
      title: 'Danh sách gói Plan',
    });
  } else if (pathname === '/admin/plans/usage') {
    items.push({
      title: <Link to="/admin/plans">Gói dịch vụ & Cấu hình</Link>,
    });
    items.push({
      title: 'Theo dõi mức sử dụng',
    });
  }
  // 3. Module MA-4: Tổng quan Hệ thống & KD
  else if (pathname === '/admin/dashboard/system') {
    items.push({
      title: 'Tổng quan Hệ thống & KD',
    });
    items.push({
      title: 'Dashboard Hệ thống',
    });
  } else if (pathname === '/admin/dashboard/business') {
    items.push({
      title: <Link to="/admin/dashboard/system">Tổng quan Hệ thống & KD</Link>,
    });
    items.push({
      title: 'Dashboard Kinh doanh',
    });
  }
  // 4. Module MA-5: Quản lý Firmware
  else if (pathname === '/admin/firmware') {
    items.push({
      title: 'Quản lý Firmware',
    });
    items.push({
      title: 'Danh sách Firmware',
    });
  } else if (pathname === '/admin/firmware/new') {
    items.push({
      title: <Link to="/admin/firmware">Quản lý Firmware</Link>,
    });
    items.push({
      title: 'Tải lên gói mới',
    });
  } else if (pathname.startsWith('/admin/firmware/') && pathname.endsWith('/edit')) {
    items.push({
      title: <Link to="/admin/firmware">Quản lý Firmware</Link>,
    });
    items.push({
      title: 'Chỉnh sửa Firmware',
    });
  }
  // 5. Module MA-1: Xác thực & Phân quyền
  else if (pathname === '/admin/employees') {
    items.push({
      title: 'Xác thực & Phân quyền',
    });
    items.push({
      title: 'Nhân viên vận hành',
    });
  } else if (pathname === '/admin/my-account') {
    items.push({
      title: <Link to="/admin/employees">Xác thực & Phân quyền</Link>,
    });
    items.push({
      title: 'Tài khoản của tôi',
    });
  }
  // 6. Module MA-6: Báo cáo & Nhật ký
  else if (pathname === '/admin/audit-logs') {
    items.push({
      title: 'Báo cáo & Nhật ký',
    });
    items.push({
      title: 'Nhật ký Audit',
    });
  } else {
    items.push({
      title: 'Trang quản trị',
    });
  }

  return items;
}

// Active sidebar menu key cho toàn bộ các route
function getActiveMenuKey(path) {
  if (path.startsWith('/admin/companies')) return '/admin/companies';
  if (path.startsWith('/admin/plans/usage')) return '/admin/plans/usage';
  if (path.startsWith('/admin/plans')) return '/admin/plans';
  if (path.startsWith('/admin/dashboard/business')) return '/admin/dashboard/business';
  if (path.startsWith('/admin/dashboard')) return '/admin/dashboard/system';
  if (path.startsWith('/admin/firmware')) return '/admin/firmware';
  if (path.startsWith('/admin/employees')) return '/admin/employees';
  if (path.startsWith('/admin/my-account')) return '/admin/my-account';
  if (path.startsWith('/admin/audit-logs')) return '/admin/audit-logs';
  return path;
}

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = theme.useToken();

  const currentPath = location.pathname;
  const activeMenuKey = getActiveMenuKey(currentPath);
  const breadcrumbItems = getBreadcrumbItems(currentPath);

  // Cấu trúc Menu Items theo đúng Navigation Map & Module BRD
  const menuItems = [
    {
      type: 'group',
      label: !collapsed ? 'TỔNG QUAN HỆ THỐNG & KD' : '',
      children: [
        {
          key: '/admin/dashboard/system',
          icon: <Activity size={18} />,
          label: 'Dashboard hệ thống',
        },
        {
          key: '/admin/dashboard/business',
          icon: <TrendingUp size={18} />,
          label: 'Dashboard kinh doanh',
        },
      ],
    },
    {
      type: 'group',
      label: !collapsed ? 'QUẢN LÝ DOANH NGHIỆP' : '',
      children: [
        {
          key: '/admin/companies',
          icon: <Building2 size={18} />,
          label: 'Danh sách Doanh nghiệp',
        },
      ],
    },
    {
      type: 'group',
      label: !collapsed ? 'GÓI DỊCH VỤ & CẤU HÌNH' : '',
      children: [
        {
          key: '/admin/plans',
          icon: <Package size={18} />,
          label: 'Danh sách gói Plan',
        },
        {
          key: '/admin/plans/usage',
          icon: <Gauge size={18} />,
          label: 'Theo dõi mức sử dụng',
        },
      ],
    },
    {
      type: 'group',
      label: !collapsed ? 'QUẢN LÝ FIRMWARE' : '',
      children: [
        {
          key: '/admin/firmware',
          icon: <HardDriveDownload size={18} />,
          label: 'Danh sách Firmware',
        },
      ],
    },
    {
      type: 'group',
      label: !collapsed ? 'XÁC THỰC & PHÂN QUYỀN' : '',
      children: [
        {
          key: '/admin/employees',
          icon: <Users size={18} />,
          label: 'Nhân viên vận hành',
        },
        {
          key: '/admin/my-account',
          icon: <UserCircle size={18} />,
          label: 'Tài khoản của tôi',
        },
      ],
    },
    {
      type: 'group',
      label: !collapsed ? 'BÁO CÁO & NHẬT KÝ' : '',
      children: [
        {
          key: '/admin/audit-logs',
          icon: <ScrollText size={18} />,
          label: 'Nhật ký Audit',
        },
      ],
    },
  ];

  // User Dropdown items
  const userMenuItems = [
    {
      key: 'profile',
      label: 'Tài khoản của tôi',
      icon: <UserCircle size={16} />,
      onClick: () => navigate('/admin/my-account'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: 'Đăng xuất',
      icon: <LogOut size={16} />,
      danger: true,
      onClick: () => navigate('/login'),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', width: '100vw' }}>
      {/* ================= SIDEBAR ================= */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={240}
        collapsedWidth={80}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
          background: isDark ? '#0B0F19' : '#101828',
          borderRight: `1px solid ${isDark ? '#1E293B' : '#1E293B'}`,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Brand Logo Header */}
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '0' : '0 20px',
            gap: 12,
            borderBottom: `1px solid ${isDark ? '#1E293B' : '#1E293B'}`,
            background: isDark ? '#0B0F19' : '#101828',
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              backgroundColor: '#0B72E7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              flexShrink: 0,
            }}
          >
            <ShieldCheck size={20} />
          </div>
          {!collapsed && (
            <div style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
              <Text style={{ color: '#FFFFFF', fontWeight: 700, fontSize: 16, display: 'block', lineHeight: 1.2 }}>
                SmartSite
              </Text>
              <Text style={{ color: '#64748B', fontSize: 11, fontWeight: 500 }}>
                Admin Console
              </Text>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <div style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[activeMenuKey]}
            onClick={({ key }) => navigate(key)}
            items={menuItems}
            style={{
              background: 'transparent',
              borderRight: 'none',
              fontSize: 13,
            }}
          />
        </div>

        {/* Sidebar Collapse Toggle Button */}
        <div
          style={{
            padding: '12px 16px',
            borderTop: `1px solid ${isDark ? '#1E293B' : '#1E293B'}`,
            background: isDark ? '#0B0F19' : '#101828',
          }}
        >
          <Button
            type="text"
            block
            onClick={() => setCollapsed(!collapsed)}
            icon={collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            style={{
              color: '#94A3B8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              padding: collapsed ? 0 : '0 8px',
            }}
          >
            {!collapsed && <span style={{ marginLeft: 8, fontSize: 13 }}>Thu gọn menu</span>}
          </Button>
        </div>
      </Sider>

      {/* ================= MAIN LAYOUT AREA ================= */}
      <Layout
        style={{
          marginLeft: collapsed ? 80 : 240,
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          minHeight: '100vh',
          background: token.colorBgLayout,
        }}
      >
        {/* ================= HEADER ================= */}
        <Header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 99,
            width: '100%',
            height: 64,
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: isDark ? '#161B22' : '#FFFFFF',
            borderBottom: `1px solid ${token.colorBorder}`,
            boxShadow: isDark ? '0 1px 2px rgba(0,0,0,0.3)' : '0 1px 2px rgba(0,0,0,0.03)',
          }}
        >
          {/* Header Left: Nút thu phóng Sidebar + Breadcrumb Động & Clickable toàn site */}
          <Space align="center" size={16}>
            <Button
              type="text"
              onClick={() => setCollapsed(!collapsed)}
              icon={
                collapsed ? (
                  <PanelLeftOpen size={20} style={{ color: isDark ? '#94A3B8' : '#475467' }} />
                ) : (
                  <PanelLeftClose size={20} style={{ color: isDark ? '#94A3B8' : '#475467' }} />
                )
              }
              title={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36,
                height: 36,
              }}
            />
            <Breadcrumb
              items={breadcrumbItems}
              style={{ fontSize: 13 }}
            />
          </Space>

          {/* Header Right: (1) Toggle Theme, (2) User Avatar & Dropdown */}
          <Space orientation="horizontal" size={16} align="center">
            {/* (1) Nút Toggle Light / Dark Mode */}
            <Button
              type="text"
              shape="circle"
              onClick={toggleTheme}
              icon={isDark ? <Sun size={18} style={{ color: '#FDB022' }} /> : <Moon size={18} style={{ color: '#64748B' }} />}
              title={isDark ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36,
                height: 36,
              }}
            />

            {/* (2) Avatar + User Profile Dropdown */}
            {(() => {
              const user = authService.getCurrentUser();
              const initial = user?.name ? user.name.trim().charAt(user.name.trim().lastIndexOf(' ') + 1) || user.name.charAt(0) : 'A';
              return (
                <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      cursor: 'pointer',
                      padding: '4px 8px',
                      borderRadius: 8,
                      transition: 'background 0.2s',
                    }}
                  >
                    <Avatar
                      style={{
                        backgroundColor: '#0B72E7',
                        fontWeight: 600,
                        fontSize: 14,
                      }}
                    >
                      {initial}
                    </Avatar>
                    <div style={{ lineHeight: 1.2, textAlign: 'left' }}>
                      <Text strong style={{ fontSize: 13, display: 'block' }}>
                        {user?.name || 'Nguyễn Văn An'}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {user?.role || 'Quản trị hệ thống'}
                      </Text>
                    </div>
                  </div>
                </Dropdown>
              );
            })()}
          </Space>
        </Header>

        {/* ================= CONTENT BODY ================= */}
        <Content
          style={{
            padding: '24px',
            minHeight: 'calc(100vh - 64px)',
            background: token.colorBgLayout,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
