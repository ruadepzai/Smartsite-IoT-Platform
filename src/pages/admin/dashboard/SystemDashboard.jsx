// Mã màn hình: MH-MA4-02 (Dashboard Hệ thống — IoT Network Operations Center & Real-Time Multi-Chart Console)
import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Tag,
  Space,
  Button,
  Select,
  Row,
  Col,
  Alert,
  Progress,
  Table,
  Badge,
  Tooltip,
  Segmented,
} from 'antd';
import {
  Activity,
  Server,
  Cpu,
  HardDrive,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Zap,
  Radio as RadioIcon,
  Wifi,
  Flame,
  ShieldCheck,
  Globe,
  Clock,
  PieChart,
  Terminal,
  CircleDot,
  Network,
  Share2,
} from 'lucide-react';
import { dashboardService, STATIONS } from '../../../mock/dashboardService';
import { AreaLineChart, Sparkline, DonutBreakdownChart } from '../../../components/charts/DashboardCharts';
import { useTheme } from '../../../theme/ThemeContext';

const { Title, Text, Paragraph } = Typography;

export default function SystemDashboard() {
  const { isDark } = useTheme();

  // Control States
  const [selectedStation, setSelectedStation] = useState('ALL');
  const [forceHighLoad, setForceHighLoad] = useState(false);
  const [timeRange, setTimeRange] = useState('24h'); // '24h', '7d', '30d'
  const [chartMetric, setChartMetric] = useState('throughput_ws'); // 'throughput_ws' | 'cpu_ram'

  // Data States
  const [healthData, setHealthData] = useState(dashboardService.getSystemHealth('ALL', false));
  const [timeSeries, setTimeSeries] = useState(dashboardService.getSystemTimeSeriesData('ALL', '24h', false));
  const [clusterNodes, setClusterNodes] = useState(dashboardService.getClusterNodes(false));
  const [protocolDistribution, setProtocolDistribution] = useState(dashboardService.getIotProtocolDistribution());
  const [liveEvents, setLiveEvents] = useState(dashboardService.getLiveSystemEvents());
  const [countdown, setCountdown] = useState(30);
  const [loading, setLoading] = useState(false);

  // Hàm load & đồng bộ dữ liệu
  const refreshData = (
    station = selectedStation,
    range = timeRange,
    highLoad = forceHighLoad
  ) => {
    setLoading(true);
    setTimeout(() => {
      const health = dashboardService.getSystemHealth(station, highLoad);
      const ts = dashboardService.getSystemTimeSeriesData(station, range, highLoad);
      const nodes = dashboardService.getClusterNodes(highLoad);
      const events = dashboardService.getLiveSystemEvents();

      setHealthData(health);
      setTimeSeries(ts);
      setClusterNodes(nodes);
      setLiveEvents(events);
      setCountdown(30);
      setLoading(false);
    }, 150);
  };

  // Đổi trạm
  const handleStationChange = (val) => {
    setSelectedStation(val);
    refreshData(val, timeRange, forceHighLoad);
  };

  // Đổi khoảng thời gian biểu đồ
  const handleTimeRangeChange = (val) => {
    setTimeRange(val);
    refreshData(selectedStation, val, forceHighLoad);
  };

  // Toggle giả lập tải cao
  const handleToggleHighLoad = () => {
    const nextState = !forceHighLoad;
    setForceHighLoad(nextState);
    refreshData(selectedStation, timeRange, nextState);
  };

  // BR-A09: Tự động làm mới toàn bộ số liệu mỗi 30 giây
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          refreshData(selectedStation, timeRange, forceHighLoad);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [selectedStation, timeRange, forceHighLoad]);

  // Cảnh báo đỏ BR-A10
  const isOverloaded = healthData.isCpuOverloaded || healthData.isRamOverloaded;
  let alertMessage = null;
  if (healthData.isCpuOverloaded && healthData.isRamOverloaded) {
    alertMessage = 'CẢNH BÁO: CPU và RAM đang vượt ngưỡng cho phép (CPU > 80%, RAM > 85%) — Hãy kiểm tra tải hệ thống ngay lập tức! (MSG-03, BR-A10)';
  } else if (healthData.isCpuOverloaded) {
    alertMessage = 'CẢNH BÁO: CPU vượt ngưỡng 80% — Kiểm tra các luồng xử lý và tải hệ thống. (MSG-01, BR-A10)';
  } else if (healthData.isRamOverloaded) {
    alertMessage = 'CẢNH BÁO: RAM vượt ngưỡng 85% — Kiểm tra rò rỉ bộ nhớ hoặc nâng cấp tài nguyên. (MSG-02, BR-A10)';
  }

  // Cột bảng Cluster Nodes (Fix căn chỉnh Tag icon thẳng hàng chuẩn xác)
  const nodeColumns = [
    {
      title: 'Trạm / Node Hạ tầng',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <div>
          <Text strong style={{ fontSize: 13 }}>{name}</Text>
          <Text type="secondary" style={{ display: 'block', fontSize: 11 }}>
            IP: {record.ip} • Vị trí: {record.location}
          </Text>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status) => {
        if (status === 'Mất kết nối') {
          return (
            <Tag
              color="error"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '2px 8px',
                borderRadius: 6,
                fontWeight: 500,
              }}
            >
              <AlertTriangle size={13} style={{ flexShrink: 0 }} />
              <span>Mất kết nối</span>
            </Tag>
          );
        }
        if (status === 'Cảnh báo tải cao') {
          return (
            <Tag
              color="warning"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '2px 8px',
                borderRadius: 6,
                fontWeight: 500,
              }}
            >
              <Flame size={13} style={{ flexShrink: 0 }} />
              <span>Tải cao</span>
            </Tag>
          );
        }
        return (
          <Tag
            color="success"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '2px 8px',
              borderRadius: 6,
              fontWeight: 500,
            }}
          >
            <CheckCircle2 size={13} style={{ flexShrink: 0 }} />
            <span>Hoạt động</span>
          </Tag>
        );
      },
    },
    {
      title: 'Tải CPU',
      dataIndex: 'cpu',
      key: 'cpu',
      width: 130,
      render: (cpu) => (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 2 }}>
            <span style={{ fontWeight: 600, color: cpu > 80 ? '#DC2626' : undefined }}>{cpu}%</span>
          </div>
          <Progress
            percent={cpu}
            size="small"
            showInfo={false}
            status={cpu > 80 ? 'exception' : 'normal'}
            strokeColor={cpu > 80 ? '#DC2626' : '#0B72E7'}
          />
        </div>
      ),
    },
    {
      title: 'Tải RAM',
      dataIndex: 'ram',
      key: 'ram',
      width: 130,
      render: (ram) => (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 2 }}>
            <span style={{ fontWeight: 600, color: ram > 85 ? '#DC2626' : undefined }}>{ram}%</span>
          </div>
          <Progress
            percent={ram}
            size="small"
            showInfo={false}
            status={ram > 85 ? 'exception' : 'normal'}
            strokeColor={ram > 85 ? '#DC2626' : '#10B981'}
          />
        </div>
      ),
    },
    {
      title: 'Lưu lượng',
      dataIndex: 'throughput',
      key: 'throughput',
      width: 120,
      render: (tp) => <Text strong style={{ fontSize: 12 }}>{tp}</Text>,
    },
    {
      title: 'Độ trễ Ping',
      dataIndex: 'latency',
      key: 'latency',
      width: 110,
      render: (lat) => (
        <Text style={{ fontSize: 12, color: lat === 'Timeout' ? '#DC2626' : '#16A34A', fontWeight: 600 }}>
          {lat}
        </Text>
      ),
    },
    {
      title: 'Gateway Online',
      dataIndex: 'gateways',
      key: 'gateways',
      width: 130,
      render: (gw) => <Text style={{ fontSize: 12 }}>{gw}</Text>,
    },
    {
      title: 'Thời gian hoạt động (Uptime)',
      dataIndex: 'uptime',
      key: 'uptime',
      width: 160,
      render: (ut) => <Text type="secondary" style={{ fontSize: 12 }}>{ut}</Text>,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* ================= COMMAND CENTER TOP BAR ================= */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Space size={8} align="center">
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: isOverloaded ? '#DC2626' : !healthData.isOnline ? '#D97706' : '#16A34A',
                boxShadow: isOverloaded
                  ? '0 0 10px #DC2626'
                  : !healthData.isOnline
                  ? '0 0 10px #D97706'
                  : '0 0 10px #16A34A',
              }}
            />
            <Title level={4} style={{ margin: 0 }}>
              Trung Tâm Điều Hành Hạ Tầng & Sức Khỏe Hệ Thống (NOC)
            </Title>
          </Space>
          <Text type="secondary" style={{ display: 'block', fontSize: 12, marginTop: 2 }}>
            Giám sát thời gian thực sức khỏe máy chủ, lưu lượng Throughput và kết nối Gateway toàn quốc
          </Text>
        </div>

        {/* Action Controls */}
        <Space size={10} wrap>
          <Tag color="blue" style={{ fontSize: 13, padding: '4px 10px', borderRadius: 6 }}>
            MH-MA4-02
          </Tag>

          {/* STT 1: Dropdown Chọn trạm */}
          <Select
            value={selectedStation}
            onChange={handleStationChange}
            style={{ width: 260 }}
            options={STATIONS}
          />

          {/* STT 2: Nút Làm mới & Countdown 30s (BR-A09) */}
          <Tooltip title="Hệ thống tự động làm mới số liệu mỗi 30 giây (BR-A09)">
            <Button
              icon={<RefreshCw size={14} className={loading ? 'animate-spin' : ''} />}
              onClick={() => refreshData()}
              loading={loading}
              style={{ borderRadius: 8 }}
            >
              Làm mới ({countdown}s)
            </Button>
          </Tooltip>

          {/* Nút giả lập tải cao để kiểm thử cảnh báo đỏ BR-A10 */}
          <Button
            type={forceHighLoad ? 'primary' : 'default'}
            danger={forceHighLoad}
            icon={<Flame size={14} />}
            onClick={handleToggleHighLoad}
            style={{ borderRadius: 8 }}
          >
            {forceHighLoad ? 'Tắt mô phỏng tải cao' : 'Mô phỏng tải cao (>80%)'}
          </Button>
        </Space>
      </div>

      {/* ================= THÔNG BÁO CẢNH BÁO ĐỎ GỘP (BR-A10 / MSG-01,02,03) ================= */}
      {isOverloaded && (
        <Alert
          message={alertMessage}
          type="error"
          showIcon
          icon={<AlertTriangle size={22} style={{ color: '#DC2626' }} />}
          style={{
            borderRadius: 8,
            backgroundColor: isDark ? '#450A0A' : '#FEF2F2',
            border: '1px solid #DC2626',
          }}
        />
      )}

      {/* Thông báo Mất kết nối khi chọn trạm HP (EF-01 / MSG-04) */}
      {!healthData.isOnline && (
        <Alert
          message="Trạm Hải Phòng (HP-EDGE-01) hiện đang mất kết nối / Không có phản hồi dữ liệu. Hãy kiểm tra đường truyền mạng vật lý hoặc nguồn cấp tại trạm! (MSG-04, EF-01)"
          type="warning"
          showIcon
          icon={<AlertTriangle size={22} style={{ color: '#D97706' }} />}
          style={{
            borderRadius: 8,
            backgroundColor: isDark ? '#451A03' : '#FFFBEB',
            border: '1px solid #D97706',
          }}
        />
      )}

      {/* ================= HIGH-TECH METRIC STATUS BAR ================= */}
      <Card
        bodyStyle={{ padding: '14px 20px' }}
        style={{
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          background: isDark
            ? 'linear-gradient(90deg, #161B22 0%, #0F172A 100%)'
            : 'linear-gradient(90deg, #F8FAFC 0%, #FFFFFF 100%)',
          border: `1px solid ${isDark ? '#1E293B' : '#E2E8F0'}`,
        }}
      >
        <Row gutter={[20, 12]} align="middle">
          <Col xs={12} sm={6} md={3}>
            <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Khu vực đang xem</Text>
            <Text strong style={{ fontSize: 13, color: '#0B72E7' }}>
              {healthData.stationName}
            </Text>
          </Col>

          <Col xs={12} sm={6} md={3}>
            <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Tình trạng cụm</Text>
            <Badge
              status={healthData.isOnline ? (isOverloaded ? 'warning' : 'success') : 'error'}
              text={
                <span style={{ fontWeight: 600, fontSize: 13 }}>
                  {healthData.isOnline ? (isOverloaded ? 'Tải cao' : 'Khỏe mạnh') : 'Mất kết nối'}
                </span>
              }
            />
          </Col>

          <Col xs={12} sm={6} md={3}>
            <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Độ trễ Ping</Text>
            <Text strong style={{ fontSize: 13, color: healthData.latency === 'Timeout' ? '#DC2626' : '#16A34A' }}>
              {healthData.latency}
            </Text>
          </Col>

          <Col xs={12} sm={6} md={3}>
            <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Tỷ lệ mất gói</Text>
            <Text strong style={{ fontSize: 13 }}>
              {healthData.packetLoss}
            </Text>
          </Col>

          <Col xs={12} sm={6} md={4}>
            <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Gateway Active</Text>
            <Text strong style={{ fontSize: 13 }}>
              {healthData.activeGateways} / {healthData.totalGateways} trạm
            </Text>
          </Col>

          <Col xs={12} sm={6} md={4}>
            <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Sensors Kết nối</Text>
            <Text strong style={{ fontSize: 13 }}>
              {healthData.activeSensors?.toLocaleString()} nodes
            </Text>
          </Col>

          <Col xs={24} md={4} style={{ textAlign: 'right' }}>
            <Tag color="green" style={{ borderRadius: 6, fontWeight: 600 }}>
              Uptime: {healthData.uptime}
            </Tag>
          </Col>
        </Row>
      </Card>

      {/* ================= HÀNG 4 THẺ CHỈ SỐ KPI TẢI HẠ TẦNG ================= */}
      <Row gutter={[16, 16]}>
        {/* 1. Tải CPU Cluster */}
        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered
            style={{
              borderRadius: 12,
              borderColor: healthData.isCpuOverloaded ? '#DC2626' : undefined,
              backgroundColor: healthData.isCpuOverloaded
                ? (isDark ? '#2A0E10' : '#FEF2F2')
                : undefined,
              boxShadow: healthData.isCpuOverloaded
                ? '0 4px 14px rgba(220, 38, 38, 0.25)'
                : '0 1px 3px rgba(0,0,0,0.05)',
              transition: 'all 0.3s',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>
                Tải CPU Cluster
              </Text>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: healthData.isCpuOverloaded ? 'rgba(220,38,38,0.15)' : 'rgba(11,114,231,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: healthData.isCpuOverloaded ? '#DC2626' : '#0B72E7',
                }}
              >
                <Cpu size={18} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', margin: '4px 0 10px 0' }}>
              <div>
                <span
                  style={{
                    fontSize: 28,
                    fontWeight: 700,
                    color: healthData.isCpuOverloaded ? '#DC2626' : undefined,
                  }}
                >
                  {healthData.cpu}%
                </span>
                <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
                  Ngưỡng cảnh báo: &gt; 80%
                </Text>
              </div>
              <Sparkline
                data={[25, 30, 28, 42, 45, 50, healthData.cpu]}
                color={healthData.isCpuOverloaded ? '#DC2626' : '#0B72E7'}
              />
            </div>

            <Progress
              percent={healthData.cpu}
              showInfo={false}
              size="small"
              strokeColor={healthData.isCpuOverloaded ? '#DC2626' : '#0B72E7'}
            />
          </Card>
        </Col>

        {/* 2. Tải Bộ nhớ RAM */}
        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered
            style={{
              borderRadius: 12,
              borderColor: healthData.isRamOverloaded ? '#DC2626' : undefined,
              backgroundColor: healthData.isRamOverloaded
                ? (isDark ? '#2A0E10' : '#FEF2F2')
                : undefined,
              boxShadow: healthData.isRamOverloaded
                ? '0 4px 14px rgba(220, 38, 38, 0.25)'
                : '0 1px 3px rgba(0,0,0,0.05)',
              transition: 'all 0.3s',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>
                Tải Bộ nhớ RAM
              </Text>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: healthData.isRamOverloaded ? 'rgba(220,38,38,0.15)' : 'rgba(16,185,129,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: healthData.isRamOverloaded ? '#DC2626' : '#10B981',
                }}
              >
                <HardDrive size={18} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', margin: '4px 0 10px 0' }}>
              <div>
                <span
                  style={{
                    fontSize: 28,
                    fontWeight: 700,
                    color: healthData.isRamOverloaded ? '#DC2626' : undefined,
                  }}
                >
                  {healthData.ram}%
                </span>
                <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
                  Ngưỡng cảnh báo: &gt; 85%
                </Text>
              </div>
              <Sparkline
                data={[50, 54, 58, 62, 60, 65, healthData.ram]}
                color={healthData.isRamOverloaded ? '#DC2626' : '#10B981'}
              />
            </div>

            <Progress
              percent={healthData.ram}
              showInfo={false}
              size="small"
              strokeColor={healthData.isRamOverloaded ? '#DC2626' : '#10B981'}
            />
          </Card>
        </Col>

        {/* 3. Kết nối WebSocket */}
        <Col xs={24} sm={12} lg={6}>
          <Card bordered style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>
                Phiên WebSocket Kết nối
              </Text>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: 'rgba(6,182,212,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#06B6D4',
                }}
              >
                <Wifi size={18} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', margin: '4px 0 10px 0' }}>
              <div>
                <span style={{ fontSize: 28, fontWeight: 700 }}>
                  {healthData.wsConnections.toLocaleString()}
                </span>
                <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
                  Phiên trực tuyến theo thời gian thực
                </Text>
              </div>
              <Sparkline
                data={[10000, 11200, 12400, 13100, 14200, healthData.wsConnections]}
                color="#06B6D4"
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#16A34A' }}>
              <CheckCircle2 size={14} />
              <span>Độ trễ trung bình: <strong>{healthData.latency}</strong></span>
            </div>
          </Card>
        </Col>

        {/* 4. Throughput (Lưu lượng tin/giây) */}
        <Col xs={24} sm={12} lg={6}>
          <Card bordered style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>
                Lưu lượng Throughput
              </Text>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: 'rgba(139,92,246,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#8B5CF6',
                }}
              >
                <Zap size={18} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', margin: '4px 0 10px 0' }}>
              <div>
                <span style={{ fontSize: 28, fontWeight: 700 }}>
                  {healthData.throughput.toLocaleString()}
                </span>
                <span style={{ fontSize: 14, color: '#64748B', marginLeft: 4 }}>msg/s</span>
                <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
                  Băng thông: {healthData.bandwidth}
                </Text>
              </div>
              <Sparkline
                data={[5000, 6200, 7800, 8100, 7900, healthData.throughput]}
                color="#8B5CF6"
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#0B72E7' }}>
              <RadioIcon size={14} />
              <span>Sẵn sàng Gateway: <strong>{healthData.activeGateways}/{healthData.totalGateways}</strong> trạm</span>
            </div>
          </Card>
        </Col>
      </Row>

      {/* ================= KHỐI 2 BIỂU ĐỒ TRỰC QUAN: SÓNG TẢI THỜI GIAN THỰC & CƠ CẤU GIAO THỨC IOT ================= */}
      <Row gutter={[16, 16]}>
        {/* Biểu đồ Sóng Tải Thời Gian Thực (Area Line Chart) */}
        <Col xs={24} lg={16}>
          <Card
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <Space size={8} align="center">
                    <Activity size={18} style={{ color: '#0B72E7' }} />
                    <span style={{ fontWeight: 700, fontSize: 14 }}>
                      Biểu Đồ Sóng Tải Lưu Lượng & Tải Hạ Tầng Thời Gian Thực
                    </span>
                  </Space>
                  <Text type="secondary" style={{ display: 'block', fontSize: 11, marginTop: 2 }}>
                    Dữ liệu thời gian thực tại {healthData.stationName}
                  </Text>
                </div>

                {/* Bộ chuyển đổi Chỉ số (Metric) & Khoảng thời gian (24h/7d/30d) */}
                <Space size={8} wrap>
                  <Segmented
                    size="small"
                    value={chartMetric}
                    onChange={(val) => setChartMetric(val)}
                    options={[
                      { label: 'Throughput & WebSocket', value: 'throughput_ws' },
                      { label: 'Tải CPU & RAM (%)', value: 'cpu_ram' },
                    ]}
                  />

                  <Segmented
                    size="small"
                    value={timeRange}
                    onChange={handleTimeRangeChange}
                    options={[
                      { label: '24 Giờ', value: '24h' },
                      { label: '7 Ngày', value: '7d' },
                      { label: '30 Ngày', value: '30d' },
                    ]}
                  />
                </Space>
              </div>
            }
            style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', height: '100%' }}
          >
            {/* Legend */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 20, marginBottom: 8, fontSize: 12 }}>
              {chartMetric === 'throughput_ws' ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: '#0B72E7' }} />
                    <span style={{ fontWeight: 600 }}>Throughput (msg/s)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: '#10B981' }} />
                    <span style={{ fontWeight: 600 }}>Kết nối WebSocket (sessions)</span>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: '#DC2626' }} />
                    <span style={{ fontWeight: 600 }}>Tải CPU Cluster (%)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: '#10B981' }} />
                    <span style={{ fontWeight: 600 }}>Tải RAM Cluster (%)</span>
                  </div>
                </>
              )}
            </div>

            {/* SVG Chart */}
            <AreaLineChart
              data={timeSeries}
              xKey="time"
              yKey={chartMetric === 'throughput_ws' ? 'throughput' : 'cpu'}
              secondaryYKey={chartMetric === 'throughput_ws' ? 'wsConnections' : 'ram'}
              color={chartMetric === 'throughput_ws' ? '#0B72E7' : '#DC2626'}
              secondaryColor="#10B981"
              unit={chartMetric === 'throughput_ws' ? 'msg/s' : '%'}
              secondaryUnit={chartMetric === 'throughput_ws' ? 'sessions' : '%'}
              metricLabel={chartMetric === 'throughput_ws' ? 'Throughput' : 'Tải CPU'}
              secondaryMetricLabel={chartMetric === 'throughput_ws' ? 'WebSocket' : 'Tải RAM'}
              height={260}
            />
          </Card>
        </Col>

        {/* Biểu đồ Cơ cấu Giao thức IoT (Donut Chart) */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <Space size={8}>
                <Network size={18} style={{ color: '#8B5CF6' }} />
                <span style={{ fontWeight: 700, fontSize: 14 }}>Phân Bổ Giao Thức Kết Nối IoT</span>
              </Space>
            }
            style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', height: '100%' }}
          >
            <div style={{ padding: '14px 0' }}>
              <DonutBreakdownChart data={protocolDistribution} totalLabel="Thiết bị IoT" size={150} />
            </div>

            <div
              style={{
                marginTop: 12,
                padding: '10px 14px',
                borderRadius: 8,
                backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                border: `1px solid ${isDark ? '#1E293B' : '#E2E8F0'}`,
                fontSize: 12,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text type="secondary">Broker MQTT Cluster:</Text>
                <Text strong style={{ color: '#16A34A' }}>EMQX Cluster v5 (HA)</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">Bảo mật mã hóa:</Text>
                <Text strong>TLS 1.3 / mTLS X.509</Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* ================= BẢNG SỨC KHỎE TỪNG TRẠM & LIVE EVENT TICKER ================= */}
      <Row gutter={[16, 16]}>
        {/* Cụm máy chủ hạ tầng */}
        <Col xs={24} lg={16}>
          <Card
            title={
              <Space size={8}>
                <Server size={18} style={{ color: '#0B72E7' }} />
                <span style={{ fontWeight: 600 }}>Chi Tiết Sức Khỏe Cụm Máy Chủ & Trạm IoT Toàn Quốc</span>
              </Space>
            }
            style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', height: '100%' }}
          >
            <Table
              dataSource={clusterNodes}
              columns={nodeColumns}
              rowKey="key"
              pagination={false}
              size="middle"
              bordered
            />
          </Card>
        </Col>

        {/* Live System Events / NOC Ticker */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space size={8}>
                  <Terminal size={18} style={{ color: '#0B72E7' }} />
                  <span style={{ fontWeight: 600 }}>Nhật Ký Sự Kiện NOC Trực Tuyến</span>
                </Space>
                <Tag color="processing">Real-time</Tag>
              </div>
            }
            style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', height: '100%' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {liveEvents.map((ev) => {
                let iconColor = '#0B72E7';
                if (ev.type === 'error') iconColor = '#DC2626';
                if (ev.type === 'warning') iconColor = '#D97706';
                if (ev.type === 'success') iconColor = '#16A34A';

                return (
                  <div
                    key={ev.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10,
                      padding: '8px 10px',
                      borderRadius: 8,
                      backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                      border: `1px solid ${isDark ? '#1E293B' : '#E2E8F0'}`,
                    }}
                  >
                    <CircleDot size={14} style={{ color: iconColor, marginTop: 3, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <Text style={{ fontSize: 12, lineHeight: 1.4, display: 'block' }}>
                        {ev.text}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 10 }}>
                        {ev.time}
                      </Text>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
