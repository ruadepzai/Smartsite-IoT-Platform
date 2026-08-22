// Mã màn hình: MH-MA1-05 (Tài khoản của tôi — 3 Tab)
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
  Key,
} from 'lucide-react';
import { authService } from '../../../mock/authService';

const { Title, Text, Paragraph } = Typography;

export default function MyAccount() {
  const [activeTab, setActiveTab] = useState('profile');
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());

  // Forms
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  // Load user data on mount
  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    profileForm.setFieldsValue({
      name: user.name,
      email: user.email,
      phone: user.phone || '0901234567',
    });
  }, [profileForm]);

  // ================= TAB 1: THÔNG TIN CÁ NHÂN =================
  const [loadingProfile, setLoadingProfile] = useState(false);

  const handleSaveProfile = (values) => {
    setLoadingProfile(true);
    setTimeout(() => {
      setLoadingProfile(false);
      const res = authService.updateCurrentUser(values);
      if (res.success) {
        setCurrentUser(res.user);
        message.success(res.message); // MSG-02: "Cập nhật thông tin thành công."
      } else {
        message.error(res.message);
      }
    }, 400);
  };

  // ================= TAB 2: ĐỔI MẬT KHẨU =================
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [newPwdInput, setNewPwdInput] = useState('');

  // Kiểm tra độ mạnh mật khẩu BR-A17
  const pwdStrength = useMemo(() => {
    return authService.validatePasswordStrength(newPwdInput);
  }, [newPwdInput]);

  const handleChangePassword = (values) => {
    // Validate BR-A17 trước khi gọi service
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

      // MSG-05: "Đổi mật khẩu thành công."
      message.success(res.message);
      passwordForm.resetFields();
      setNewPwdInput('');
    }, 400);
  };

  // ================= TAB 3: LỊCH SỬ ĐĂNG NHẬP =================
  const [historyList, setHistoryList] = useState(authService.getLoginHistory());
  const [historyPage, setHistoryPage] = useState(1);
  const historyPageSize = 50; // BR-A20: 50 bản ghi/trang

  const historyColumns = [
    {
      title: 'Nhóm ngày',
      dataIndex: 'dateGroup',
      key: 'dateGroup',
      width: 140,
      render: (dateGroup) => (
        <Tag color={dateGroup === 'Hôm nay' ? 'blue' : dateGroup === 'Hôm qua' ? 'cyan' : 'default'}>
          {dateGroup}
        </Tag>
      ),
    },
    {
      title: 'Thời gian',
      dataIndex: 'time',
      key: 'time',
      width: 120,
      render: (time) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 500 }}>
          {time}
        </span>
      ),
    },
    {
      title: 'Địa chỉ IP',
      dataIndex: 'ip',
      key: 'ip',
      width: 160,
      render: (ip) => <Text style={{ fontFamily: 'monospace' }}>{ip}</Text>,
    },
    {
      title: 'Thiết bị & Hệ điều hành',
      dataIndex: 'device',
      key: 'device',
      render: (device) => (
        <Space size={6}>
          <Laptop size={14} style={{ color: '#94A3B8' }} />
          <span>{device}</span>
        </Space>
      ),
    },
    {
      title: 'Trình duyệt',
      dataIndex: 'browser',
      key: 'browser',
      width: 160,
      render: (browser) => (
        <Space size={6}>
          <Globe size={14} style={{ color: '#94A3B8' }} />
          <span>{browser}</span>
        </Space>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 180,
      render: (status) => {
        const isSuccess = status === 'Thành công';
        return (
          <Badge
            status={isSuccess ? 'success' : 'error'}
            text={
              <span style={{ color: isSuccess ? '#3DD68C' : '#F97066', fontSize: 13, fontWeight: 500 }}>
                {status}
              </span>
            }
          />
        );
      },
    },
  ];

  const tabItems = [
    {
      key: 'profile',
      label: (
        <Space size={6}>
          <User size={16} />
          <span>Thông tin cá nhân</span>
        </Space>
      ),
      children: (
        <div style={{ maxWidth: 640, paddingTop: 12 }}>
          {/* Header Avatar card */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              padding: '16px 20px',
              borderRadius: 10,
              background: 'rgba(11, 114, 231, 0.05)',
              border: '1px solid rgba(11, 114, 231, 0.15)',
              marginBottom: 24,
            }}
          >
            <Avatar size={64} style={{ backgroundColor: '#0B72E7', fontSize: 24, fontWeight: 600 }}>
              {currentUser.name ? currentUser.name.charAt(0) : 'A'}
            </Avatar>
            <div>
              <Title level={5} style={{ margin: '0 0 2px 0' }}>
                {currentUser.name}
              </Title>
              <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 6 }}>
                {currentUser.email}
              </Text>
              <Space size={6}>
                <Tag color="purple">{currentUser.role || 'Quản trị hệ thống'}</Tag>
                <Tag color="success">Đang hoạt động</Tag>
              </Space>
            </div>
          </div>

          <Form
            form={profileForm}
            layout="vertical"
            onFinish={handleSaveProfile}
            requiredMark={true}
          >
            {/* STT 1: Họ tên */}
            <Form.Item
              name="name"
              label={<span style={{ fontWeight: 500 }}>Họ và tên</span>}
              rules={[
                { required: true, message: 'Vui lòng nhập họ và tên' },
                { max: 100, message: 'Họ và tên không được vượt quá 100 ký tự' },
              ]}
            >
              <Input
                placeholder="Nguyễn Văn A"
                prefix={<User size={16} style={{ color: '#94A3B8', marginRight: 4 }} />}
              />
            </Form.Item>

            {/* STT 2: Email */}
            <Form.Item
              name="email"
              label={<span style={{ fontWeight: 500 }}>Email</span>}
              rules={[
                { required: true, message: 'Vui lòng nhập email' },
                { type: 'email', message: 'Email không đúng định dạng' },
              ]}
            >
              <Input
                placeholder="admin@smartsite.io"
                prefix={<Mail size={16} style={{ color: '#94A3B8', marginRight: 4 }} />}
              />
            </Form.Item>

            {/* STT 3: Số điện thoại (Validate định dạng VN theo placeholder 09xx xxx xxx) */}
            <Form.Item
              name="phone"
              label={<span style={{ fontWeight: 500 }}>Số điện thoại (không bắt buộc)</span>}
              rules={[
                {
                  pattern: /^(03|05|07|08|09)\d{8}$/,
                  message: 'Số điện thoại không đúng định dạng (VD: 0901234567)', // MSG-01
                },
              ]}
              extra={<span style={{ fontSize: 12, color: '#94A3B8' }}>Định dạng số di động Việt Nam 10 số (đầu 03, 05, 07, 08, 09)</span>}
            >
              <Input
                placeholder="09xx xxx xxx"
                prefix={<Phone size={16} style={{ color: '#94A3B8', marginRight: 4 }} />}
                maxLength={10}
              />
            </Form.Item>

            {/* STT 4: Nút Lưu thay đổi */}
            <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loadingProfile}
                icon={<Save size={16} />}
                style={{ backgroundColor: '#0B72E7', height: 40, borderRadius: 6, fontWeight: 500 }}
              >
                Lưu thay đổi
              </Button>
            </Form.Item>
          </Form>
        </div>
      ),
    },
    {
      key: 'password',
      label: (
        <Space size={6}>
          <Lock size={16} />
          <span>Đổi mật khẩu</span>
        </Space>
      ),
      children: (
        <div style={{ maxWidth: 540, paddingTop: 12 }}>
          <Text type="secondary" style={{ display: 'block', marginBottom: 20 }}>
            Để bảo mật tài khoản, vui lòng sử dụng mật khẩu mạnh kết hợp chữ hoa, chữ số và ký tự đặc biệt.
          </Text>

          <Form
            form={passwordForm}
            layout="vertical"
            onFinish={handleChangePassword}
            requiredMark={true}
            onValuesChange={(_, all) => {
              setNewPwdInput(all.newPassword || '');
            }}
          >
            {/* STT 1: Mật khẩu hiện tại */}
            <Form.Item
              name="currentPassword"
              label={<span style={{ fontWeight: 500 }}>Mật khẩu hiện tại</span>}
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
            >
              <Input.Password
                placeholder="Nhập mật khẩu hiện tại (Mặc định: Admin@123!)"
                prefix={<Key size={16} style={{ color: '#94A3B8', marginRight: 4 }} />}
              />
            </Form.Item>

            {/* STT 2: Mật khẩu mới (validate BR-A17) */}
            <Form.Item
              name="newPassword"
              label={<span style={{ fontWeight: 500 }}>Mật khẩu mới</span>}
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                {
                  validator(_, value) {
                    if (!value) return Promise.resolve();
                    const check = authService.validatePasswordStrength(value);
                    if (!check.valid) {
                      return Promise.reject(
                        new Error(
                          'Mật khẩu mới chưa đạt yêu cầu: tối thiểu 6 ký tự, có chữ hoa, số và ký tự đặc biệt.'
                        )
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
              style={{ marginBottom: 10 }}
            >
              <Input.Password
                placeholder="Nhập mật khẩu mới"
                prefix={<Lock size={16} style={{ color: '#94A3B8', marginRight: 4 }} />}
              />
            </Form.Item>

            {/* Checklist tiêu chí BR-A17 */}
            <div
              style={{
                background: 'rgba(100, 116, 139, 0.08)',
                padding: '10px 14px',
                borderRadius: 6,
                border: '1px solid #334155',
                marginBottom: 18,
              }}
            >
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6, fontWeight: 500 }}>
                Yêu cầu mật khẩu an toàn (BR-A17):
              </Text>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px' }}>
                <span
                  style={{
                    fontSize: 12,
                    color: pwdStrength.lengthOk ? '#3DD68C' : '#94A3B8',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  {pwdStrength.lengthOk ? <Check size={14} /> : <span style={{ width: 14 }}>•</span>}
                  Tối thiểu 6 ký tự
                </span>
                <span
                  style={{
                    fontSize: 12,
                    color: pwdStrength.uppercaseOk ? '#3DD68C' : '#94A3B8',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  {pwdStrength.uppercaseOk ? <Check size={14} /> : <span style={{ width: 14 }}>•</span>}
                  Có chữ in hoa (A-Z)
                </span>
                <span
                  style={{
                    fontSize: 12,
                    color: pwdStrength.numberOk ? '#3DD68C' : '#94A3B8',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  {pwdStrength.numberOk ? <Check size={14} /> : <span style={{ width: 14 }}>•</span>}
                  Có chữ số (0-9)
                </span>
                <span
                  style={{
                    fontSize: 12,
                    color: pwdStrength.specialOk ? '#3DD68C' : '#94A3B8',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  {pwdStrength.specialOk ? <Check size={14} /> : <span style={{ width: 14 }}>•</span>}
                  Ký tự đặc biệt (!@#$...)
                </span>
              </div>
            </div>

            {/* STT 3: Xác nhận mật khẩu mới */}
            <Form.Item
              name="confirmPassword"
              label={<span style={{ fontWeight: 500 }}>Xác nhận mật khẩu mới</span>}
              dependencies={['newPassword']}
              rules={[
                { required: true, message: 'Vui lòng xác nhận mật khẩu mới' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                  },
                }),
              ]}
            >
              <Input.Password
                placeholder="Nhập lại mật khẩu mới"
                prefix={<Lock size={16} style={{ color: '#94A3B8', marginRight: 4 }} />}
              />
            </Form.Item>

            {/* STT 4: Nút Đổi mật khẩu */}
            <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loadingPassword}
                icon={<Shield size={16} />}
                style={{ backgroundColor: '#0B72E7', height: 40, borderRadius: 6, fontWeight: 500 }}
              >
                Đổi mật khẩu
              </Button>
            </Form.Item>
          </Form>
        </div>
      ),
    },
    {
      key: 'history',
      label: (
        <Space size={6}>
          <History size={16} />
          <span>Lịch sử đăng nhập</span>
        </Space>
      ),
      children: (
        <div style={{ paddingTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Danh sách các phiên đăng nhập trong 30 ngày gần nhất (BR-A20: 50 bản ghi/trang, sắp xếp mới nhất trước)
            </Text>
            {/* Toggle demo empty state */}
            <Button
              size="small"
              onClick={() => {
                if (historyList.length > 0) {
                  setHistoryList([]);
                } else {
                  setHistoryList(authService.getLoginHistory());
                }
              }}
            >
              {historyList.length > 0 ? 'Demo trạng thái rỗng (AF-01)' : 'Khôi phục lịch sử'}
            </Button>
          </div>

          <Table
            dataSource={historyList}
            columns={historyColumns}
            rowKey="id"
            bordered
            size="middle"
            pagination={{
              current: historyPage,
              pageSize: historyPageSize,
              total: historyList.length,
              onChange: (page) => setHistoryPage(page),
              showTotal: (total) => (
                <span style={{ color: '#94A3B8', fontSize: 13 }}>
                  Tổng cộng: {total} bản ghi đăng nhập · 50 bản ghi/trang
                </span>
              ),
            }}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <span style={{ color: '#94A3B8' }}>
                      Chưa có lịch sử đăng nhập. (MSG-06)
                    </span>
                  }
                />
              ),
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>
            Tài khoản của tôi
          </Title>
          <Text type="secondary">
            Quản lý thông tin hồ sơ cá nhân, bảo mật mật khẩu và theo dõi lịch sử đăng nhập
          </Text>
        </div>
        <Tag color="blue" style={{ fontSize: 13, padding: '4px 10px', borderRadius: 6 }}>
          MH-MA1-05
        </Tag>
      </div>

      {/* Main Card with Tabs */}
      <Card style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          size="large"
        />
      </Card>
    </div>
  );
}
