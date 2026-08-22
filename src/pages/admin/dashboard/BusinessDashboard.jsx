// Mã màn hình: MH-MA4-01 (Dashboard Kinh doanh — Financial KPIs, Revenue Growth & Contract Tracking)
import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Tag,
  Space,
  Select,
  Row,
  Col,
  Table,
  DatePicker,
  Button,
  Empty,
  Alert,
} from 'antd';
import {
  TrendingUp,
  DollarSign,
  Building2,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  PieChart,
  RotateCcw,
} from 'lucide-react';
import { dashboardService } from '../../../mock/dashboardService';
import { RevenueBarChart, DonutBreakdownChart, Sparkline } from '../../../components/charts/DashboardCharts';
import { useTheme } from '../../../theme/ThemeContext';

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;

export default function BusinessDashboard() {
  const { isDark } = useTheme();
  const [period, setPeriod] = useState('current_month'); // current_month, last_30_days, current_quarter, year_2026, custom
  const [customRange, setCustomRange] = useState(null);
  const [dateError, setDateError] = useState(null);
  const [metrics, setMetrics] = useState(dashboardService.getBusinessMetrics('current_month'));
  const [revenueHistory, setRevenueHistory] = useState(dashboardService.getRevenue12Months());
  const [planBreakdown, setPlanBreakdown] = useState(dashboardService.getPlanRevenueBreakdown());
  const [recentContracts, setRecentContracts] = useState(dashboardService.getRecentContracts());

  // Đổi khoảng thời gian
  const handlePeriodChange = (val) => {
    setPeriod(val);
    setDateError(null);
    if (val !== 'custom') {
      const data = dashboardService.getBusinessMetrics(val);
      setMetrics(data);
    }
  };

  // Xử lý chọn ngày tùy chỉnh (Validate MSG-02)
  const handleDateRangeChange = (dates) => {
    setCustomRange(dates);
    if (dates && dates[0] && dates[1]) {
      if (dates[0].isAfter(dates[1])) {
        setDateError('Ngày bắt đầu phải trước ngày kết thúc. (MSG-02)');
        return;
      }
      setDateError(null);
      const data = dashboardService.getBusinessMetrics('custom');
      setMetrics(data);
    }
  };

  // Cột bảng Hợp đồng gần đây (MH-MA4-01 — 4 cột + thông tin mở rộng)
  const contractColumns = [
    {
      title: 'Doanh nghiệp',
      dataIndex: 'company',
      key: 'company',
      render: (company, r) => (
        <div>
          <Text strong style={{ fontSize: 13 }}>{company}</Text>
          <Text type="secondary" style={{ display: 'block', fontSize: 11 }}>
            Mã HĐ: {r.contractCode}
          </Text>
        </div>
      ),
    },
    {
      title: 'Gói dịch vụ',
      dataIndex: 'plan',
      key: 'plan',
      width: 120,
      render: (plan) => {
        let color = 'blue';
        if (plan === 'Enterprise') color = 'purple';
        if (plan === 'Pro') color = 'cyan';
        if (plan === 'Custom') color = 'magenta';
        return <Tag color={color}>{plan}</Tag>;
      },
    },
    {
      title: 'Giá trị hợp đồng',
      dataIndex: 'value',
      key: 'value',
      width: 160,
      render: (val) => <Text strong style={{ color: '#0B72E7', fontSize: 13 }}>{val}</Text>,
    },
    {
      title: 'Công nợ (Chỉ đọc)',
      dataIndex: 'debt',
      key: 'debt',
      width: 140,
      render: (debt) => {
        const isDebt = debt && debt !== '0 ₫';
        return (
          <Text
            strong
            style={{
              color: isDebt ? '#DC2626' : '#16A34A',
              fontSize: 13,
            }}
          >
            {debt}
          </Text>
        );
      },
    },
    {
      title: 'Ngày ký',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      render: (d) => <Text type="secondary" style={{ fontSize: 12 }}>{d}</Text>,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header Info & Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>
            Dashboard Kinh Doanh
          </Title>
          <Text type="secondary">
            Theo dõi doanh thu định kỳ MRR/ARR, tăng trưởng kinh doanh và danh sách hợp đồng
          </Text>
        </div>

        <Space size={10} wrap>
          <Tag color="blue" style={{ fontSize: 13, padding: '4px 10px', borderRadius: 6 }}>
            MH-MA4-01
          </Tag>

          {/* STT 1: Dropdown chọn khoảng thời gian */}
          <Select
            value={period}
            onChange={handlePeriodChange}
            style={{ width: 220 }}
            options={[
              { value: 'current_month', label: 'Tháng hiện tại (Mặc định)' },
              { value: 'last_30_days', label: '30 ngày gần nhất' },
              { value: 'current_quarter', label: 'Quý này (Q3/2026)' },
              { value: 'year_2026', label: 'Cả năm 2026' },
              { value: 'custom', label: 'Tùy chỉnh khoảng thời gian...' },
            ]}
          />

          {/* Ô nhập DatePicker khi chọn Tùy chỉnh */}
          {period === 'custom' && (
            <RangePicker
              value={customRange}
              onChange={handleDateRangeChange}
              placeholder={['Từ ngày', 'Đến ngày']}
              style={{ width: 260 }}
            />
          )}
        </Space>
      </div>

      {/* Thông báo lỗi nếu chọn ngày không hợp lệ MSG-02 */}
      {dateError && (
        <Alert
          message={dateError}
          type="error"
          showIcon
          closable
          onClose={() => setDateError(null)}
        />
      )}

      {/* ================= HÀNG 4 THẺ CHỈ SỐ KPI TÀI CHÍNH ================= */}
      <Row gutter={[16, 16]}>
        {/* 1. Thẻ MRR */}
        <Col xs={24} sm={12} lg={6}>
          <Card bordered style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>
                Doanh thu định kỳ (MRR)
              </Text>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: 'rgba(11,114,231,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0B72E7',
                }}
              >
                <DollarSign size={18} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', margin: '4px 0 10px 0' }}>
              <div>
                <span style={{ fontSize: 24, fontWeight: 700, color: '#0B72E7' }}>
                  {(metrics.mrr / 1000000).toFixed(0)} triệu
                </span>
                <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
                  {metrics.mrr.toLocaleString('vi-VN')} ₫/tháng
                </Text>
              </div>
              <Sparkline
                data={[280, 310, 325, 340, 360, 375, metrics.mrr / 1000000]}
                color="#0B72E7"
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#16A34A', fontWeight: 600 }}>
              <ArrowUpRight size={16} />
              <span>+{metrics.momGrowth}% so với tháng trước</span>
            </div>
          </Card>
        </Col>

        {/* 2. Thẻ ARR */}
        <Col xs={24} sm={12} lg={6}>
          <Card bordered style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>
                Quy đổi hàng năm (ARR)
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
                <TrendingUp size={18} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', margin: '4px 0 10px 0' }}>
              <div>
                <span style={{ fontSize: 24, fontWeight: 700, color: '#8B5CF6' }}>
                  {(metrics.arr / 1000000000).toFixed(2)} tỷ
                </span>
                <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
                  {metrics.arr.toLocaleString('vi-VN')} ₫/năm
                </Text>
              </div>
              <Sparkline
                data={[3.2, 3.5, 3.8, 4.1, 4.3, 4.5, metrics.arr / 1000000000]}
                color="#8B5CF6"
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#16A34A', fontWeight: 600 }}>
              <ArrowUpRight size={16} />
              <span>+18.2% YoY (So với cùng kỳ)</span>
            </div>
          </Card>
        </Col>

        {/* 3. Thẻ Tăng trưởng MoM */}
        <Col xs={24} sm={12} lg={6}>
          <Card bordered style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>
                Tốc độ tăng trưởng MoM
              </Text>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: metrics.momGrowth >= 0 ? 'rgba(16,185,129,0.1)' : 'rgba(220,38,38,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: metrics.momGrowth >= 0 ? '#16A34A' : '#DC2626',
                }}
              >
                {metrics.momGrowth >= 0 ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', margin: '4px 0 10px 0' }}>
              <div>
                <span
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: metrics.momGrowth >= 0 ? '#16A34A' : '#DC2626',
                  }}
                >
                  {metrics.momGrowth >= 0 ? `+${metrics.momGrowth}%` : `${metrics.momGrowth}%`}
                </span>
                <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
                  Tăng trưởng tháng liên tiếp
                </Text>
              </div>
              <Sparkline
                data={[8.2, 9.5, 11.2, 10.4, 11.8, 12.5]}
                color={metrics.momGrowth >= 0 ? '#16A34A' : '#DC2626'}
              />
            </div>

            <Text type="secondary" style={{ fontSize: 12 }}>
              Thêm <strong>+{metrics.newContracts}</strong> hợp đồng mới trong kỳ
            </Text>
          </Card>
        </Col>

        {/* 4. Thẻ Tenant Active */}
        <Col xs={24} sm={12} lg={6}>
          <Card bordered style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>
                Doanh nghiệp đang hoạt động
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
                <Building2 size={18} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', margin: '4px 0 10px 0' }}>
              <div>
                <span style={{ fontSize: 24, fontWeight: 700 }}>
                  {metrics.activeTenants}
                </span>
                <span style={{ fontSize: 14, color: '#64748B', marginLeft: 4 }}>/ {metrics.totalTenants} DN</span>
                <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
                  Tenant Active Status
                </Text>
              </div>
              <Sparkline
                data={[9, 10, 11, 12, 12, 13, metrics.activeTenants]}
                color="#06B6D4"
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#16A34A' }}>
              <span>Tỷ lệ duy trì khách hàng: <strong>94.2%</strong></span>
            </div>
          </Card>
        </Col>
      </Row>

      {/* ================= HÀNG BIỂU ĐỒ DOANH THU 12 THÁNG & CƠ CẤU GÓI CƯỚC ================= */}
      <Row gutter={[16, 16]}>
        {/* Biểu đồ tăng trưởng 12 tháng */}
        <Col xs={24} lg={15}>
          <Card
            title={
              <Space size={8}>
                <TrendingUp size={18} style={{ color: '#0B72E7' }} />
                <span style={{ fontWeight: 600 }}>Tăng Trưởng Doanh Thu MRR 12 Tháng Gần Nhất</span>
              </Space>
            }
            style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', height: '100%' }}
          >
            <RevenueBarChart
              data={revenueHistory}
              xKey="month"
              yKey="revenue"
              height={250}
              barColor="#0B72E7"
            />
          </Card>
        </Col>

        {/* Biểu đồ cơ cấu doanh thu theo gói cước */}
        <Col xs={24} lg={9}>
          <Card
            title={
              <Space size={8}>
                <PieChart size={18} style={{ color: '#8B5CF6' }} />
                <span style={{ fontWeight: 600 }}>Cơ Cấu Doanh Thu Theo Gói Plan</span>
              </Space>
            }
            style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', height: '100%' }}
          >
            <div style={{ padding: '12px 0' }}>
              <DonutBreakdownChart data={planBreakdown} totalLabel="Doanh thu MRR" />
            </div>
          </Card>
        </Col>
      </Row>

      {/* ================= BẢNG DANH SÁCH 10 HỢP ĐỒNG GẦN ĐÂY ================= */}
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space size={8}>
              <FileText size={18} style={{ color: '#0B72E7' }} />
              <span style={{ fontWeight: 600 }}>Danh Sách 10 Hợp Đồng Gần Đây Nhất</span>
            </Space>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Sắp xếp theo ngày ký mới nhất
            </Text>
          </div>
        }
        style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
      >
        <Table
          dataSource={recentContracts}
          columns={contractColumns}
          rowKey="key"
          pagination={false}
          size="middle"
          bordered
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Không có dữ liệu trong khoảng thời gian đã chọn. (MSG-01)"
              />
            ),
          }}
        />
      </Card>
    </div>
  );
}
