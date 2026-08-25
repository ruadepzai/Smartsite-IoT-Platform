// Mã màn hình: MH-MT3-02 (Lịch sử Lệnh & Trung Tâm Điều Khiển Từ Xa RPC — Tenant Portal)
// Dựa theo FN-MT3-02, FN-MT3-03 & UC-MT3-02, UC-MT3-03 trong SmartSite_Function_List_v9 & SmartSite_IoT_UseCase_List_v5
import React, { useState, useMemo } from 'react';
import {
  Card,
  Typography,
  Space,
  Tag,
  Button,
  Table,
  Form,
  Select,
  Input,
  Row,
  Col,
  Alert,
  Modal,
  Badge,
  Tooltip,
  Radio,
  message,
  Divider,
} from 'antd';
import {
  Sliders,
  Send,
  History,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RotateCcw,
  Zap,
  Cpu,
  Search,
  Filter,
  User,
  Check,
  XCircle,
  Hourglass,
  SlidersHorizontal,
} from 'lucide-react';
import { tenantPortalService } from '../../../mock/tenantPortalService';
import { useTheme } from '../../../theme/ThemeContext';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

export default function TenantRpcControl() {
  const { isDark } = useTheme();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [rpcLogs, setRpcLogs] = useState(tenantPortalService.getRpcLogs());
  const [searchText, setSearchText] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [selectedDeviceFilter, setSelectedDeviceFilter] = useState('ALL');

  // Role Switcher Demo
  const [currentRoleView, setCurrentRoleView] = useState('AT-03');

  // Modal tạo lệnh RPC mới (UC-MT3-02)
  const [createModalVisible, setCreateModalVisible] = useState(false);

  const devices = tenantPortalService.getDevices();

  // Danh sách thiết bị khả dụng theo role
  const availableDevices = useMemo(() => {
    return devices.filter((d) => {
      if (d.is_deleted) return false;
      if (currentRoleView === 'AT-04') {
        const userAssignedRooms = [
          'Phòng Server Cảng Hàng không (RM-302)',
          'Phòng Kỹ thuật Điện & HVAC Trung tâm (RM-101)',
          'Khu vực Soát vé An ninh A (RM-301)',
        ];
        if (!userAssignedRooms.includes(d.room)) return false;
      }
      return true;
    });
  }, [devices, currentRoleView]);

  // Gửi lệnh RPC mới (UC-MT3-02)
  const handleSendRpc = (values) => {
    const target = devices.find((d) => d.id === values.deviceId);
    if (!target) return;

    // EF-01: Chặn gửi lệnh nếu thiết bị offline
    const stUpper = (target.status || '').toUpperCase();
    const isOnline = stUpper === 'ONLINE' || stUpper === 'WARNING' || stUpper === 'CRITICAL';
    if (!isOnline) {
      message.error('Thiết bị đang offline, không thể gửi lệnh điều khiển. (EF-01 / UC-MT3-02)');
      return;
    }

    setLoading(true);
    message.loading('Đang khởi tạo và truyền lệnh RPC qua MQTT broker...', 0.6);

    setTimeout(() => {
      setLoading(false);
      const res = tenantPortalService.sendRpcCommand(values.deviceId, values.method, values.params || '{}');
      const createdRpc = res.rpc;
      setRpcLogs([...tenantPortalService.getRpcLogs()]);
      setCreateModalVisible(false);
      form.resetFields();
      message.info(`Đã phát lệnh ${createdRpc.id}. Trạng thái: PENDING (Đang chờ thiết bị phản hồi — BR-T15)`);

      // Tự động cập nhật Real-time (WebSocket): Sau 2.5s thiết bị phản hồi và bảng tự động đổi sang SUCCESS
      setTimeout(() => {
        tenantPortalService.updateRpcStatus(
          createdRpc.id,
          'SUCCESS',
          'Thiết bị đã tiếp nhận lệnh và thực thi hoàn tất trong 2.4s (Phản hồi qua MQTT topic rpc/response).'
        );
        setRpcLogs([...tenantPortalService.getRpcLogs()]);
        message.success(`⚡ Lệnh ${createdRpc.id} đã hoàn tất thực thi: SUCCESS (Tự động cập nhật Real-time)`);
      }, 2500);
    }, 600);
  };

  // Làm mới danh sách lệnh thủ công
  const handleManualRefresh = () => {
    message.loading('Đang đồng bộ trạng thái lệnh RPC mới nhất...', 0.4);
    setTimeout(() => {
      setRpcLogs([...tenantPortalService.getRpcLogs()]);
      message.success('Đã làm mới dữ liệu lệnh RPC.');
    }, 400);
  };

  // Lọc lịch sử lệnh RPC
  const filteredLogs = useMemo(() => {
    return rpcLogs.filter((log) => {
      const term = searchText.toLowerCase().trim();
      const matchSearch =
        !term ||
        log.id.toLowerCase().includes(term) ||
        log.deviceName.toLowerCase().includes(term) ||
        log.method.toLowerCase().includes(term) ||
        log.sender.toLowerCase().includes(term);

      const matchStatus = selectedStatusFilter === 'ALL' || log.status === selectedStatusFilter;
      const matchDevice = selectedDeviceFilter === 'ALL' || log.deviceId === selectedDeviceFilter;

      return matchSearch && matchStatus && matchDevice;
    });
  }, [rpcLogs, searchText, selectedStatusFilter, selectedDeviceFilter]);

  const columns = [
    {
      title: 'Mã Lệnh & Thời Điểm',
      dataIndex: 'id',
      key: 'id',
      width: 170,
      render: (id, r) => (
        <div>
          <Text code strong>{id}</Text>
          <Text type="secondary" style={{ display: 'block', fontSize: 11, marginTop: 2 }}>
            <Clock size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: '-1px' }} />
            {r.sentAt}
          </Text>
        </div>
      ),
    },
    {
      title: 'Thiết Bị Nhận Lệnh',
      dataIndex: 'deviceName',
      key: 'deviceName',
      render: (name, r) => (
        <div>
          <Space size={6}>
            <Cpu size={14} style={{ color: '#0B72E7' }} />
            <Text strong style={{ fontSize: 13 }}>{name}</Text>
          </Space>
          <Text type="secondary" style={{ display: 'block', fontSize: 11, marginTop: 2 }}>
            Mã định danh: <code>{r.deviceId}</code>
          </Text>
        </div>
      ),
    },
    {
      title: 'Phương Thức (Method)',
      dataIndex: 'method',
      key: 'method',
      render: (m) => (
        <Tag color="blue" style={{ fontFamily: 'monospace', fontSize: 12, padding: '2px 8px' }}>
          {m}
        </Tag>
      ),
    },
    {
      title: 'Tham Số (JSON Payload)',
      dataIndex: 'params',
      key: 'params',
      render: (p) => (
        <code style={{ fontSize: 11, background: isDark ? '#1F2937' : '#F3F4F6', padding: '2px 6px', borderRadius: 4 }}>
          {p}
        </code>
      ),
    },
    {
      title: 'Trạng Thái Lệnh (BR-T15)',
      dataIndex: 'status',
      key: 'status',
      width: 160,
      render: (s) => {
        // Mô hình 4 trạng thái BR-T15: Pending -> Success / Failed / Timeout (60s BR-T35)
        if (s === 'SUCCESS') {
          return <Tag color="success" icon={<Check size={12} style={{ display: 'inline', verticalAlign: '-2px' }} />}>Thành công</Tag>;
        }
        if (s === 'FAILED') {
          return <Tag color="error" icon={<XCircle size={12} style={{ display: 'inline', verticalAlign: '-2px' }} />}>Thất bại</Tag>;
        }
        if (s === 'TIMEOUT') {
          return (
            <Tooltip title="Quá thời hạn 60 giây thiết bị không phản hồi (BR-T35)">
              <Tag color="warning" icon={<Hourglass size={12} style={{ display: 'inline', verticalAlign: '-2px' }} />}>
                Timeout (60s)
              </Tag>
            </Tooltip>
          );
        }
        return <Tag color="processing" icon={<Clock size={12} className="spin" style={{ display: 'inline', verticalAlign: '-2px' }} />}>Pending (Đang chờ)</Tag>;
      },
    },
    {
      title: 'Người Gửi Lệnh',
      dataIndex: 'sender',
      key: 'sender',
      width: 170,
      render: (sender) => (
        <Space size={4}>
          <User size={12} style={{ color: '#6B7280' }} />
          <Text style={{ fontSize: 12 }}>{sender}</Text>
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
            <Sliders size={24} style={{ color: '#0B72E7' }} />
            <Title level={4} style={{ margin: 0 }}>
              Điều Khiển Từ Xa & Lịch Sử Lệnh RPC
            </Title>
          </Space>
          <Text type="secondary" style={{ fontSize: 13, display: 'block', marginTop: 2 }}>
            Gửi lệnh RPC điều khiển thiết bị online và tra cứu lịch sử thực thi theo mô hình 4 trạng thái (MH-MT3-02)
          </Text>
        </div>

        <Space>
          <Tag color="blue" style={{ fontSize: 13, padding: '4px 10px', borderRadius: 6 }}>
            MH-MT3-02
          </Tag>
          <Button
            type="primary"
            icon={<Send size={15} />}
            onClick={() => setCreateModalVisible(true)}
            style={{ backgroundColor: '#0B72E7', borderRadius: 8, height: 38 }}
          >
            Gửi Lệnh RPC Mới (UC-MT3-02)
          </Button>
        </Space>
      </div>

      {/* Quy tắc nghiệp vụ BR-T15 & BR-T35 */}
      <Alert
        type="info"
        showIcon
        message="Quy Tắc Quản Trị Lệnh Điều Khiển RPC (BR-T15 & BR-T35)"
        description="Mọi lệnh gửi đi được đánh dấu trạng thái ban đầu là Pending. Thiết bị online phản hồi sẽ chuyển thành Success hoặc Failed. Nếu sau 60 giây không có phản hồi, hệ thống tự động chuyển trạng thái Timeout (BR-T35)."
      />

      {/* Bảng Lịch sử Lệnh RPC */}
      <Card style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <Row gutter={[16, 16]} align="middle" justify="space-between">
          <Col xs={24} md={8}>
            <Input
              prefix={<Search size={16} style={{ color: '#9CA3AF' }} />}
              placeholder="Tìm theo mã lệnh, thiết bị, method, người gửi..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>

          <Col xs={24} md={16}>
            <Space wrap style={{ width: '100%', justifyContent: 'flex-end' }}>
              {/* Role Switcher Demo */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: isDark ? '#1F2937' : '#F3F4F6', padding: '4px 10px', borderRadius: 8 }}>
                <User size={14} style={{ color: '#0B72E7' }} />
                <Text style={{ fontSize: 12 }}>Quyền xem:</Text>
                <Radio.Group
                  size="small"
                  value={currentRoleView}
                  onChange={(e) => setCurrentRoleView(e.target.value)}
                >
                  <Radio.Button value="AT-03">Admin (Toàn bộ)</Radio.Button>
                  <Radio.Button value="AT-04">User (Room gán — BR-T13)</Radio.Button>
                </Radio.Group>
              </div>

              <Select
                value={selectedDeviceFilter}
                onChange={setSelectedDeviceFilter}
                style={{ width: 220 }}
              >
                <Option value="ALL">Toàn bộ thiết bị</Option>
                {devices.map((d) => (
                  <Option key={d.id} value={d.id}>{d.name}</Option>
                ))}
              </Select>

              <Select
                value={selectedStatusFilter}
                onChange={setSelectedStatusFilter}
                style={{ width: 160 }}
              >
                <Option value="ALL">Tất cả trạng thái</Option>
                <Option value="SUCCESS">Thành công</Option>
                <Option value="FAILED">Thất bại</Option>
                <Option value="TIMEOUT">Timeout (60s)</Option>
                <Option value="PENDING">Pending (Đang chờ)</Option>
              </Select>

              <Button
                icon={<RotateCcw size={14} />}
                onClick={handleManualRefresh}
                style={{ borderRadius: 6 }}
              >
                Làm mới
              </Button>
            </Space>
          </Col>
        </Row>

        <Divider style={{ margin: '16px 0' }} />

        <Table
          dataSource={filteredLogs}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 8, showTotal: (total) => `Tổng cộng ${total} lệnh điều khiển` }}
          bordered
          size="middle"
        />
      </Card>

      {/* Modal Gửi Lệnh RPC Mới (UC-MT3-02) */}
      <Modal
        title="Gửi Lệnh Điều Khiển Từ Xa RPC (UC-MT3-02)"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        onOk={() => form.submit()}
        okText="Gửi lệnh điều khiển"
        cancelText="Hủy"
        width={580}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSendRpc}
          initialValues={{
            method: 'setRelayState',
            params: '{"state": "ON"}',
          }}
        >
          <Form.Item
            name="deviceId"
            label={<span style={{ fontWeight: 600 }}>Thiết bị nhận lệnh (Chặn thiết bị Offline — EF-01)</span>}
            rules={[{ required: true, message: 'Vui lòng chọn thiết bị!' }]}
          >
            <Select placeholder="Chọn thiết bị">
              {availableDevices.map((d) => {
                const isOnline = (d.status || '').toUpperCase() !== 'OFFLINE';
                return (
                  <Option key={d.id} value={d.id} disabled={!isOnline}>
                    {d.name} ({d.code}) — {isOnline ? '🟢 Online' : '🔴 Offline (Bị chặn gửi)'}
                  </Option>
                );
              })}
            </Select>
          </Form.Item>

          <Form.Item
            name="method"
            label={<span style={{ fontWeight: 600 }}>Phương thức lệnh (Method RPC theo Device Profile — BR-T09)</span>}
            rules={[{ required: true, message: 'Vui lòng chọn phương thức!' }]}
          >
            <Select>
              <Option value="setRelayState">setRelayState — Đóng / Mở Rơ-le công tắc</Option>
              <Option value="setMotorSpeed">setMotorSpeed — Điều chỉnh tần số động cơ bơm</Option>
              <Option value="restartDevice">restartDevice — Khởi động lại vi điều khiển</Option>
              <Option value="setTargetTemperature">setTargetTemperature — Cài đặt ngưỡng nhiệt độ mục tiêu</Option>
              <Option value="triggerCalibration">triggerCalibration — Hiệu chuẩn cảm biến</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="params"
            label={<span style={{ fontWeight: 600 }}>Tham số đầu vào (JSON Payload)</span>}
            rules={[{ required: true, message: 'Vui lòng nhập tham số JSON!' }]}
          >
            <Input.TextArea rows={3} placeholder='{"state": "ON", "durationSec": 300}' />
          </Form.Item>

          <Alert
            type="warning"
            showIcon
            message="Thời gian chờ phản hồi tối đa 60 giây (BR-T35)"
            description="Sau khi gửi lệnh, thiết bị có tối đa 60 giây để xử lý và phản hồi. Nếu quá thời gian, lệnh sẽ tự động đánh dấu Timeout."
          />
        </Form>
      </Modal>
    </div>
  );
}
