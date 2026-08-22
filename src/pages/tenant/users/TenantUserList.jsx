// Mã màn hình: MH-MT4-01 (Danh sách tài khoản nhân viên) & MH-MT4-02 (Form Thêm/Sửa & Phân quyền Phòng — Tenant Portal)
// Dựa theo FN-MT4-01, FN-MT4-02 & UC-MT4-01, UC-MT4-02, UC-MT4-03 trong SmartSite_Function_List_v9 & SmartSite_IoT_UseCase_List_v5
import React, { useState, useMemo } from 'react';
import {
  Card,
  Typography,
  Space,
  Tag,
  Button,
  Table,
  Switch,
  Modal,
  Form,
  Input,
  Select,
  Row,
  Col,
  message,
  Tooltip,
  Dropdown,
  Alert,
  Divider,
  Badge,
} from 'antd';
import {
  Users,
  Plus,
  Shield,
  User,
  DoorOpen,
  Lock,
  Mail,
  Phone,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Layers,
  Key,
} from 'lucide-react';
import { tenantPortalService } from '../../../mock/tenantPortalService';
import { useTheme } from '../../../theme/ThemeContext';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

export default function TenantUserList() {
  const { isDark } = useTheme();
  const [users, setUsers] = useState(tenantPortalService.getTenantUsers());
  const [searchText, setSearchText] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [selectedRoomFilter, setSelectedRoomFilter] = useState('ALL');

  // Modal Thêm / Sửa tài khoản (MH-MT4-02)
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();

  // Hạn mức tài khoản (BR-T18)
  const maxUsers = 50;
  const usedUsers = users.length;

  // Danh sách các Phòng trong Tenant để gán quyền (Room-based scoping — BR-T13)
  const roomOptions = [
    { label: 'Phòng Kỹ thuật Điện & HVAC Trung tâm (RM-101)', value: 'Phòng Kỹ thuật Điện & HVAC Trung tâm (RM-101)' },
    { label: 'Phòng Server Cảng Hàng không (RM-302)', value: 'Phòng Server Cảng Hàng không (RM-302)' },
    { label: 'Sảnh Đón khách & Băng chuyền số 4 (RM-102)', value: 'Sảnh Đón khách & Băng chuyền số 4 (RM-102)' },
    { label: 'Khu vực Soát vé An ninh A (RM-301)', value: 'Khu vực Soát vé An ninh A (RM-301)' },
    { label: 'Kho Lạnh Âm sâu -20°C (RM-C01)', value: 'Kho Lạnh Âm sâu -20°C (RM-C01)' },
    { label: 'Khu Phân loại Tự động (RM-C02)', value: 'Khu Phân loại Tự động (RM-C02)' },
    { label: 'Phòng Điều khiển Trung tâm TOC (RM-TOC)', value: 'Phòng Điều khiển Trung tâm TOC (RM-TOC)' },
  ];

  // Mở modal Thêm mới (UC-MT4-01)
  const handleOpenCreateModal = () => {
    // Validate EF-01: Kiểm tra hạn mức max_users (BR-T18)
    if (usedUsers >= maxUsers) {
      message.error(`Đã đạt giới hạn số lượng tài khoản người dùng theo gói dịch vụ hiện tại (${usedUsers}/${maxUsers}). Vui lòng liên hệ để nâng hạn mức. (EF-01 / BR-T18)`);
      return;
    }

    setModalMode('create');
    setEditingUser(null);
    form.resetFields();
    form.setFieldsValue({
      role: 'AT-04',
      status: 'ACTIVE',
      assignedRooms: [],
    });
    setModalVisible(true);
  };

  // Mở modal Sửa (UC-MT4-03)
  const handleOpenEditModal = (user) => {
    setModalMode('edit');
    setEditingUser(user);
    form.resetFields();
    form.setFieldsValue({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      assignedRooms: user.assignedRooms.includes('ALL') ? [] : user.assignedRooms,
      status: user.status,
    });
    setModalVisible(true);
  };

  // Lưu Form Thêm / Sửa tài khoản (MH-MT4-02)
  const handleSaveUser = (values) => {
    if (modalMode === 'create') {
      const res = tenantPortalService.createTenantUser(values);
      if (!res.success) {
        message.error(res.message);
        return;
      }
      message.success(res.message);
    } else {
      const res = tenantPortalService.updateTenantUser(editingUser.id, values);
      if (!res.success) {
        message.error(res.message);
        return;
      }
      message.success(res.message);
    }

    setUsers([...tenantPortalService.getTenantUsers()]);
    setModalVisible(false);
    form.resetFields();
  };

  // Xóa tài khoản nhân viên (Soft-delete — BR-T38 / UC-MT4-03)
  const handleDeleteUser = (user) => {
    // Chặn Tenant Admin tự xóa chính mình (BR-T22 / EF-01)
    if (user.role === 'AT-03') {
      message.error('Bạn không thể tự xóa tài khoản của chính mình. (BR-T22 / EF-01)');
      return;
    }

    Modal.confirm({
      title: `Xác nhận gỡ bỏ tài khoản "${user.name}"?`,
      icon: <AlertTriangle size={20} style={{ color: '#DC2626' }} />,
      content: (
        <div>
          <Paragraph style={{ margin: '8px 0' }}>
            Hệ thống sẽ thực hiện <strong>Soft-delete (BR-T38)</strong>. Tài khoản sẽ bị ẩn khỏi danh sách và khóa quyền đăng nhập, nhưng các bản ghi lịch sử lệnh điều khiển RPC và Feed xử lý sự cố trước đây vẫn được bảo toàn nguyên vẹn.
          </Paragraph>
        </div>
      ),
      okText: 'Xác nhận xóa',
      okType: 'danger',
      onOk() {
        const res = tenantPortalService.deleteTenantUser(user.id);
        if (res.success) {
          message.success(res.message);
          setUsers([...tenantPortalService.getTenantUsers()]);
        } else {
          message.error(res.message);
        }
      },
    });
  };

  // Lọc danh sách nhân viên
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const term = searchText.toLowerCase().trim();
      const matchSearch =
        !term ||
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        (u.phone && u.phone.includes(term));

      const matchStatus = selectedStatusFilter === 'ALL' || u.status === selectedStatusFilter;

      let matchRoom = true;
      if (selectedRoomFilter !== 'ALL') {
        matchRoom = u.assignedRooms.includes('ALL') || u.assignedRooms.includes(selectedRoomFilter);
      }

      return matchSearch && matchStatus && matchRoom;
    });
  }, [users, searchText, selectedStatusFilter, selectedRoomFilter]);

  const columns = [
    {
      title: 'Họ và Tên Nhân Viên',
      dataIndex: 'name',
      key: 'name',
      render: (name, r) => (
        <div>
          <Space size={6}>
            {r.role === 'AT-03' ? (
              <Shield size={16} style={{ color: '#0B72E7' }} />
            ) : (
              <User size={16} style={{ color: '#10B981' }} />
            )}
            <Text strong style={{ fontSize: 13 }}>{name}</Text>
          </Space>
          <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
            <Mail size={11} style={{ display: 'inline', marginRight: 3, verticalAlign: '-1px' }} />
            <span>{r.email}</span> • <Phone size={11} style={{ display: 'inline', marginRight: 3, verticalAlign: '-1px' }} />
            <span>{r.phone || 'Chưa cập nhật'}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Vai Trò Quản Trị',
      dataIndex: 'role',
      key: 'role',
      width: 170,
      render: (role) => (
        <Tag color={role === 'AT-03' ? 'blue' : 'green'} style={{ fontWeight: 600 }}>
          {role === 'AT-03' ? 'AT-03 Tenant Admin' : 'AT-04 Tenant User'}
        </Tag>
      ),
    },
    {
      title: 'Phòng Ban Gán Quyền (Room Scoping)',
      dataIndex: 'assignedRooms',
      key: 'assignedRooms',
      render: (rooms, r) => {
        if (r.role === 'AT-03' || rooms.includes('ALL')) {
          return <Tag color="purple" style={{ fontWeight: 600 }}>Toàn bộ Không gian & Phòng</Tag>;
        }
        if (!rooms || rooms.length === 0) {
          return (
            <Tooltip title="Chưa được phân quyền phòng nào. Khi đăng nhập sẽ thấy giao diện trống (BR-T19)">
              <Tag color="default">Chưa gán phòng (Trống — BR-T19)</Tag>
            </Tooltip>
          );
        }
        return (
          <Space size={4} wrap>
            {rooms.map((rm, i) => (
              <Tag key={i} color="cyan" style={{ fontSize: 11 }}>{rm}</Tag>
            ))}
          </Space>
        );
      },
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status) =>
        status === 'ACTIVE' ? (
          <Badge status="success" text={<span style={{ color: '#10B981', fontWeight: 600 }}>Đang hoạt động</span>} />
        ) : (
          <Badge status="error" text={<span style={{ color: '#DC2626', fontWeight: 600 }}>Đã vô hiệu hóa</span>} />
        ),
    },
    {
      title: 'Thao Tác',
      key: 'actions',
      width: 90,
      align: 'center',
      render: (_, r) => {
        // Áp dụng đúng Quy tắc 2: Menu 3-dot (icon ⋮) cho các hành động phụ Sửa / Xóa
        const isSelfAdmin = r.role === 'AT-03';
        const menuItems = [
          {
            key: 'edit',
            icon: <Edit size={14} style={{ color: '#0B72E7' }} />,
            label: 'Chỉnh sửa thông tin & phân quyền',
            onClick: () => handleOpenEditModal(r),
          },
          {
            key: 'delete',
            icon: <Trash2 size={14} style={{ color: '#DC2626' }} />,
            label: isSelfAdmin ? 'Không thể xóa chính mình (BR-T22)' : 'Xóa tài khoản (Soft-delete)',
            danger: !isSelfAdmin,
            disabled: isSelfAdmin,
            onClick: () => handleDeleteUser(r),
          },
        ];

        return (
          <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
            <Button type="text" size="small" icon={<MoreVertical size={16} />} />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header trang */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Space size={8} align="center">
            <Users size={24} style={{ color: '#0B72E7' }} />
            <Title level={4} style={{ margin: 0 }}>
              Quản Lý Người Dùng & Phân Quyền Phòng
            </Title>
          </Space>
          <Text type="secondary" style={{ fontSize: 13, display: 'block', marginTop: 2 }}>
            Quản trị danh sách nhân viên nội bộ, cấp quyền truy cập theo từng Phòng giám sát (MH-MT4-01 & MH-MT4-02)
          </Text>
        </div>

        <Space>
          <Tag color="blue" style={{ fontSize: 13, padding: '4px 10px', borderRadius: 6 }}>
            MH-MT4-01 / 02
          </Tag>
          <Button
            type="primary"
            icon={<Plus size={16} />}
            onClick={handleOpenCreateModal}
            style={{ backgroundColor: '#0B72E7', borderRadius: 8, height: 38 }}
          >
            Tạo Tài Khoản Mới (UC-MT4-01)
          </Button>
        </Space>
      </div>

      {/* KPI Hạn Mức & Phân Quyền Người Dùng */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 10 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>Hạn mức tài khoản (BR-T18)</Text>
            <Title level={3} style={{ margin: '4px 0 0 0', color: '#0B72E7' }}>
              {usedUsers} <span style={{ fontSize: 14, color: '#9CA3AF' }}>/ {maxUsers}</span>
            </Title>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 10 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>Tenant Admin (AT-03)</Text>
            <Title level={3} style={{ margin: '4px 0 0 0', color: '#0B72E7' }}>
              {users.filter((u) => u.role === 'AT-03').length}
            </Title>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 10 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>Tenant User (AT-04)</Text>
            <Title level={3} style={{ margin: '4px 0 0 0', color: '#10B981' }}>
              {users.filter((u) => u.role === 'AT-04').length}
            </Title>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 10 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>Đã vô hiệu hóa (Suspended)</Text>
            <Title level={3} style={{ margin: '4px 0 0 0', color: '#EF4444' }}>
              {users.filter((u) => u.status === 'SUSPENDED').length}
            </Title>
          </Card>
        </Col>
      </Row>

      {/* Bảng Danh Sách Nhân Viên */}
      <Card style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <Row gutter={[16, 16]} align="middle" justify="space-between">
          <Col xs={24} md={8}>
            <Input
              prefix={<Search size={16} style={{ color: '#9CA3AF' }} />}
              placeholder="Tìm theo họ tên, email, số điện thoại..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>

          <Col xs={24} md={16}>
            <Space wrap style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Select
                value={selectedRoomFilter}
                onChange={setSelectedRoomFilter}
                style={{ width: 220 }}
              >
                <Option value="ALL">Toàn bộ Phòng ban</Option>
                {roomOptions.map((r) => (
                  <Option key={r.value} value={r.value}>{r.label}</Option>
                ))}
              </Select>

              <Select
                value={selectedStatusFilter}
                onChange={setSelectedStatusFilter}
                style={{ width: 170 }}
              >
                <Option value="ALL">Tất cả trạng thái</Option>
                <Option value="ACTIVE">Đang hoạt động</Option>
                <Option value="SUSPENDED">Đã vô hiệu hóa (BR-T21)</Option>
              </Select>
            </Space>
          </Col>
        </Row>

        <Divider style={{ margin: '16px 0' }} />

        <Table
          dataSource={filteredUsers}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 8, showTotal: (total) => `Tổng số ${total} nhân viên` }}
          bordered
          size="middle"
        />
      </Card>

      {/* Modal Thêm / Sửa Nhân Viên (MH-MT4-02) */}
      <Modal
        title={modalMode === 'create' ? 'Cấp Mới Tài Khoản Nhân Viên (MH-MT4-02)' : `Chỉnh Sửa Nhân Viên — ${editingUser?.name}`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        okText={modalMode === 'create' ? 'Tạo tài khoản' : 'Lưu thay đổi'}
        cancelText="Hủy"
        width={580}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveUser}
        >
          <Form.Item
            name="name"
            label={<span style={{ fontWeight: 600 }}>Họ và tên nhân viên</span>}
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
          >
            <Input placeholder="Ví dụ: Nguyễn Văn A" />
          </Form.Item>

          <Row gutter={12}>
            <Col span={14}>
              <Form.Item
                name="email"
                label={<span style={{ fontWeight: 600 }}>Địa chỉ Email (Đăng nhập)</span>}
                rules={[
                  { required: true, message: 'Vui lòng nhập email!' },
                  { type: 'email', message: 'Email không đúng định dạng!' },
                ]}
              >
                <Input disabled={modalMode === 'edit'} placeholder="nguyenvana@acv.vn" />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item
                name="phone"
                label={<span style={{ fontWeight: 600 }}>Số điện thoại</span>}
                rules={[
                  { pattern: /^(0[3|5|7|8|9])[0-9]{8}$/, message: 'SĐT Việt Nam 10 số hợp lệ!' },
                ]}
              >
                <Input placeholder="0912 345 678" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="assignedRooms"
            label={<span style={{ fontWeight: 600 }}>Phân quyền Phòng (Room Assignment — BR-T13)</span>}
          >
            <Select
              mode="multiple"
              placeholder="Chọn các Phòng nhân viên này được phép giám sát (hoặc để trống)"
              options={roomOptions}
              allowClear
            />
          </Form.Item>

          {modalMode === 'create' ? (
            <Alert
              type="info"
              showIcon
              icon={<Key size={16} />}
              message="Cơ chế Cấp Mật Khẩu Tự Động (BR-T34)"
              description="Hệ thống sẽ tự sinh mật khẩu tạm thời ngẫu nhiên và gửi trực tiếp qua email cho nhân viên mới. Không dùng liên kết mời và không ép đổi mật khẩu lần đầu."
              style={{ marginTop: 8 }}
            />
          ) : (
            <>
              <Divider style={{ margin: '12px 0' }} />
              <Form.Item
                name="status"
                label={<span style={{ fontWeight: 600 }}>Trạng thái hoạt động tài khoản (Quy tắc 2 / BR-T21)</span>}
              >
                <Select disabled={editingUser?.role === 'AT-03'}>
                  <Option value="ACTIVE">🟢 Đang hoạt động (ACTIVE)</Option>
                  <Option value="SUSPENDED">🔴 Vô hiệu hóa — Tạm khóa truy cập (SUSPENDED)</Option>
                </Select>
              </Form.Item>
              {editingUser?.role === 'AT-03' && (
                <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: -10 }}>
                  🔒 Tenant Admin không thể tự vô hiệu hóa tài khoản của chính mình (BR-T22).
                </Text>
              )}
            </>
          )}
        </Form>
      </Modal>
    </div>
  );
}
