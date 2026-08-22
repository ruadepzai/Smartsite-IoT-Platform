// Mã màn hình: MH-MT2-02 (Danh sách thiết bị) & MH-MT2-03 (Form Thêm/Sửa thiết bị IoT — Tenant Portal)
// Dựa theo FN-MT2-02, FN-MT2-03, FN-MT2-04 & UC-MT2-04, UC-MT2-05, UC-MT2-06 trong SmartSite_Function_List_v9 & SmartSite_IoT_UseCase_List_v5
import React, { useState, useMemo } from 'react';
import {
  Card,
  Typography,
  Space,
  Tag,
  Button,
  Table,
  Input,
  Select,
  Row,
  Col,
  Modal,
  Form,
  message,
  Tooltip,
  Badge,
  Alert,
  Radio,
  Divider,
} from 'antd';
import {
  Cpu,
  Plus,
  Search,
  Filter,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Radio as RadioIcon,
  SlidersHorizontal,
  Edit,
  Trash2,
  HardDrive,
  ShieldCheck,
  DoorOpen,
  Building2,
  User,
  Clock,
  Layers,
} from 'lucide-react';
import { tenantPortalService } from '../../../mock/tenantPortalService';
import { useTheme } from '../../../theme/ThemeContext';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

export default function TenantDeviceList() {
  const { isDark } = useTheme();
  const [devices, setDevices] = useState(tenantPortalService.getDevices());
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedRoom, setSelectedRoom] = useState('ALL');

  // Role Switcher Demo (Tenant Admin AT-03 vs Tenant User AT-04)
  const [currentRoleView, setCurrentRoleView] = useState('AT-03'); // 'AT-03' (Admin) | 'AT-04' (User)

  // Modal Thêm / Sửa thiết bị (MH-MT2-03)
  const [deviceModalVisible, setDeviceModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [editingDevice, setEditingDevice] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState('GW-500-MODBUS');
  const [form] = Form.useForm();

  // Hạn mức thiết bị (BR-T06)
  const maxDevices = 300;
  const currentTotal = devices.filter((d) => !d.is_deleted).length;

  // Mở modal Thêm mới (UC-MT2-04)
  const handleOpenCreateModal = () => {
    // Validate BR-T06: Không vượt max_devices
    if (currentTotal >= maxDevices) {
      message.error('Đã đạt giới hạn số lượng thiết bị cho phép. (EF-01 / BR-T06)');
      return;
    }

    setModalMode('create');
    setEditingDevice(null);
    form.resetFields();
    form.setFieldsValue({
      category: 'Gateway',
      deviceProfile: 'GW-500-MODBUS',
      room: 'Phòng Server Trung tâm',
      building: 'Nhà ga Hành khách T2',
    });
    setSelectedProfile('GW-500-MODBUS');
    setDeviceModalVisible(true);
  };

  // Mở modal Sửa (UC-MT2-05)
  const handleOpenEditModal = (device) => {
    setModalMode('edit');
    setEditingDevice(device);
    setSelectedProfile(device.deviceProfile || 'GW-500-MODBUS');
    form.setFieldsValue({
      code: device.code,
      name: device.name,
      category: device.category,
      deviceProfile: device.deviceProfile || 'GW-500-MODBUS',
      room: device.room,
      building: device.building,
    });
    setDeviceModalVisible(true);
  };

  // Lưu Form Thêm / Sửa thiết bị
  const handleSaveDevice = (values) => {
    if (modalMode === 'create') {
      // Validate BR-T32: Mã thiết bị unique toàn hệ thống
      const isDuplicate = devices.some(
        (d) => !d.is_deleted && d.code.toLowerCase() === values.code.trim().toLowerCase()
      );
      if (isDuplicate) {
        form.setFields([
          {
            name: 'code',
            errors: ['Mã thiết bị đã được sử dụng. (EF-02 / BR-T32)'],
          },
        ]);
        message.error('Mã thiết bị đã được sử dụng.');
        return;
      }

      const newId = `DEV-${Date.now().toString().slice(-4)}`;
      const newDev = {
        id: newId,
        code: values.code.trim(),
        name: values.name.trim(),
        category: values.category,
        deviceProfile: values.deviceProfile,
        model: values.deviceProfile.split('-')[0] + ' Standard',
        room: values.room,
        building: values.building || 'Nhà ga Hành khách T2',
        ip: `192.168.1.${Math.floor(Math.random() * 200 + 10)}`,
        status: 'online',
        firmware: 'v2.4.1',
        is_deleted: false,
      };

      setDevices([newDev, ...devices]);
      message.success(`Đăng ký thiết bị ${values.name} thành công. (UC-MT2-04)`);
    } else {
      // Sửa hồ sơ thiết bị (UC-MT2-05)
      const updated = devices.map((d) => {
        if (d.id === editingDevice.id) {
          return {
            ...d,
            name: values.name.trim(),
            category: values.category,
            deviceProfile: values.deviceProfile,
            room: values.room,
            building: values.building || d.building,
          };
        }
        return d;
      });
      setDevices(updated);
      message.success(`Cập nhật thông tin thiết bị ${values.name} thành công. (UC-MT2-05)`);
    }

    setDeviceModalVisible(false);
    form.resetFields();
  };

  // Xóa thiết bị (UC-MT2-05 / AF-01: Soft-delete BR-T36)
  const handleDeleteDevice = (device) => {
    Modal.confirm({
      title: `Xác nhận gỡ bỏ thiết bị "${device.name}"?`,
      icon: <AlertTriangle size={20} style={{ color: '#DC2626' }} />,
      content: (
        <div>
          <Paragraph style={{ margin: '8px 0' }}>
            Thiết bị sẽ được chuyển sang trạng thái lưu trữ (<strong>Soft-delete — BR-T36</strong>). Dữ liệu telemetry lịch sử và nhật ký điều khiển vẫn được bảo toàn để phục vụ báo cáo kiểm toán.
          </Paragraph>
        </div>
      ),
      okText: 'Xác nhận xóa',
      okType: 'danger',
      onOk() {
        const softDeleted = devices.map((d) =>
          d.id === device.id ? { ...d, is_deleted: true } : d
        );
        setDevices(softDeleted);
        message.success(`Đã gỡ bỏ thiết bị ${device.name} khỏi hệ thống. (BR-T36)`);
      },
    });
  };

  // Lọc danh sách thiết bị
  const visibleDevices = useMemo(() => {
    return devices.filter((d) => {
      if (d.is_deleted) return false;

      // Phân quyền Role: AT-04 chỉ thấy trong Phòng được gán (BR-T13 / BR-T02)
      if (currentRoleView === 'AT-04') {
        const userAssignedRooms = [
          'Phòng Server Cảng Hàng không (RM-302)',
          'Phòng Kỹ thuật Điện & HVAC Trung tâm (RM-101)',
          'Khu vực Soát vé An ninh A (RM-301)',
        ];
        if (!userAssignedRooms.includes(d.room)) return false;
      }

      const term = searchText.toLowerCase().trim();
      const matchSearch =
        !term ||
        d.name.toLowerCase().includes(term) ||
        d.code.toLowerCase().includes(term) ||
        d.room.toLowerCase().includes(term) ||
        d.building.toLowerCase().includes(term);

      const matchCategory = selectedCategory === 'ALL' || d.category === selectedCategory;

      const stUpper = (d.status || '').toUpperCase();
      const isOnline = stUpper === 'ONLINE' || stUpper === 'WARNING' || stUpper === 'CRITICAL';
      const isOffline24h = (d.offlineHours || 0) > 24;

      let matchStatus = true;
      if (selectedStatus === 'online') {
        matchStatus = isOnline;
      } else if (selectedStatus === 'offline') {
        matchStatus = !isOnline && !isOffline24h;
      } else if (selectedStatus === 'offline_24h') {
        matchStatus = isOffline24h;
      }

      const matchRoom = selectedRoom === 'ALL' || d.room === selectedRoom;

      return matchSearch && matchCategory && matchStatus && matchRoom;
    });
  }, [devices, searchText, selectedCategory, selectedStatus, selectedRoom, currentRoleView]);

  // Thống kê nhanh KPI
  const stats = useMemo(() => {
    const active = devices.filter((d) => !d.is_deleted);
    const onlineCount = active.filter((d) => {
      const st = (d.status || '').toUpperCase();
      return st === 'ONLINE' || st === 'WARNING' || st === 'CRITICAL';
    }).length;

    const offline24hCount = active.filter((d) => (d.offlineHours || 0) > 24).length;
    const regularOfflineCount = active.filter((d) => {
      const st = (d.status || '').toUpperCase();
      return (st === 'OFFLINE' || !st) && (d.offlineHours || 0) <= 24;
    }).length;

    return {
      total: active.length,
      online: onlineCount,
      offline: regularOfflineCount,
      offline24h: offline24hCount,
    };
  }, [devices]);

  const columns = [
    {
      title: 'Thiết bị & Mã định danh',
      dataIndex: 'name',
      key: 'name',
      render: (name, r) => (
        <div>
          <Space size={6}>
            <Cpu size={16} style={{ color: '#0B72E7' }} />
            <Text strong style={{ fontSize: 13 }}>{name}</Text>
          </Space>
          <Text type="secondary" style={{ display: 'block', fontSize: 11, marginTop: 2 }}>
            Mã định danh (BR-T32): <code>{r.code}</code> • IP: {r.ip}
          </Text>
        </div>
      ),
    },
    {
      title: 'Nhóm & Device Profile',
      dataIndex: 'category',
      key: 'category',
      render: (cat, r) => (
        <div>
          <Tag color="blue" style={{ fontSize: 11 }}>{cat}</Tag>
          <Text type="secondary" style={{ display: 'block', fontSize: 11, marginTop: 2 }}>
            Profile: <code>{r.deviceProfile || 'GW-500-MODBUS'}</code>
          </Text>
        </div>
      ),
    },
    {
      title: 'Vị trí Lắp đặt',
      dataIndex: 'room',
      key: 'room',
      render: (room, r) => (
        <div>
          <Space size={4}>
            <DoorOpen size={12} style={{ color: '#06B6D4' }} />
            <Text strong style={{ fontSize: 12 }}>{room}</Text>
          </Space>
          <Text type="secondary" style={{ display: 'block', fontSize: 11 }}>
            🏢 {r.building}
          </Text>
        </div>
      ),
    },
    {
      title: 'Trạng thái Kết nối',
      dataIndex: 'status',
      key: 'status',
      width: 190,
      render: (st, r) => {
        const stUpper = (st || '').toUpperCase();
        if ((r.offlineHours || 0) > 24) {
          return (
            <Tooltip title={`Thiết bị mất kết nối ${r.offlineHours}h (>24h kích hoạt cảnh báo BR-T08)`}>
              <Tag color="error" icon={<AlertTriangle size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: '-2px' }} />}>
                Offline &gt; 24h (BR-T08)
              </Tag>
            </Tooltip>
          );
        }
        if (stUpper === 'ONLINE') {
          return <Badge status="success" text={<span style={{ color: '#10B981', fontWeight: 600 }}>Online</span>} />;
        }
        if (stUpper === 'WARNING') {
          return <Badge status="warning" text={<span style={{ color: '#D97706', fontWeight: 600 }}>Online (Cảnh báo)</span>} />;
        }
        if (stUpper === 'CRITICAL') {
          return <Badge status="error" text={<span style={{ color: '#DC2626', fontWeight: 600 }}>Online (Báo động)</span>} />;
        }
        return <Badge status="default" text={<span style={{ color: '#9CA3AF' }}>Offline</span>} />;
      },
    },
    {
      title: 'Firmware',
      dataIndex: 'firmware',
      key: 'firmware',
      width: 110,
      render: (fw) => <Tag color="cyan">{fw || 'v2.4.1'}</Tag>,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 110,
      align: 'center',
      render: (_, r) => (
        <Space size={4}>
          <Tooltip title="Sửa hồ sơ thiết bị">
            <Button
              type="text"
              size="small"
              icon={<Edit size={14} />}
              onClick={() => handleOpenEditModal(r)}
              style={{ color: '#0B72E7' }}
            />
          </Tooltip>
          <Tooltip title="Gỡ bỏ thiết bị (Soft-delete BR-T36)">
            <Button
              type="text"
              size="small"
              icon={<Trash2 size={14} />}
              danger
              onClick={() => handleDeleteDevice(r)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header trang */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Space size={8} align="center">
            <Cpu size={24} style={{ color: '#0B72E7' }} />
            <Title level={4} style={{ margin: 0 }}>
              Danh Sách Thiết Bị IoT (Device Registry)
            </Title>
          </Space>
          <Text type="secondary" style={{ fontSize: 13, display: 'block', marginTop: 2 }}>
            Quản lý đăng ký, sửa thông tin và giám sát trạng thái Online/Offline của toàn bộ thiết bị (MH-MT2-02)
          </Text>
        </div>

        <Space>
          <Tag color="blue" style={{ fontSize: 13, padding: '4px 10px', borderRadius: 6 }}>
            MH-MT2-02
          </Tag>
          <Button
            type="primary"
            icon={<Plus size={16} />}
            onClick={handleOpenCreateModal}
            style={{ backgroundColor: '#0B72E7', borderRadius: 8, height: 38 }}
          >
            Đăng Ký Thiết Bị Mới
          </Button>
        </Space>
      </div>

      {/* KPI Hạn Mức & Trạng Thái Kết Nối */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 10 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>Hạn mức thiết bị (BR-T06)</Text>
            <Title level={3} style={{ margin: '4px 0 0 0', color: '#0B72E7' }}>
              {stats.total} <span style={{ fontSize: 14, color: '#9CA3AF' }}>/ {maxDevices}</span>
            </Title>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 10 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>Đang hoạt động (Online)</Text>
            <Title level={3} style={{ margin: '4px 0 0 0', color: '#10B981' }}>
              {stats.online}
            </Title>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 10 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>Mất kết nối (Offline)</Text>
            <Title level={3} style={{ margin: '4px 0 0 0', color: '#6B7280' }}>
              {stats.offline}
            </Title>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 10 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>Mất kết nối &gt; 24h (BR-T08)</Text>
            <Title level={3} style={{ margin: '4px 0 0 0', color: '#DC2626' }}>
              {stats.offline24h}
            </Title>
          </Card>
        </Col>
      </Row>

      {/* Bộ lọc & Tìm kiếm */}
      <Card style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <Row gutter={[16, 16]} align="middle" justify="space-between">
          <Col xs={24} md={8}>
            <Input
              prefix={<Search size={16} style={{ color: '#9CA3AF' }} />}
              placeholder="Tìm theo tên, mã thiết bị, phòng..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>

          <Col xs={24} md={16}>
            <Space wrap style={{ width: '100%', justifyContent: 'flex-end' }}>
              {/* Demo Switcher Vai trò Người dùng */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: isDark ? '#1F2937' : '#F3F4F6', padding: '4px 10px', borderRadius: 8 }}>
                <User size={14} style={{ color: '#0B72E7' }} />
                <Text style={{ fontSize: 12 }}>Xem theo quyền:</Text>
                <Radio.Group
                  size="small"
                  value={currentRoleView}
                  onChange={(e) => setCurrentRoleView(e.target.value)}
                >
                  <Radio.Button value="AT-03">Tenant Admin (Toàn bộ)</Radio.Button>
                  <Radio.Button value="AT-04">Tenant User (Room gán)</Radio.Button>
                </Radio.Group>
              </div>

              <Select
                value={selectedCategory}
                onChange={setSelectedCategory}
                style={{ width: 150 }}
              >
                <Option value="ALL">Tất cả nhóm</Option>
                <Option value="Gateway">Gateway</Option>
                <Option value="Cảm biến">Cảm biến</Option>
                <Option value="Đồng hồ đo">Đồng hồ đo</Option>
                <Option value="Bộ chấp hành">Bộ chấp hành</Option>
              </Select>

              <Select
                value={selectedStatus}
                onChange={setSelectedStatus}
                style={{ width: 160 }}
              >
                <Option value="ALL">Tất cả trạng thái</Option>
                <Option value="online">Online</Option>
                <Option value="offline">Offline</Option>
                <Option value="offline_24h">Offline &gt; 24h (BR-T08)</Option>
              </Select>
            </Space>
          </Col>
        </Row>

        <Divider style={{ margin: '16px 0' }} />

        {/* Bảng danh sách thiết bị */}
        <Table
          dataSource={visibleDevices}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10, showTotal: (total) => `Tổng số ${total} thiết bị` }}
          bordered
          size="middle"
        />
      </Card>

      {/* Modal Đăng Ký / Sửa Thiết Bị (MH-MT2-03) */}
      <Modal
        title={modalMode === 'create' ? 'Đăng Ký Thiết Bị IoT Mới (MH-MT2-03)' : `Sửa Hồ Sơ Thiết Bị — ${editingDevice?.name}`}
        open={deviceModalVisible}
        onCancel={() => setDeviceModalVisible(false)}
        onOk={() => form.submit()}
        okText={modalMode === 'create' ? 'Đăng ký thiết bị' : 'Lưu thay đổi'}
        cancelText="Hủy"
        width={580}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveDevice}
        >
          <Form.Item
            name="code"
            label={<span style={{ fontWeight: 600 }}>Mã định danh thiết bị / IMEI (Unique toàn hệ thống — BR-T32)</span>}
            rules={[{ required: true, message: 'Vui lòng nhập mã thiết bị!' }]}
          >
            <Input
              disabled={modalMode === 'edit'}
              placeholder="Ví dụ: GW-500-001, SN-200-045..."
            />
          </Form.Item>

          <Form.Item
            name="name"
            label={<span style={{ fontWeight: 600 }}>Tên hiển thị thiết bị</span>}
            rules={[{ required: true, message: 'Vui lòng nhập tên hiển thị!' }]}
          >
            <Input placeholder="Ví dụ: Gateway Sảnh T2, Cảm biến Nhiệt Server..." />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="category"
                label={<span style={{ fontWeight: 600 }}>Nhóm thiết bị (Bắt buộc — BR-T24)</span>}
                rules={[{ required: true, message: 'Vui lòng chọn nhóm thiết bị!' }]}
              >
                <Select placeholder="Chọn nhóm">
                  <Option value="Gateway">Gateway</Option>
                  <Option value="Cảm biến">Cảm biến Môi trường</Option>
                  <Option value="Đồng hồ đo">Đồng hồ Đo Điện/Nước</Option>
                  <Option value="Bộ chấp hành">Bộ Chấp Hành / Relay</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="deviceProfile"
                label={<span style={{ fontWeight: 600 }}>Device Profile (BR-T09)</span>}
                rules={[{ required: true, message: 'Vui lòng chọn Device Profile!' }]}
              >
                <Select
                  placeholder="Chọn Profile"
                  onChange={(val) => setSelectedProfile(val)}
                >
                  <Option value="GW-500-MODBUS">GW-500 (Modbus RTU/TCP)</Option>
                  <Option value="SN-200-MQTT">SN-200 (MQTT Temp/Humid)</Option>
                  <Option value="SM-100-PULSE">SM-100 (Pulse Electric Meter)</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {modalMode === 'edit' && (
            <Alert
              type="info"
              showIcon
              message="Đổi Device Profile (EF-01)"
              description="Dữ liệu telemetry lịch sử sẽ giữ nguyên. Chỉ telemetry phát sinh sau thời điểm đổi mới theo Profile mới."
              style={{ marginBottom: 16 }}
            />
          )}

          <Form.Item
            name="room"
            label={<span style={{ fontWeight: 600 }}>Gán vào Phòng / Không gian (Room Assignment)</span>}
            rules={[{ required: true, message: 'Thiết bị bắt buộc gán vào 1 Phòng!' }]}
          >
            <Select placeholder="Chọn Phòng lắp đặt">
              <Option value="Phòng Server Trung tâm">Phòng Server Trung tâm (Tòa T2)</Option>
              <Option value="Ga T2 — Sảnh Đi">Ga T2 — Sảnh Đi (Tầng 2)</Option>
              <Option value="Ga T2 — Sảnh Đến">Ga T2 — Sảnh Đến (Tầng 1)</Option>
              <Option value="Kho Hàng Hóa ALS">Kho Hàng Hóa ALS (Nhà ga ALS Cargo)</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
