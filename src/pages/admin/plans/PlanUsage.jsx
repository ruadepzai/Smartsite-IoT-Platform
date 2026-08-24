// Mã màn hình: MH-MA3-02 (Theo dõi mức sử dụng hạn mức)
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Card,
  Typography,
  Tag,
  Space,
  Button,
  Table,
  Input,
  Select,
  Progress,
  Badge,
  Row,
  Col,
  Empty,
  Tooltip,
} from 'antd';
import {
  Gauge,
  Search,
  Filter,
  ArrowUpDown,
  RotateCcw,
  Building2,
  ExternalLink,
  Cpu,
  Users,
} from 'lucide-react';
import { planService } from '../../../mock/planService';

const { Title, Text, Paragraph } = Typography;

export default function PlanUsage() {
  const navigate = useNavigate();
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters & Search
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('all'); // all, green, yellow, red
  const [sortOption, setSortOption] = useState('highest_pct'); // highest_pct, lowest_pct, name_az

  const loadData = () => {
    setLoading(true);
    setTimeout(() => {
      const data = planService.getUsageReport();
      setReportData(data);
      setLoading(false);
    }, 150);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Debounce search ~300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchText]);

  // Lọc và sắp xếp dữ liệu
  const filteredAndSortedData = useMemo(() => {
    let result = reportData.filter((item) => {
      // 1. Tìm kiếm theo tên hoặc mã thuế
      const term = debouncedSearch.trim().toLowerCase();
      const matchSearch =
        !term ||
        item.name.toLowerCase().includes(term) ||
        (item.taxCode && item.taxCode.toLowerCase().includes(term));

      // 2. Lọc theo mức độ rủi ro (BR-A23)
      let matchRisk = true;
      if (riskFilter === 'green') matchRisk = item.colorLevel === 'green';
      if (riskFilter === 'yellow') matchRisk = item.colorLevel === 'yellow';
      if (riskFilter === 'red') matchRisk = item.colorLevel === 'red';

      return matchSearch && matchRisk;
    });

    // Sắp xếp
    if (sortOption === 'highest_pct') {
      result.sort((a, b) => b.maxPct - a.maxPct);
    } else if (sortOption === 'lowest_pct') {
      result.sort((a, b) => a.maxPct - b.maxPct);
    } else if (sortOption === 'name_az') {
      result.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
    }

    return result;
  }, [reportData, debouncedSearch, riskFilter, sortOption]);

  // Cột bảng theo đặc tả MH-MA3-02
  const columns = [
    {
      title: 'Doanh nghiệp',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      render: (name, record) => (
        <div>
          <Link
            to={`/admin/companies/${record.id}`}
            style={{ fontWeight: 600, fontSize: 13, color: '#0B72E7', display: 'inline-flex', alignItems: 'center', gap: 4 }}
          >
            <span>{name}</span>
            <ExternalLink size={12} />
          </Link>
          <Text type="secondary" style={{ display: 'block', fontSize: 11 }}>
            Mã: {record.id}
          </Text>
        </div>
      ),
    },
    {
      title: 'Gói đang dùng',
      dataIndex: 'plan',
      key: 'plan',
      width: 120,
      render: (plan) => {
        let tagColor = 'blue';
        if (plan === 'Enterprise') tagColor = 'purple';
        if (plan === 'Pro') tagColor = 'cyan';
        if (plan === 'Custom' || plan === 'Tùy chỉnh') tagColor = 'magenta';
        return <Tag color={tagColor}>{plan}</Tag>;
      },
    },
    {
      title: 'Thiết bị & Tiến độ',
      key: 'devices',
      width: 200,
      render: (_, r) => (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
            <span style={{ fontSize: 12 }}>
              <strong>{r.used_devices}</strong> / {r.max_devices} thiết bị
            </span>
            <span style={{ fontSize: 12, fontWeight: 600, color: r.strokeColor }}>
              {r.devicePct}%
            </span>
          </div>
          {/* Progress bar đồng bộ màu sắc theo BR-A23 */}
          <Progress
            percent={r.devicePct}
            strokeColor={r.strokeColor}
            size="small"
            showInfo={false}
          />
        </div>
      ),
    },
    {
      title: 'Người dùng & Tiến độ',
      key: 'users',
      width: 200,
      render: (_, r) => (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
            <span style={{ fontSize: 12 }}>
              <strong>{r.used_users}</strong> / {r.max_users} tài khoản
            </span>
            <span style={{ fontSize: 12, fontWeight: 600, color: r.strokeColor }}>
              {r.userPct}%
            </span>
          </div>
          {/* Progress bar đồng bộ màu sắc theo BR-A23 */}
          <Progress
            percent={r.userPct}
            strokeColor={r.strokeColor}
            size="small"
            showInfo={false}
          />
        </div>
      ),
    },
    {
      title: 'Cảnh báo hạn mức (BR-A23)',
      key: 'riskLabel',
      width: 170,
      render: (_, r) => {
        const badgeStatus =
          r.colorLevel === 'green'
            ? 'success'
            : r.colorLevel === 'yellow'
            ? 'warning'
            : 'error';

        return (
          <Badge
            status={badgeStatus}
            text={
              <span style={{ color: r.strokeColor, fontWeight: 600, fontSize: 12 }}>
                {r.riskLabel}
              </span>
            }
          />
        );
      },
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>
            Theo dõi mức sử dụng hạn mức
          </Title>
          <Text type="secondary">
            Giám sát tỷ lệ tiêu thụ tài nguyên theo thời gian thực và cảnh báo các doanh nghiệp sắp chạm ngưỡng
          </Text>
        </div>
        <Tag color="blue" style={{ fontSize: 13, padding: '4px 10px', borderRadius: 6 }}>
          MH-MA3-02
        </Tag>
      </div>

      {/* Main Content Card */}
      <Card style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        {/* Toolbar: Bộ lọc & Sắp xếp */}
        <div style={{ marginBottom: 18 }}>
          <Row gutter={[12, 12]} align="middle">
            <Col xs={24} md={10}>
              <Input
                placeholder="Tìm theo tên Doanh nghiệp hoặc Mã số thuế..."
                prefix={<Search size={16} style={{ color: '#94A3B8', marginRight: 4 }} />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </Col>

            {/* STT 1: Icon / Dropdown Lọc theo mức độ sử dụng (BR-A23: Sắp vượt >=80%, Đã vượt >=100%) */}
            <Col xs={12} md={6}>
              <Select
                value={riskFilter}
                onChange={(val) => setRiskFilter(val)}
                style={{ width: '100%' }}
                options={[
                  { value: 'all', label: 'Tất cả mức độ sử dụng' },
                  { value: 'red', label: '🔴 Đã vượt hạn mức (≥100%)' },
                  { value: 'yellow', label: '🟡 Sắp vượt hạn mức (80% - 99%)' },
                  { value: 'green', label: '🟢 Bình thường (<80%)' },
                ]}
              />
            </Col>

            {/* STT 2: Dropdown Sắp xếp (% cao nhất mặc định) */}
            <Col xs={12} md={5}>
              <Select
                value={sortOption}
                onChange={(val) => setSortOption(val)}
                style={{ width: '100%' }}
                options={[
                  { value: 'highest_pct', label: 'Sắp xếp: % cao nhất' },
                  { value: 'lowest_pct', label: 'Sắp xếp: % thấp nhất' },
                  { value: 'name_az', label: 'Sắp xếp: Tên A-Z' },
                ]}
              />
            </Col>

            {/* Xóa bộ lọc */}
            <Col xs={24} md={3} style={{ textAlign: 'right' }}>
              <Button
                type="text"
                size="small"
                icon={<RotateCcw size={14} />}
                onClick={() => {
                  setSearchText('');
                  setRiskFilter('all');
                  setSortOption('highest_pct');
                }}
              >
                Xóa bộ lọc
              </Button>
            </Col>
          </Row>
        </div>

        {/* Bảng dữ liệu theo dõi */}
        <Table
          dataSource={filteredAndSortedData}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showTotal: (total) => (
              <span style={{ fontSize: 13 }}>
                Tổng cộng {total} Doanh nghiệp
              </span>
            ),
          }}
          bordered
          size="middle"
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Không có Doanh nghiệp phù hợp. (MSG-01)"
              />
            ),
          }}
        />
      </Card>
    </div>
  );
}
