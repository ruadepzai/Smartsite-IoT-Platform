// Khung giao diện Tenant Portal (Giai đoạn 2 — SSOT v11.0: MT-1 -> MT-5)
// File: src/layouts/TenantLayout.jsx
import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Layout,
  Menu,
  Button,
  Avatar,
  Dropdown,
  Space,
  Typography,
  Badge,
  Tooltip,
  Select,
  Tag,
  Breadcrumb,
  Card,
} from 'antd';
import {
  LayoutDashboard,
  MapPin,
  Building2,
  Cpu,
  Radio,
  Sliders,
  AlertTriangle,
  Bell,
  Settings,
  Users,
  BarChart3,
  FileSpreadsheet,
  User,
  LogOut,
  Moon,
  Sun,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  ShieldCheck,
  Globe,
  HardDriveDownload,
  Flame,
  ArrowUpRight,
  History,
} from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';
import { tenantPortalService, TENANT_PROFILES } from '../mock/tenantPortalService';

const { Header, Sider, Content } = Layout;
const { Text, Title } = Typography;

export default function TenantLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();

  const [collapsed, setCollapsed] = useState(false);
  const [currentTenantId, setCurrentTenantId] = useState('TNT-01');

  const tenantProfile = tenantPortalService.getCurrentProfile(currentTenantId);
  const alerts = tenantPortalService.getAlerts();
  const criticalCount = alerts.filter((a) => a.severity === 'CRITICAL' && a.status === 'UNACKNOWLEDGED').length;

  // Xác định Menu Key đang active
  const getActiveKey = () => {
    const p = location.pathname;
    if (p.includes('/tenant/dashboard')) return 'dashboard';
    if (p.includes('/tenant/map')) return 'map';
    if (p.includes('/tenant/assets')) return 'assets';
    if (p.includes('/tenant/devices')) return 'devices';
    if (p.includes('/tenant/firmware')) return 'firmware';
    if (p.includes('/tenant/control')) return 'control';
    if (p.includes('/tenant/alert-feed')) return 'alert-feed';
    if (p.includes('/tenant/alert-rules')) return 'alert-rules';
    if (p.includes('/tenant/alerts')) return 'alerts';
    if (p.includes('/tenant/users')) return 'users';
    if (p.includes('/tenant/reports/devices')) return 'reports-devices';
    if (p.includes('/tenant/reports/alert-severity')) return 'reports-severity';
    if (p.includes('/tenant/reports/mttr')) return 'reports-mttr';
    if (p.includes('/tenant/account')) return 'account';
    return 'dashboard';
  };

  // Cấu hình Items cho Sidebar Menu (Hiển thị tên nghiệp vụ rõ ràng, chuẩn các nhóm chức năng)
  const menuItems = [
    {
      key: 'grp-overview',
      label: 'TỔNG QUAN GIÁM SÁT',
      type: 'group',
      children: [
        {
          key: 'dashboard',
          icon: <LayoutDashboard size={18} />,
          label: 'Dashboard Thời gian thực',
          onClick: () => navigate('/tenant/dashboard'),
        },
      ],
    },
    {
      key: 'grp-mt2',
      label: 'QUẢN LÝ GIÁM SÁT',
      type: 'group',
      children: [
        {
          key: 'map',
          icon: <MapPin size={18} />,
          label: 'Bản đồ Điểm Giám sát',
          onClick: () => navigate('/tenant/map'),
        },
        {
          key: 'assets',
          icon: <Building2 size={18} />,
          label: 'Cấu trúc Khu vực & Phòng',
          onClick: () => navigate('/tenant/assets'),
        },
        {
          key: 'devices',
          icon: <Cpu size={18} />,
          label: 'Danh sách Thiết bị IoT',
          onClick: () => navigate('/tenant/devices'),
        },
        {
          key: 'firmware',
          icon: <HardDriveDownload size={18} />,
          label: 'Gói Firmware & OTA',
          onClick: () => navigate('/tenant/firmware'),
        },
      ],
    },
    {
      key: 'grp-mt3',
      label: 'ĐIỀU KHIỂN & CẢNH BÁO',
      type: 'group',
      children: [
        {
          key: 'control',
          icon: <Sliders size={18} />,
          label: 'Lịch sử Lệnh & Điều khiển (RPC)',
          onClick: () => navigate('/tenant/control'),
        },
        {
          key: 'alerts',
          icon: (
            <Badge count={criticalCount} size="small" offset={[6, 0]}>
              <AlertTriangle size={18} style={{ color: criticalCount > 0 ? '#DC2626' : undefined }} />
            </Badge>
          ),
          label: 'Danh sách & Xử lý Cảnh báo',
          onClick: () => navigate('/tenant/alerts'),
        },
        {
          key: 'alert-feed',
          icon: <History size={18} />,
          label: 'Lịch sử Xử lý Cảnh báo',
          onClick: () => navigate('/tenant/alert-feed'),
        },
        {
          key: 'alert-rules',
          icon: <Settings size={18} />,
          label: 'Cấu hình Ngưỡng Cảnh báo',
          onClick: () => navigate('/tenant/alert-rules'),
        },
      ],
    },
    {
      key: 'grp-mt4',
      label: 'QUẢN LÝ NGƯỜI DÙNG',
      type: 'group',
      children: [
        {
          key: 'users',
          icon: <Users size={18} />,
          label: 'Người dùng & Phân quyền Phòng',
          onClick: () => navigate('/tenant/users'),
        },
      ],
    },
    {
      key: 'grp-mt5',
      label: 'BÁO CÁO THỐNG KÊ',
      type: 'group',
      children: [
        {
          key: 'reports-devices',
          icon: <BarChart3 size={18} />,
          label: 'Báo cáo Vận hành Thiết bị',
          onClick: () => navigate('/tenant/reports/devices'),
        },
        {
          key: 'reports-severity',
          icon: <AlertTriangle size={18} />,
          label: 'Thống kê Cảnh báo theo Mức độ',
          onClick: () => navigate('/tenant/reports/alert-severity'),
        },
        {
          key: 'reports-mttr',
          icon: <FileSpreadsheet size={18} />,
          label: 'Báo cáo MTTR & Hiệu suất',
          onClick: () => navigate('/tenant/reports/mttr'),
        },
      ],
    },
  ];

  // Breadcrumb generator cho Tenant Portal
  const getBreadcrumbItems = () => {
    const pathname = location.pathname;
    const items = [
      {
        title: <Link to="/tenant/dashboard">{tenantProfile.shortName}</Link>,
      },
    ];

    if (pathname === '/tenant/dashboard') {
      items.push({ title: 'Tổng quan Giám sát' });
    } else if (pathname === '/tenant/map') {
      items.push({ title: 'Bản đồ Điểm Giám sát' });
    } else if (pathname === '/tenant/assets') {
      items.push({ title: 'Cấu trúc Khu vực & Phòng' });
    } else if (pathname === '/tenant/devices') {
      items.push({ title: 'Danh sách Thiết bị IoT' });
    } else if (pathname === '/tenant/firmware') {
      items.push({ title: 'Quản lý Gói Firmware & OTA' });
    } else if (pathname === '/tenant/control') {
      items.push({ title: 'Lịch sử Lệnh & Điều khiển (RPC)' });
    } else if (pathname === '/tenant/alerts') {
      items.push({ title: 'Danh sách & Xử lý Cảnh báo' });
    } else if (pathname === '/tenant/alert-feed') {
      items.push({ title: 'Lịch sử Xử lý Cảnh báo' });
    } else if (pathname === '/tenant/alert-rules') {
      items.push({ title: 'Cấu hình Ngưỡng Cảnh báo' });
    } else if (pathname === '/tenant/users') {
      items.push({ title: 'Người dùng & Phân quyền Phòng' });
    } else if (pathname === '/tenant/reports/devices') {
      items.push({ title: 'Báo cáo Vận hành Thiết bị' });
    } else if (pathname === '/tenant/reports/alert-severity') {
      items.push({ title: 'Thống kê Cảnh báo theo Mức độ' });
    } else if (pathname === '/tenant/reports/mttr') {
      items.push({ title: 'Báo cáo Thời gian Phản hồi MTTR' });
    } else if (pathname === '/tenant/account') {
      items.push({ title: 'Thông tin Cá nhân & Đổi mật khẩu' });
    } else {
      items.push({ title: 'Portal Doanh nghiệp' });
    }

    return items;
  };

  // User Dropdown menu
  const userMenuItems = [
    {
      key: 'account',
      icon: <User size={16} />,
      label: 'Thông tin tài khoản',
      onClick: () => navigate('/tenant/account'),
    },
    {
      key: 'admin-switch',
      icon: <ArrowUpRight size={16} />,
      label: 'Chuyển sang Admin Console',
      onClick: () => navigate('/admin'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogOut size={16} />,
      label: 'Đăng xuất',
      danger: true,
      onClick: () => navigate('/login'),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: isDark ? '#0B0F19' : '#F1F5F9' }}>
      {/* ================= SIDER ================= */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={null}
        width={220}
        collapsedWidth={64}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
          background: isDark ? '#111827' : '#FFFFFF',
          borderRight: `1px solid ${isDark ? '#1F2937' : '#E5E7EB'}`,
        }}
      >
        {/* Logo & Tenant Brand Header */}
        <div
          style={{
            height: 52,
            display: 'flex',
            alignItems: 'center',
            padding: '0 14px',
            gap: 8,
            borderBottom: `1px solid ${isDark ? '#1F2937' : '#E5E7EB'}`,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              background: 'linear-gradient(135deg, #0B72E7 0%, #10B981 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: 14,
              flexShrink: 0,
            }}
          >
            {tenantProfile.logoText}
          </div>

          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <Text strong style={{ fontSize: 12.5, display: 'block', lineHeight: 1.2 }} ellipsis>
                {tenantProfile.shortName}
              </Text>
              <Tag color="blue" style={{ fontSize: 9, padding: '0 3px', borderRadius: 3, marginTop: 2 }}>
                Tenant Portal
              </Tag>
            </div>
          )}
        </div>

        {/* Menu Navigation */}
        <Menu
          mode="inline"
          selectedKeys={[getActiveKey()]}
          items={menuItems}
          style={{
            borderRight: 0,
            background: 'transparent',
            padding: '6px 0 60px 0',
            fontSize: 12.5,
          }}
        />
      </Sider>

      {/* ================= MAIN CONTENT LAYOUT ================= */}
      <Layout style={{ marginLeft: collapsed ? 64 : 220, transition: 'all 0.2s', minHeight: '100vh' }}>
        {/* Top Header */}
        <Header
          style={{
            height: 52,
            padding: '0 18px',
            background: isDark ? '#111827' : '#FFFFFF',
            borderBottom: `1px solid ${isDark ? '#1F2937' : '#E5E7EB'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 99,
          }}
        >
          {/* Left Header: Collapse Toggle & Tenant Context Switcher */}
          <Space size={16} align="center">
            <Button
              type="text"
              icon={collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: 16, width: 36, height: 36 }}
            />

            {/* Switcher đổi ngữ cảnh Tenant để tiện test nhiều công ty */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Text type="secondary" style={{ fontSize: 12, display: 'none' }} className="sm:inline">
                Doanh nghiệp:
              </Text>
              <Select
                value={currentTenantId}
                onChange={(val) => setCurrentTenantId(val)}
                style={{ width: 280 }}
                options={TENANT_PROFILES.map((p) => ({
                  value: p.id,
                  label: (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 600 }}>{p.shortName}</span>
                      <Tag color="cyan" style={{ fontSize: 10 }}>{p.plan}</Tag>
                    </div>
                  ),
                }))}
              />
            </div>
          </Space>

          {/* Right Header: Quota Usage Chips & Profile Controls */}
          <Space size={16} align="center">
            {/* Quota Chips (Hạn mức Gateway & Thiết bị) */}
            <div style={{ display: 'none' }} className="md:flex items-center gap-2">
              <Tooltip title="Hạn mức Gateway IoT của doanh nghiệp">
                <Tag color="blue" style={{ borderRadius: 6, fontSize: 12, padding: '2px 8px' }}>
                  Gateway: <strong>{tenantProfile.usedGateways}/{tenantProfile.maxGateways}</strong>
                </Tag>
              </Tooltip>
              <Tooltip title="Hạn mức Thiết bị cảm biến / Đo đếm">
                <Tag color="green" style={{ borderRadius: 6, fontSize: 12, padding: '2px 8px' }}>
                  Thiết bị: <strong>{tenantProfile.usedDevices}/{tenantProfile.maxDevices}</strong>
                </Tag>
              </Tooltip>
            </div>

            {/* Notification Bell */}
            <Tooltip title={criticalCount > 0 ? `Có ${criticalCount} cảnh báo Critical chưa xử lý` : 'Trung tâm cảnh báo'}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <Badge count={criticalCount} size="small" offset={[-3, 4]}>
                  <Button
                    type="text"
                    shape="circle"
                    onClick={() => navigate('/tenant/alerts')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 34,
                      height: 34,
                      padding: 0,
                    }}
                  >
                    <Bell size={18} style={{ color: criticalCount > 0 ? '#DC2626' : undefined }} />
                  </Button>
                </Badge>
              </div>
            </Tooltip>

            {/* Theme Toggle */}
            <Tooltip title={isDark ? 'Chuyển giao diện sáng' : 'Chuyển giao diện tối'}>
              <Button
                type="text"
                shape="circle"
                onClick={toggleTheme}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 34,
                  height: 34,
                  padding: 0,
                }}
              >
                {isDark ? <Sun size={18} style={{ color: '#FDB022' }} /> : <Moon size={18} style={{ color: '#64748B' }} />}
              </Button>
            </Tooltip>

            {/* User Profile */}
            <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  padding: '3px 8px',
                  borderRadius: 8,
                  height: 34,
                }}
              >
                <Avatar style={{ backgroundColor: '#0B72E7', fontWeight: 600, fontSize: 12.5, flexShrink: 0 }} size={28}>
                  NL
                </Avatar>
                <div style={{ display: 'none', lineHeight: 1.2, textAlign: 'left' }} className="lg:block">
                  <Text strong style={{ fontSize: 12.5, display: 'block' }}>
                    Nguyễn Hoàng Long
                  </Text>
                  <Text type="secondary" style={{ fontSize: 10.5 }}>
                    Tenant Admin (AT-03)
                  </Text>
                </div>
              </div>
            </Dropdown>
          </Space>
        </Header>

        {/* Dynamic Breadcrumbs Bar */}
        <div
          style={{
            padding: '8px 18px',
            backgroundColor: isDark ? '#111827' : '#FFFFFF',
            borderBottom: `1px solid ${isDark ? '#1F2937' : '#E5E7EB'}`,
          }}
        >
          <Breadcrumb items={getBreadcrumbItems()} style={{ fontSize: 12.5 }} />
        </div>

        {/* Content Body */}
        <Content style={{ margin: '14px 18px', minHeight: 280 }}>
          <Outlet context={{ currentTenant: tenantProfile }} />
        </Content>
      </Layout>
    </Layout>
  );
}
