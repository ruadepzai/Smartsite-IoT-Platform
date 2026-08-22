// Mã màn hình: MH-MT5-02 (Báo Cáo Thống Kê Cảnh Báo Theo Mức Độ — Tenant Portal)
// Dựa theo FN-MT5-02 & UC-MT5-02 trong SmartSite_Function_List_v9 & SmartSite_IoT_UseCase_List_v5
import React, { useState, useMemo } from 'react';
import {
  Card,
  Typography,
  Space,
  Tag,
  Button,
  Table,
  Select,
  Row,
  Col,
  DatePicker,
  Radio,
  Empty,
  Badge,
  Tooltip,
  message,
  Divider,
} from 'antd';
import {
  AlertTriangle,
  FileSpreadsheet,
  Download,
  Filter,
  User,
  ShieldAlert,
  Calendar,
  PieChart as PieChartIcon,
  Activity,
} from 'lucide-react';
import dayjs from 'dayjs';
import { DonutBreakdownChart, AreaLineChart } from '../../../components/charts/DashboardCharts';
import { useTheme } from '../../../theme/ThemeContext';

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

export default function TenantAlertSeverityReport() {
  const { isDark } = useTheme();

  // Bộ lọc thời gian mặc định 30 ngày gần nhất (BR-T31)
  const [dateRange, setDateRange] = useState([dayjs().subtract(30, 'day'), dayjs()]);
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');
  const [selectedBuilding, setSelectedBuilding] = useState('ALL');

  // Role Switcher Demo (AT-03 xem toàn bộ BR-T29 vs AT-04 chỉ xem Room được gán)
  const [currentRoleView, setCurrentRoleView] = useState('AT-03');

  // Dữ liệu sự cố tổng hợp
  const rawAlertsData = [
    {
      key: '1',
      level: 'Critical (Báo động khẩn)',
      severityCode: 'CRITICAL',
      count: 6,
      percentage: '15%',
      channels: 'SMS + Email + In-App (BR-T16)',
      escalationCount: 2, // Escalation theo 2 bước (BR-T36)
      resolvedRate: '100%',
      building: 'Nhà ga Hành khách T2 (Quốc tế)',
      room: 'Phòng Server Cảng Hàng không (RM-302)',
      sampleDesc: 'Nhiệt độ phòng Server vượt 28.5°C; Áp suất bơm tụt 2.1 bar',
    },
    {
      key: '2',
      level: 'Warning (Cảnh báo thông số)',
      severityCode: 'WARNING',
      count: 14,
      percentage: '35%',
      channels: 'Email + In-App (BR-T16)',
      escalationCount: 0,
      resolvedRate: '92.8%',
      building: 'Nhà ga Hàng hóa ALS Cargo',
      room: 'Kho Lạnh Âm sâu -20°C (RM-C01)',
      sampleDesc: 'Kho lạnh ALS nhiệt độ âm giảm (-14.8°C); Dòng điện pha A chiller cao (52A)',
    },
    {
      key: '3',
      level: 'Info (Thông tin hệ thống)',
      severityCode: 'INFO',
      count: 20,
      percentage: '50%',
      channels: 'In-App (BR-T16)',
      escalationCount: 0,
      resolvedRate: '100%',
      building: 'Nhà ga Hành khách T2 (Quốc tế)',
      room: 'Phòng Kỹ thuật Điện & HVAC Trung tâm (RM-101)',
      sampleDesc: 'Gateway GW-NB-001 tự động đồng bộ 24 thiết bị; Chu kỳ bảo dưỡng định kỳ',
    },
  ];

  // Lọc dữ liệu theo vai trò và bộ lọc
  const filteredTable = useMemo(() => {
    return rawAlertsData.filter((item) => {
      // Phân quyền AT-04 (BR-T29)
      if (currentRoleView === 'AT-04') {
        const userAssignedRooms = [
          'Phòng Server Cảng Hàng không (RM-302)',
          'Phòng Kỹ thuật Điện & HVAC Trung tâm (RM-101)',
        ];
        if (!userAssignedRooms.includes(item.room)) return false;
      }

      if (selectedSeverity !== 'ALL' && item.severityCode !== selectedSeverity) return false;
      if (selectedBuilding !== 'ALL' && item.building !== selectedBuilding) return false;

      return true;
    });
  }, [rawAlertsData, currentRoleView, selectedSeverity, selectedBuilding]);

  // Dữ liệu biểu đồ tròn Donut
  const alertBreakdown = useMemo(() => {
    const totalCount = filteredTable.reduce((acc, cur) => acc + cur.count, 0);
    if (totalCount === 0) return [];
    return filteredTable.map((item) => {
      let color = '#0B72E7';
      if (item.severityCode === 'CRITICAL') color = '#DC2626';
      if (item.severityCode === 'WARNING') color = '#F59E0B';
      return {
        name: item.level,
        percentage: Math.round((item.count / totalCount) * 100),
        color,
        detail: `${item.count} sự cố`,
      };
    });
  }, [filteredTable]);

  // Xu hướng theo tuần (30 ngày gần nhất)
  const trendData = [
    { time: 'Tuần 1', throughput: 2, wsConnections: 4 },
    { time: 'Tuần 2', throughput: 1, wsConnections: 3 },
    { time: 'Tuần 3', throughput: 2, wsConnections: 5 },
    { time: 'Tuần 4', throughput: 1, wsConnections: 2 },
  ];

  // Xuất file Excel (.xlsx) — Không giới hạn số dòng (BR-T40)
  const handleExportExcel = () => {
    if (filteredTable.length === 0) {
      message.warning('Không có cảnh báo trong khoảng thời gian đã chọn. (EF-01)');
      return;
    }
    const fromDate = dateRange[0].format('DD-MM-YYYY');
    const toDate = dateRange[1].format('DD-MM-YYYY');
    message.loading('Đang khởi tạo file Excel báo cáo...', 0.6);
    setTimeout(() => {
      message.success(`Đã xuất báo cáo thành công: Bao_cao_thong_ke_canh_bao_${fromDate}_${toDate}.xlsx (Định dạng Excel .xlsx — BR-T40)`);
    }, 600);
  };

  // Giới hạn DatePicker không cho chọn ngoài 12 tháng lưu trữ (BR-T39 / NFR-T06)
  const disabledDate = (current) => {
    if (!current) return false;
    const maxPastDate = dayjs().subtract(12, 'month');
    const today = dayjs();
    return current.isBefore(maxPastDate, 'day') || current.isAfter(today, 'day');
  };

  const columns = [
    {
      title: 'Mức Độ Cảnh Báo',
      dataIndex: 'level',
      key: 'level',
      render: (lvl, r) => {
        let color = 'blue';
        if (r.severityCode === 'CRITICAL') color = 'error';
        if (r.severityCode === 'WARNING') color = 'warning';
        return <Tag color={color} style={{ fontWeight: 700, fontSize: 12 }}>{lvl}</Tag>;
      },
    },
    {
      title: 'Số Lượng Phát Sinh',
      dataIndex: 'count',
      key: 'count',
      width: 150,
      render: (c) => <strong>{c} sự cố</strong>,
    },
    {
      title: 'Tỷ Trọng %',
      dataIndex: 'percentage',
      key: 'percentage',
      width: 120,
      render: (p) => <span style={{ fontWeight: 600 }}>{p}</span>,
    },
    {
      title: 'Kênh Gửi Mặc Định (BR-T16)',
      dataIndex: 'channels',
      key: 'channels',
      render: (ch) => <Tag color="purple">{ch}</Tag>,
    },
    {
      title: 'Escalation Tự Động (BR-T28 / BR-T36)',
      dataIndex: 'escalationCount',
      key: 'escalationCount',
      width: 200,
      render: (ec) =>
        ec > 0 ? (
          <Tooltip title="Tự động escalation 2 bước: phút 5 nhắc lại, phút 7 báo toàn bộ Admin (BR-T36)">
            <Tag color="error">{ec} lần kích hoạt Escalation</Tag>
          </Tooltip>
        ) : (
          <Text type="secondary">0</Text>
        ),
    },
    {
      title: 'Tỷ Lệ Đã Khắc Phục',
      dataIndex: 'resolvedRate',
      key: 'resolvedRate',
      width: 160,
      render: (rr) => <Badge status="success" text={<span style={{ fontWeight: 600 }}>{rr} hoàn tất</span>} />,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header trang */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Space size={8} align="center">
            <ShieldAlert size={24} style={{ color: '#DC2626' }} />
            <Title level={4} style={{ margin: 0 }}>
              Báo Cáo Thống Kê Cảnh Báo Theo Mức Độ
            </Title>
          </Space>
          <Text type="secondary" style={{ fontSize: 13, display: 'block', marginTop: 2 }}>
            Đánh giá phân bố mức độ nghiêm trọng (Critical/Warning/Info), tần suất kích hoạt escalation và tỷ lệ giải quyết sự cố (MH-MT5-02)
          </Text>
        </div>

        <Space>
          <Tag color="blue" style={{ fontSize: 13, padding: '4px 10px', borderRadius: 6 }}>
            MH-MT5-02
          </Tag>
          <Button
            type="primary"
            icon={<FileSpreadsheet size={16} />}
            onClick={handleExportExcel}
            disabled={filteredTable.length === 0}
            style={{ backgroundColor: '#059669', borderColor: '#059669', borderRadius: 8, height: 38 }}
          >
            Xuất Báo Cáo Excel (.xlsx — BR-T40)
          </Button>
        </Space>
      </div>

      {/* Biểu đồ Phân Bố & Xu Hướng Sự Cố */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={10}>
          <Card
            title={
              <Space>
                <PieChartIcon size={16} style={{ color: '#0B72E7' }} />
                <span>Tỷ Trọng Cảnh Báo Theo Mức Độ (30 Ngày Qua)</span>
              </Space>
            }
            style={{ borderRadius: 12, height: '100%' }}
          >
            <div style={{ height: 260 }}>
              <DonutBreakdownChart data={alertBreakdown} centerText="Tổng sự cố" centerValue="40" />
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={14}>
          <Card
            title={
              <Space>
                <Activity size={16} style={{ color: '#DC2626' }} />
                <span>Xu Hướng Sự Cố Phát Sinh Theo Tuần (BR-T31)</span>
              </Space>
            }
            style={{ borderRadius: 12 }}
          >
            <div style={{ height: 260 }}>
              <AreaLineChart
                data={trendData}
                xKey="time"
                lines={[
                  { key: 'throughput', name: 'Critical (Khẩn cấp)', color: '#DC2626' },
                  { key: 'wsConnections', name: 'Warning (Cảnh báo)', color: '#F59E0B' },
                ]}
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Bảng Bộ Lọc & Chi Tiết Số Liệu */}
      <Card style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <Row gutter={[16, 16]} align="middle" justify="space-between">
          <Col xs={24} lg={12}>
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
                  <Radio.Button value="AT-04">User (Room gán — BR-T29)</Radio.Button>
                </Radio.Group>
              </div>

              {/* DatePicker mặc định 30 ngày (BR-T31) + chặn ngoài 12 tháng (BR-T39) */}
              <RangePicker
                value={dateRange}
                onChange={setDateRange}
                disabledDate={disabledDate}
                format="DD/MM/YYYY"
                style={{ width: 250 }}
              />
            </Space>
          </Col>

          <Col xs={24} lg={12}>
            <Space wrap style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Select
                value={selectedSeverity}
                onChange={setSelectedSeverity}
                style={{ width: 180 }}
              >
                <Option value="ALL">Tất cả mức độ</Option>
                <Option value="CRITICAL">🔴 Critical (Khẩn cấp)</Option>
                <Option value="WARNING">🟡 Warning (Cảnh báo)</Option>
                <Option value="INFO">🔵 Info (Thông tin)</Option>
              </Select>

              <Select
                value={selectedBuilding}
                onChange={setSelectedBuilding}
                style={{ width: 220 }}
              >
                <Option value="ALL">Toàn bộ Tòa nhà / Cơ sở</Option>
                <Option value="Nhà ga Hành khách T2 (Quốc tế)">Nhà ga T2 Nội Bài</Option>
                <Option value="Nhà ga Quốc nội T1">Nhà ga T1 TSN</Option>
                <Option value="Nhà ga Hàng hóa ALS Cargo">Kho Hàng Hóa ALS</Option>
              </Select>
            </Space>
          </Col>
        </Row>

        <Divider style={{ margin: '16px 0' }} />

        {filteredTable.length === 0 ? (
          <Empty
            description="Không có cảnh báo trong khoảng thời gian đã chọn. (EF-01)"
            style={{ padding: '40px 0' }}
          />
        ) : (
          <Table
            dataSource={filteredTable}
            columns={columns}
            rowKey="key"
            pagination={false}
            bordered
            size="middle"
          />
        )}
      </Card>
    </div>
  );
}
