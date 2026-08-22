// Mã màn hình: MH-MT3-01 (Dashboard Giám sát Thời Gian Thực & Điều Hành Nhanh — Tenant Portal)
// Dựa theo FN-MT3-01, FN-MT3-02 & UC-MT3-01, UC-MT3-02 trong SmartSite_Function_List_v9 & SmartSite_IoT_UseCase_List_v5
import React, { useState, useMemo } from 'react';
import {
  Card,
  Typography,
  Row,
  Col,
  Space,
  Tag,
  Button,
  Progress,
  Badge,
  Table,
  Select,
  Tooltip,
  Radio,
  Modal,
  Form,
  Input,
  message,
  Divider,
  Alert,
} from 'antd';
import {
  Activity,
  Thermometer,
  Droplets,
  Zap,
  Gauge,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Building2,
  RefreshCw,
  Sliders,
  Send,
  Wifi,
  Radio as RadioIcon,
  DoorOpen,
  User,
  Power,
  RotateCcw,
  SlidersHorizontal,
  Layers,
} from 'lucide-react';
import { tenantPortalService } from '../../../mock/tenantPortalService';
import { AreaLineChart, Sparkline } from '../../../components/charts/DashboardCharts';
import { useTheme } from '../../../theme/ThemeContext';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

export default function TenantDashboard() {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState('ALL');
  const [chartTimeRange, setChartTimeRange] = useState('24H'); // '24H' (Realtime) | '30D' (Tổng hợp 30 ngày — BR-T17)

  // Role Switcher Demo (AT-03 thấy toàn bộ BR-T14 vs AT-04 chỉ thấy room gán BR-T13)
  const [currentRoleView, setCurrentRoleView] = useState('AT-03');

  // Modal Gửi lệnh RPC nhanh từ Dashboard (FN-MT3-02 / UC-MT3-02)
  const [rpcModalVisible, setRpcModalVisible] = useState(false);
  const [targetDevice, setTargetDevice] = useState(null);
  const [rpcForm] = Form.useForm();

  const devices = tenantPortalService.getDevices();
  const alerts = tenantPortalService.getAlerts();

  // Lọc thiết bị theo quyền và phòng
  const visibleDevices = useMemo(() => {
    return devices.filter((d) => {
      if (d.is_deleted) return false;

      // Phân quyền AT-04 chỉ thấy Room được gán (BR-T13)
      if (currentRoleView === 'AT-04') {
        const userAssignedRooms = [
          'Phòng Server Cảng Hàng không (RM-302)',
          'Phòng Kỹ thuật Điện & HVAC Trung tâm (RM-101)',
          'Khu vực Soát vé An ninh A (RM-301)',
        ];
        if (!userAssignedRooms.includes(d.room)) return false;
      }

      if (selectedRoom !== 'ALL' && d.room !== selectedRoom) return false;
      return true;
    });
  }, [devices, selectedRoom, currentRoleView]);

  // Thống kê nhanh
  const kpi = useMemo(() => {
    const online = visibleDevices.filter((d) => {
      const st = (d.status || '').toUpperCase();
      return st === 'ONLINE' || st === 'WARNING' || st === 'CRITICAL';
    }).length;
    const warning = visibleDevices.filter((d) => (d.status || '').toUpperCase() === 'WARNING').length;
    const critical = visibleDevices.filter((d) => (d.status || '').toUpperCase() === 'CRITICAL').length;
    const offline = visibleDevices.length - online;

    return { total: visibleDevices.length, online, warning, critical, offline };
  }, [visibleDevices]);

  // Mở modal RPC nhanh
  const handleOpenRpcModal = (device) => {
    // Chặn gửi lệnh nếu thiết bị offline (EF-01 / UC-MT3-02)
    const stUpper = (device.status || '').toUpperCase();
    const isOnline = stUpper === 'ONLINE' || stUpper === 'WARNING' || stUpper === 'CRITICAL';
    if (!isOnline) {
      message.error('Thiết bị đang offline, không thể gửi lệnh. (EF-01 / UC-MT3-02)');
      return;
    }

    setTargetDevice(device);
    rpcForm.resetFields();
    rpcForm.setFieldsValue({
      method: 'setRelayState',
      params: '{"state": "ON"}',
    });
    setRpcModalVisible(true);
  };

  // Gửi lệnh RPC từ modal
  const handleSendRpcCommand = (values) => {
    tenantPortalService.sendRpcCommand(targetDevice.id, values.method, values.params);
    message.success(`Đã gửi lệnh ${values.method} tới thiết bị ${targetDevice.name}. Trạng thái: PENDING (BR-T15 / UC-MT3-02)`);
    setRpcModalVisible(false);
  };

  // Dữ liệu chuỗi thời gian 24H vs 30 Ngày (BR-T17)
  const telemetryTimeSeries = useMemo(() => {
    if (chartTimeRange === '24H') {
      return [
        { time: '00:00', throughput: 22.4, wsConnections: 54 },
        { time: '04:00', throughput: 21.8, wsConnections: 52 },
        { time: '08:00', throughput: 23.5, wsConnections: 58 },
        { time: '12:00', throughput: 24.2, wsConnections: 62 },
        { time: '16:00', throughput: 23.8, wsConnections: 60 },
        { time: '20:00', throughput: 22.9, wsConnections: 56 },
        { time: '23:59', throughput: 23.1, wsConnections: 55 },
      ];
    } else {
      // 30 Ngày
      return [
        { time: '01/08', throughput: 21.5, wsConnections: 48 },
        { time: '05/08', throughput: 22.1, wsConnections: 50 },
        { time: '10/08', throughput: 23.8, wsConnections: 56 },
        { time: '15/08', throughput: 24.5, wsConnections: 65 },
        { time: '20/08', throughput: 23.0, wsConnections: 58 },
        { time: '25/08', throughput: 22.8, wsConnections: 54 },
        { time: '30/08', throughput: 23.2, wsConnections: 57 },
      ];
    }
  }, [chartTimeRange]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Space size={8} align="center">
            <Activity size={24} style={{ color: '#0B72E7' }} />
            <Title level={4} style={{ margin: 0 }}>
              Dashboard Giám Sát & Điều Hành Thời Gian Thực
            </Title>
          </Space>
          <Text type="secondary" style={{ fontSize: 13, display: 'block', marginTop: 2 }}>
            Giám sát telemetry 24h & tổng hợp 30 ngày, điều khiển RPC trực tiếp thiết bị theo phân quyền (MH-MT3-01)
          </Text>
        </div>

        <Space size={10}>
          <Tag color="blue" style={{ fontSize: 13, padding: '4px 10px', borderRadius: 6 }}>
            MH-MT3-01
          </Tag>
          <Button
            icon={<RefreshCw size={14} className={loading ? 'spin' : ''} />}
            onClick={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 300);
            }}
            loading={loading}
          >
            Làm mới
          </Button>
        </Space>
      </div>

      {/* Bộ lọc theo Phòng & Vai trò */}
      <Card style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <Row gutter={[16, 16]} align="middle" justify="space-between">
          <Col xs={24} md={14}>
            <Space wrap>
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
                value={selectedRoom}
                onChange={setSelectedRoom}
                style={{ width: 260 }}
              >
                <Option value="ALL">Toàn bộ Phòng / Không gian</Option>
                <Option value="Phòng Server Cảng Hàng không (RM-302)">Phòng Server Cảng HK (RM-302)</Option>
                <Option value="Phòng Kỹ thuật Điện & HVAC Trung tâm (RM-101)">Phòng Điện & HVAC (RM-101)</Option>
                <Option value="Kho Lạnh Âm sâu -20°C (RM-C01)">Kho Lạnh Âm sâu (RM-C01)</Option>
                <Option value="Phòng Điều khiển Trung tâm TOC (RM-TOC)">Trung tâm Điều hành TOC</Option>
              </Select>
            </Space>
          </Col>

          <Col xs={24} md={10} style={{ textAlign: 'right' }}>
            <Radio.Group
              value={chartTimeRange}
              onChange={(e) => setChartTimeRange(e.target.value)}
              buttonStyle="solid"
            >
              <Radio.Button value="24H">Real-time 24 Giờ</Radio.Button>
              <Radio.Button value="30D">Tổng hợp 30 Ngày (BR-T17)</Radio.Button>
            </Radio.Group>
          </Col>
        </Row>
      </Card>

      {/* KPI Overview Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 10 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>Thiết bị trong phạm vi</Text>
            <Title level={3} style={{ margin: '4px 0 0 0', color: '#0B72E7' }}>{kpi.total}</Title>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 10 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>Online kết nối</Text>
            <Title level={3} style={{ margin: '4px 0 0 0', color: '#10B981' }}>{kpi.online}</Title>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 10 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>Cảnh báo thông số (Warning)</Text>
            <Title level={3} style={{ margin: '4px 0 0 0', color: '#F59E0B' }}>{kpi.warning}</Title>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 10 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>Báo động khẩn (Critical)</Text>
            <Title level={3} style={{ margin: '4px 0 0 0', color: '#DC2626' }}>{kpi.critical}</Title>
          </Card>
        </Col>
      </Row>

      {/* Biểu đồ Telemetry & Tải Vận Hành (BR-T17) */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card
            title={
              <Space>
                <Activity size={16} style={{ color: '#0B72E7' }} />
                <span>Xu Hướng Nhiệt Độ & Tải Vận Hành ({chartTimeRange === '24H' ? '24 Giờ Gần Nhất' : '30 Ngày Qua — BR-T17'})</span>
              </Space>
            }
            style={{ borderRadius: 12 }}
          >
            <div style={{ height: 260 }}>
              <AreaLineChart
                data={telemetryTimeSeries}
                xKey="time"
                lines={[
                  { key: 'throughput', name: 'Nhiệt độ TB (°C)', color: '#0B72E7' },
                  { key: 'wsConnections', name: 'Công suất tải (kW)', color: '#10B981' },
                ]}
              />
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <AlertTriangle size={16} style={{ color: '#DC2626' }} />
                <span>Cảnh Báo Cần Xử Lý Ngay</span>
              </Space>
            }
            style={{ borderRadius: 12, height: '100%' }}
          >
            <Space direction="vertical" size={10} style={{ width: '100%' }}>
              {alerts.slice(0, 3).map((a) => (
                <div
                  key={a.id}
                  style={{
                    padding: 10,
                    borderRadius: 8,
                    background: a.severity === 'CRITICAL' ? (isDark ? '#3F1818' : '#FEF2F2') : (isDark ? '#362312' : '#FFFBEB'),
                    borderLeft: `4px solid ${a.severity === 'CRITICAL' ? '#DC2626' : '#F59E0B'}`,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text strong style={{ fontSize: 12 }}>{a.title}</Text>
                    <Tag color={a.severity === 'CRITICAL' ? 'error' : 'warning'} style={{ fontSize: 10, margin: 0 }}>
                      {a.severity}
                    </Tag>
                  </div>
                  <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 2 }}>
                    📍 {a.room} • {a.triggeredAt}
                  </Text>
                </div>
              ))}

              <Button
                type="link"
                block
                style={{ marginTop: 8 }}
                onClick={() => (window.location.href = '/tenant/alerts')}
              >
                Xem Toàn Bộ Trung Tâm Cảnh Báo &gt;
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Bảng Giám Sát & Điều Khiển RPC Nhanh Thiết Bị (FN-MT3-02 / UC-MT3-02) */}
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space>
              <Cpu size={16} style={{ color: '#0B72E7' }} />
              <span>Bảng Thiết Bị & Lệnh Điều Khiển Từ Xa (Quick RPC Control — FN-MT3-02)</span>
            </Space>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Chặn gửi lệnh nếu thiết bị offline (EF-01)
            </Text>
          </div>
        }
        style={{ borderRadius: 12 }}
      >
        <Table
          dataSource={visibleDevices}
          rowKey="id"
          pagination={false}
          size="middle"
          bordered
          columns={[
            {
              title: 'Thiết bị & Mã',
              dataIndex: 'name',
              render: (name, r) => (
                <div>
                  <strong>{name}</strong>
                  <Text type="secondary" style={{ display: 'block', fontSize: 11 }}><code>{r.code}</code> • {r.category}</Text>
                </div>
              ),
            },
            {
              title: 'Vị trí',
              dataIndex: 'room',
              render: (rm, r) => <div>{rm}<br /><Text type="secondary" style={{ fontSize: 11 }}>{r.building}</Text></div>,
            },
            {
              title: 'Telemetry Thời Gian Thực',
              render: (_, r) => {
                if (!r.telemetry) return <Text type="secondary">—</Text>;
                return (
                  <Space size={12}>
                    {r.telemetry.temperature !== undefined && (
                      <Text style={{ fontSize: 12 }}>🌡️ {r.telemetry.temperature} °C</Text>
                    )}
                    {r.telemetry.humidity !== undefined && (
                      <Text style={{ fontSize: 12 }}>💧 {r.telemetry.humidity} %</Text>
                    )}
                    {r.telemetry.activePower !== undefined && (
                      <Text style={{ fontSize: 12 }}>⚡ {r.telemetry.activePower} kW</Text>
                    )}
                    {r.telemetry.pressureBar !== undefined && (
                      <Text style={{ fontSize: 12, color: r.telemetry.pressureBar < 3 ? '#DC2626' : undefined }}>
                        🎛️ {r.telemetry.pressureBar} bar
                      </Text>
                    )}
                  </Space>
                );
              },
            },
            {
              title: 'Kết nối',
              dataIndex: 'status',
              render: (st, r) => {
                const stUpper = (st || '').toUpperCase();
                if ((r.offlineHours || 0) > 24) return <Tag color="error">Offline &gt; 24h</Tag>;
                if (stUpper === 'ONLINE') return <Badge status="success" text="Online" />;
                if (stUpper === 'WARNING') return <Badge status="warning" text="Warning" />;
                if (stUpper === 'CRITICAL') return <Badge status="error" text="Critical" />;
                return <Badge status="default" text="Offline" />;
              },
            },
            {
              title: 'Thao tác RPC',
              align: 'center',
              width: 160,
              render: (_, r) => {
                const isOnline = (r.status || '').toUpperCase() !== 'OFFLINE';
                return (
                  <Tooltip title={isOnline ? 'Gửi lệnh điều khiển RPC' : 'Chặn gửi lệnh cho thiết bị offline (EF-01)'}>
                    <Button
                      type="primary"
                      size="small"
                      disabled={!isOnline}
                      icon={<Send size={12} />}
                      onClick={() => handleOpenRpcModal(r)}
                      style={{ backgroundColor: isOnline ? '#0B72E7' : undefined, borderRadius: 6 }}
                    >
                      Điều khiển RPC
                    </Button>
                  </Tooltip>
                );
              },
            },
          ]}
        />
      </Card>

      {/* Modal Gửi Lệnh RPC Nhanh (UC-MT3-02) */}
      <Modal
        title={`Gửi Lệnh Điều Khiển RPC — ${targetDevice?.name}`}
        open={rpcModalVisible}
        onCancel={() => setRpcModalVisible(false)}
        onOk={() => rpcForm.submit()}
        okText="Gửi lệnh điều khiển"
        cancelText="Hủy"
        width={500}
      >
        {targetDevice && (
          <Form
            form={rpcForm}
            layout="vertical"
            onFinish={handleSendRpcCommand}
          >
            <Alert
              type="info"
              showIcon
              message={`Thiết bị: ${targetDevice.name} (${targetDevice.code})`}
              description={`Device Profile: ${targetDevice.deviceProfile || 'GW-500-MODBUS'} — Mô hình 4 trạng thái BR-T15 (Timeout sau 60s - BR-T35)`}
              style={{ marginBottom: 16 }}
            />

            <Form.Item
              name="method"
              label={<span style={{ fontWeight: 600 }}>Phương thức lệnh (Method RPC)</span>}
              rules={[{ required: true }]}
            >
              <Select>
                <Option value="setRelayState">setRelayState (Bật / Tắt Relay công tắc)</Option>
                <Option value="restartDevice">restartDevice (Khởi động lại thiết bị)</Option>
                <Option value="setThreshold">setThreshold (Cập nhật ngưỡng nhiệt độ)</Option>
                <Option value="triggerManualCalibration">triggerManualCalibration (Hiệu chuẩn cảm biến)</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="params"
              label={<span style={{ fontWeight: 600 }}>Tham số đầu vào (JSON Payload)</span>}
              rules={[{ required: true }]}
            >
              <Input.TextArea rows={3} placeholder='{"state": "ON", "durationSec": 300}' />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
}
