// Mã màn hình: MH-MT1-03 (Tài khoản của tôi — 3 Tab: Thông tin cá nhân, Đổi mật khẩu, Lịch sử đăng nhập — Tenant Portal)
// Dựa theo FN-MT1-04, FN-MT1-05, FN-MT1-06 & UC-MT1-04, UC-MT1-05, UC-MT1-06 trong SmartSite_Function_List_v9 & SmartSite_IoT_UseCase_List_v5
import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  Typography,
  Tag,
  Space,
  Form,
  Input,
  Button,
  Avatar,
  Tabs,
  Row,
  Col,
  Table,
  Badge,
  Empty,
  message,
  Divider,
  Alert,
  Tooltip,
} from 'antd';
import {
  UserCircle,
  Save,
  Lock,
  History,
  Shield,
  Check,
  Phone,
  Mail,
  User,
  Clock,
  Laptop,
  Globe,
  Building2,
  MapPin,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { authService } from '../../../mock/authService';
import { tenantPortalService } from '../../../mock/tenantPortalService';
import { useTheme } from '../../../theme/ThemeContext';

const { Title, Text, Paragraph } = Typography;

export default function TenantAccount() {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const currentUser = authService.getCurrentUser();
  const tenantProfile = tenantPortalService.getCurrentProfile('TNT-01');

  // Forms
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  // Load user data on mount
  useEffect(() => {
    profileForm.setFieldsValue({
      name: currentUser?.name || 'Nguyễn Hoàng Long',
      email: currentUser?.email || 'tenant.admin@smartsite.io',
      phone: currentUser?.phone || '0912 345 678',
      role: currentUser?.role || 'Quản trị Doanh nghiệp (Tenant Admin - AT-03)',
      company: currentUser?.company || tenantProfile.name,
      assignedRooms: currentUser?.assignedRooms || 'Toàn bộ Cơ sở / Tòa nhà (Toàn quyền quản trị)',
    });
  }, [profileForm, currentUser, tenantProfile]);

  // ================= TAB 1: THÔNG TIN CÁ NHÂN (FN-MT1-04 / UC-MT1-04) =================
  const [loadingProfile, setLoadingProfile] = useState(false);

  const handleSaveProfile = (values) => {
    setLoadingProfile(true);
    setTimeout(() => {
      setLoadingProfile(false);
      // Validate định dạng SĐT VN nếu có nhập
      if (values.phone && !/^(0[3|5|7|8|9])[0-9]{8}$/.test(values.phone.replace(/\s+/g, ''))) {
        profileForm.setFields([
          {
            name: 'phone',
            errors: ['Số điện thoại không đúng định dạng VN (09xx, 03xx, 08xx...)'],
          },
        ]);
        message.error('Số điện thoại không đúng định dạng');
        return;
      }

      authService.updateCurrentUser({
        name: values.name,
        phone: values.phone,
      });

      message.success('Cập nhật thông tin thành công.'); // MSG-02
    }, 300);
  };

  // ================= TAB 2: ĐỔI MẬT KHẨU (FN-MT1-05 / UC-MT1-05) =================
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [newPwdInput, setNewPwdInput] = useState('');

  // Kiểm tra độ mạnh mật khẩu theo BR-A17 (dùng chung Admin & Tenant)
  const pwdStrength = useMemo(() => {
    return authService.validatePasswordStrength(newPwdInput);
  }, [newPwdInput]);

  const handleChangePassword = (values) => {
    // Validate BR-A17 trước khi submit
    if (!pwdStrength.valid) {
      message.error(
        'Mật khẩu mới chưa đạt yêu cầu: tối thiểu 6 ký tự, có chữ hoa, số và ký tự đặc biệt.'
      ); // MSG-04
      return;
    }

    setLoadingPassword(true);
    setTimeout(() => {
      setLoadingPassword(false);
      const res = authService.changePassword(values.currentPassword, values.newPassword);

      if (!res.success) {
        if (res.error === 'wrong_current_password') {
          // MSG-03: "Mật khẩu hiện tại không đúng."
          passwordForm.setFields([
            {
              name: 'currentPassword',
              errors: ['Mật khẩu hiện tại không đúng.'],
            },
          ]);
        }
        message.error(res.message);
        return;
      }

      // MSG-05: "Đổi mật khẩu thành công." (BR-T33: Invalidate các session khác)
      message.success('Đổi mật khẩu thành công. Các phiên đăng nhập khác đã được thu hồi.');
      passwordForm.resetFields();
      setNewPwdInput('');
    }, 400);
  };

  // ================= TAB 3: LỊCH SỬ ĐĂNG NHẬP (FN-MT1-06 / UC-MT1-06) =================
  const [demoEmptyHistory, setDemoEmptyHistory] = useState(false);

  // Mock dữ liệu lịch sử đăng nhập 30 ngày gần nhất (BR-A20), nhóm theo ngày
  const rawLoginHistory = [
    {
      key: '1',
      dateGroup: 'Hôm nay (22/08/2026)',
      time: '11:42:15',
      ip: '14.232.208.45',
      device: 'Chrome 128 (Windows 11)',
      location: 'Hà Nội, Việt Nam',
      status: 'Thành công',
    },
    {
      key: '2',
      dateGroup: 'Hôm nay (22/08/2026)',
      time: '08:15:30',
      ip: '14.232.208.45',
      device: 'Chrome 128 (Windows 11)',
      location: 'Hà Nội, Việt Nam',
      status: 'Thành công',
    },
    {
      key: '3',
      dateGroup: 'Hôm qua (21/08/2026)',
      time: '16:50:10',
      ip: '14.232.208.45',
      device: 'Chrome 128 (Windows 11)',
      location: 'Hà Nội, Việt Nam',
      status: 'Thành công',
    },
    {
      key: '4',
      dateGroup: 'Hôm qua (21/08/2026)',
      time: '09:05:22',
      ip: '113.190.234.12',
      device: 'Safari Mobile (iOS 17)',
      location: 'Đà Nẵng, Việt Nam',
      status: 'Thành công',
    },
    {
      key: '5',
      dateGroup: '20/08/2026',
      time: '14:20:00',
      ip: '14.232.208.45',
      device: 'Chrome 128 (Windows 11)',
      location: 'Hà Nội, Việt Nam',
      status: 'Thành công',
    },
    {
      key: '6',
      dateGroup: '20/08/2026',
      time: '10:02:11',
      ip: '14.232.208.45',
      device: 'Chrome 128 (Windows 11)',
      location: 'Hà Nội, Việt Nam',
      status: 'Thất bại',
      reason: 'Sai mật khẩu (BR-T04)',
    },
    {
      key: '7',
      dateGroup: '18/08/2026',
      time: '17:30:45',
      ip: '113.190.234.12',
      device: 'Edge (Windows 10)',
      location: 'Hồ Chí Minh, Việt Nam',
      status: 'Thành công',
    },
    {
      key: '8',
      dateGroup: '15/08/2026',
      time: '08:45:00',
      ip: '14.232.208.45',
      device: 'Chrome 128 (Windows 11)',
      location: 'Hà Nội, Việt Nam',
      status: 'Thành công',
    },
  ];

  const historyColumns = [
    {
      title: 'Thời gian',
      dataIndex: 'time',
      key: 'time',
      width: 140,
      render: (t, r) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ fontSize: 13 }}>{t}</Text>
          <Text type="secondary" style={{ fontSize: 11 }}>{r.dateGroup}</Text>
        </Space>
      ),
    },
    {
      title: 'Địa chỉ IP',
      dataIndex: 'ip',
      key: 'ip',
      width: 150,
      render: (ip) => (
        <Tag color="cyan" style={{ fontFamily: 'monospace', fontSize: 12 }}>
          {ip}
        </Tag>
      ),
    },
    {
      title: 'Thiết bị & Trình duyệt',
      dataIndex: 'device',
      key: 'device',
      render: (d) => (
        <Space size={6}>
          <Laptop size={14} style={{ color: '#0B72E7' }} />
          <span>{d}</span>
        </Space>
      ),
    },
    {
      title: 'Vị trí địa lý',
      dataIndex: 'location',
      key: 'location',
      render: (loc) => (
        <Space size={6}>
          <Globe size={14} style={{ color: '#10B981' }} />
          <span>{loc}</span>
        </Space>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (st, r) => (
        st === 'Thành công' ? (
          <Badge status="success" text={<span style={{ color: '#10B981', fontWeight: 600 }}>Thành công</span>} />
        ) : (
          <Tooltip title={r.reason || 'Đăng nhập không thành công'}>
            <Badge status="error" text={<span style={{ color: '#DC2626', fontWeight: 600 }}>Thất bại</span>} />
          </Tooltip>
        )
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header trang */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Space size={8} align="center">
            <UserCircle size={24} style={{ color: '#0B72E7' }} />
            <Title level={4} style={{ margin: 0 }}>
              Tài Khoản Của Tôi
            </Title>
          </Space>
          <Text type="secondary" style={{ fontSize: 13, display: 'block', marginTop: 2 }}>
            Quản lý thông tin cá nhân, cập nhật mật khẩu đăng nhập và theo dõi lịch sử truy cập (MH-MT1-03)
          </Text>
        </div>

        <Space>
          <Tag color="blue" style={{ fontSize: 13, padding: '4px 10px', borderRadius: 6 }}>
            MH-MT1-03
          </Tag>
          <Tag color="geekblue" style={{ fontSize: 13, padding: '4px 10px', borderRadius: 6 }}>
            FN-MT1-04 / 05 / 06
          </Tag>
        </Space>
      </div>

      {/* Profile Overview Card */}
      <Card style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <Row gutter={[24, 16]} align="middle">
          <Col xs={24} sm="auto">
            <Avatar
              size={72}
              style={{
                backgroundColor: '#0B72E7',
                fontSize: 28,
                fontWeight: 700,
              }}
            >
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'L'}
            </Avatar>
          </Col>
          <Col xs={24} sm={18}>
            <Title level={4} style={{ margin: 0 }}>
              {currentUser?.name || 'Nguyễn Hoàng Long'}
            </Title>
            <Space size={8} wrap style={{ marginTop: 6 }}>
              <Tag color="blue" style={{ borderRadius: 4 }}>
                {currentUser?.role || 'Quản trị Doanh nghiệp (AT-03)'}
              </Tag>
              <Tag color="green" style={{ borderRadius: 4 }}>
                <CheckCircle2 size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: '-1px' }} />
                Đang hoạt động
              </Tag>
              <Tag color="purple" style={{ borderRadius: 4 }}>
                <Building2 size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: '-1px' }} />
                {tenantProfile.shortName}
              </Tag>
            </Space>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 6 }}>
              Email đăng nhập: <strong style={{ color: isDark ? '#E5E7EB' : '#111827' }}>{currentUser?.email || 'tenant.admin@smartsite.io'}</strong>
            </Text>
          </Col>
        </Row>
      </Card>

      {/* Tabs Container */}
      <Card style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'profile',
              label: (
                <Space>
                  <User size={16} />
                  <span>Thông tin cá nhân</span>
                </Space>
              ),
              children: (
                <div style={{ maxWidth: 700, paddingTop: 12 }}>
                  <Form
                    form={profileForm}
                    layout="vertical"
                    onFinish={handleSaveProfile}
                    requiredMark={false}
                  >
                    <Form.Item
                      name="name"
                      label={<span style={{ fontWeight: 600 }}>Họ và tên</span>}
                      rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
                    >
                      <Input prefix={<User size={16} style={{ color: '#9CA3AF' }} />} placeholder="Nhập họ và tên" />
                    </Form.Item>

                    <Row gutter={16}>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="email"
                          label={<span style={{ fontWeight: 600 }}>Email đăng nhập (Chỉ đọc)</span>}
                        >
                          <Input prefix={<Mail size={16} style={{ color: '#9CA3AF' }} />} disabled />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="phone"
                          label={<span style={{ fontWeight: 600 }}>Số điện thoại liên hệ</span>}
                        >
                          <Input prefix={<Phone size={16} style={{ color: '#9CA3AF' }} />} placeholder="09xx xxx xxx" />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="company"
                          label={<span style={{ fontWeight: 600 }}>Doanh nghiệp trực thuộc</span>}
                        >
                          <Input prefix={<Building2 size={16} style={{ color: '#9CA3AF' }} />} disabled />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="role"
                          label={<span style={{ fontWeight: 600 }}>Vai trò hệ thống</span>}
                        >
                          <Input prefix={<Shield size={16} style={{ color: '#9CA3AF' }} />} disabled />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item
                      name="assignedRooms"
                      label={<span style={{ fontWeight: 600 }}>Phạm vi phòng được gán (Room Assignment)</span>}
                    >
                      <Input prefix={<MapPin size={16} style={{ color: '#9CA3AF' }} />} disabled />
                    </Form.Item>

                    <div style={{ textAlign: 'right', marginTop: 8 }}>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={loadingProfile}
                        icon={<Save size={16} />}
                        style={{ backgroundColor: '#0B72E7', borderRadius: 8, height: 38, padding: '0 20px' }}
                      >
                        Lưu thay đổi
                      </Button>
                    </div>
                  </Form>
                </div>
              ),
            },
            {
              key: 'password',
              label: (
                <Space>
                  <Lock size={16} />
                  <span>Đổi mật khẩu</span>
                </Space>
              ),
              children: (
                <div style={{ maxWidth: 600, paddingTop: 12 }}>
                  <Alert
                    type="info"
                    showIcon
                    message="Bảo mật tài khoản"
                    description="Sau khi đổi mật khẩu thành công, tất cả các phiên đăng nhập khác của bạn sẽ tự động bị hủy (BR-T33)."
                    style={{ marginBottom: 20, borderRadius: 8 }}
                  />

                  <Form
                    form={passwordForm}
                    layout="vertical"
                    onFinish={handleChangePassword}
                    requiredMark={false}
                  >
                    <Form.Item
                      name="currentPassword"
                      label={<span style={{ fontWeight: 600 }}>Mật khẩu hiện tại</span>}
                      rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
                    >
                      <Input.Password placeholder="••••••••" />
                    </Form.Item>

                    <Form.Item
                      name="newPassword"
                      label={<span style={{ fontWeight: 600 }}>Mật khẩu mới</span>}
                      rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới' }]}
                    >
                      <Input.Password
                        placeholder="••••••••"
                        value={newPwdInput}
                        onChange={(e) => setNewPwdInput(e.target.value)}
                      />
                    </Form.Item>

                    {/* Checklist BR-A17 độ mạnh mật khẩu */}
                    <div
                      style={{
                        padding: '12px 16px',
                        background: isDark ? '#1F2937' : '#F9FAFB',
                        borderRadius: 8,
                        marginBottom: 20,
                        border: `1px solid ${isDark ? '#374151' : '#E5E7EB'}`,
                      }}
                    >
                      <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
                        Quy tắc mật khẩu an toàn (BR-A17):
                      </Text>
                      <Space direction="vertical" size={4} style={{ width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                          {pwdStrength.lengthOk ? <Check size={14} color="#10B981" /> : <span style={{ color: '#9CA3AF' }}>•</span>}
                          <span style={{ color: pwdStrength.lengthOk ? '#10B981' : undefined }}>Tối thiểu 6 ký tự</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                          {pwdStrength.uppercaseOk ? <Check size={14} color="#10B981" /> : <span style={{ color: '#9CA3AF' }}>•</span>}
                          <span style={{ color: pwdStrength.uppercaseOk ? '#10B981' : undefined }}>Có ít nhất 1 chữ cái in hoa (A-Z)</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                          {pwdStrength.numberOk ? <Check size={14} color="#10B981" /> : <span style={{ color: '#9CA3AF' }}>•</span>}
                          <span style={{ color: pwdStrength.numberOk ? '#10B981' : undefined }}>Có ít nhất 1 chữ số (0-9)</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                          {pwdStrength.specialOk ? <Check size={14} color="#10B981" /> : <span style={{ color: '#9CA3AF' }}>•</span>}
                          <span style={{ color: pwdStrength.specialOk ? '#10B981' : undefined }}>Có ít nhất 1 ký tự đặc biệt (!@#$%...)</span>
                        </div>
                      </Space>
                    </div>

                    <Form.Item
                      name="confirmPassword"
                      label={<span style={{ fontWeight: 600 }}>Xác nhận mật khẩu mới</span>}
                      dependencies={['newPassword']}
                      rules={[
                        { required: true, message: 'Vui lòng xác nhận mật khẩu mới' },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value || getFieldValue('newPassword') === value) {
                              return Promise.resolve();
                            }
                            return Promise.reject(new Error('Mật khẩu xác nhận không khớp.'));
                          },
                        }),
                      ]}
                    >
                      <Input.Password placeholder="••••••••" />
                    </Form.Item>

                    <div style={{ textAlign: 'right', marginTop: 8 }}>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={loadingPassword}
                        icon={<Lock size={16} />}
                        style={{ backgroundColor: '#0B72E7', borderRadius: 8, height: 38, padding: '0 20px' }}
                      >
                        Đổi mật khẩu
                      </Button>
                    </div>
                  </Form>
                </div>
              ),
            },
            {
              key: 'history',
              label: (
                <Space>
                  <History size={16} />
                  <span>Lịch sử đăng nhập</span>
                </Space>
              ),
              children: (
                <div style={{ paddingTop: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div>
                      <Text strong>Lịch sử 30 ngày gần nhất (BR-A20)</Text>
                      <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
                        Theo dõi danh sách các phiên đăng nhập thành công & thất bại để phát hiện truy cập bất thường
                      </Text>
                    </div>
                    <Button
                      size="small"
                      onClick={() => setDemoEmptyHistory(!demoEmptyHistory)}
                    >
                      {demoEmptyHistory ? 'Xem danh sách đầy đủ' : 'Demo trạng thái rỗng (AF-01)'}
                    </Button>
                  </div>

                  {demoEmptyHistory ? (
                    <Empty description="Chưa có lịch sử đăng nhập." style={{ padding: '40px 0' }} />
                  ) : (
                    <Table
                      dataSource={rawLoginHistory}
                      columns={historyColumns}
                      pagination={{ pageSize: 50, showTotal: (total) => `Tổng số ${total} bản ghi (BR-A20: 50 dòng/trang)` }}
                      bordered
                      size="middle"
                    />
                  )}
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
