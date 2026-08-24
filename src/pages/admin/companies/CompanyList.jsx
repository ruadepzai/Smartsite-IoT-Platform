// Mã màn hình: MH-MA2-01 (Danh sách Tenant / Doanh nghiệp)
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Typography,
  Tag,
  Space,
  Button,
  Table,
  Input,
  Select,
  Badge,
  Empty,
  Row,
  Col,
  Tooltip,
} from 'antd';
import {
  Building2,
  Plus,
  Eye,
  Edit,
  Search,
  RotateCcw,
} from 'lucide-react';
import { tenantService } from '../../../mock/tenantService';
import { INDUSTRY_TYPES, TENANT_STATUSES } from '../../../mock/tenantData';

const { Title, Text } = Typography;

export default function CompanyList() {
  const navigate = useNavigate();

  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(false);

  // State tìm kiếm & bộ lọc
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterIndustry, setFilterIndustry] = useState('all');

  // Phân trang 10 bản ghi/trang theo BR-A21
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Load danh sách Doanh nghiệp
  const loadTenants = () => {
    setLoading(true);
    setTimeout(() => {
      const data = tenantService.getTenants();
      setTenants(data);
      setLoading(false);
    }, 150);
  };

  useEffect(() => {
    loadTenants();
  }, []);

  // Debounce tìm kiếm ~300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchText);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchText]);

  // Lọc dữ liệu theo từ khóa (tên hoặc MST), trạng thái, loại hình
  const filteredTenants = useMemo(() => {
    return tenants.filter((tenant) => {
      // 1. Tìm theo tên hoặc mã số thuế
      const term = debouncedSearch.trim().toLowerCase();
      const matchSearch =
        !term ||
        (tenant.name && tenant.name.toLowerCase().includes(term)) ||
        (tenant.taxCode && tenant.taxCode.toLowerCase().includes(term));

      // 2. Lọc theo trạng thái
      const matchStatus =
        filterStatus === 'all' || tenant.status === filterStatus;

      // 3. Lọc theo loại hình
      const matchIndustry =
        filterIndustry === 'all' || tenant.industry === filterIndustry;

      return matchSearch && matchStatus && matchIndustry;
    });
  }, [tenants, debouncedSearch, filterStatus, filterIndustry]);

  // Cấu hình cột bảng theo đặc tả MH-MA2-01 (8 cột)
  const columns = [
    {
      title: 'Doanh nghiệp',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      render: (name, record) => (
        <div>
          <Text strong style={{ display: 'block', fontSize: 13 }}>
            {name}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Mã: {record.id}
          </Text>
        </div>
      ),
    },
    {
      title: 'Mã số thuế',
      dataIndex: 'taxCode',
      key: 'taxCode',
      width: 130,
      render: (taxCode) => (
        <Text style={{ fontFamily: 'monospace', fontSize: 13 }}>
          {taxCode || '—'}
        </Text>
      ),
    },
    {
      title: 'Loại hình',
      dataIndex: 'industry',
      key: 'industry',
      width: 120,
      render: (industry) => (
        <Text style={{ fontSize: 13 }}>
          {industry || '—'}
        </Text>
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
        if (plan === 'Custom' || plan === 'Tùy chỉnh') color = 'magenta';
        return <Tag color={color} style={{ fontWeight: 500 }}>{plan}</Tag>;
      },
    },
    {
      title: 'Thiết bị',
      key: 'devices',
      width: 140,
      render: (_, record) => {
        const used = record.used_devices || 0;
        const max = record.max_devices || 0;
        const pct = max > 0 ? Math.round((used / max) * 100) : 0;
        const isNearLimit = pct >= 80;
        return (
          <div>
            <Text strong style={{ fontSize: 13 }}>
              {used} / {max}
            </Text>
            <span
              style={{
                fontSize: 12,
                marginLeft: 4,
                color: isNearLimit ? '#D97706' : '#64748B',
                fontWeight: isNearLimit ? 600 : 400,
              }}
            >
              ({pct}%)
            </span>
          </div>
        );
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 110,
      render: (createdAt) => (
        <Text type="secondary" style={{ fontSize: 13 }}>
          {createdAt}
        </Text>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status) => {
        const found = TENANT_STATUSES.find((s) => s.value === status);
        const badgeStatus = found?.badgeStatus || 'default';
        const color =
          status === 'Đang hoạt động'
            ? '#16A34A'
            : status === 'Dùng thử'
            ? '#D97706'
            : status === 'Tạm ngưng'
            ? '#DC2626'
            : '#64748B';
        return (
          <Badge
            status={badgeStatus}
            text={
              <span style={{ color, fontWeight: 600, fontSize: 13 }}>
                {status}
              </span>
            }
          />
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 90,
      align: 'center',
      render: (_, record) => (
        <Space size={4}>
          <Tooltip title="Xem chi tiết (MH-MA2-03)">
            <Button
              type="text"
              size="small"
              icon={<Eye size={16} />}
              onClick={() => navigate(`/admin/companies/${record.id}`)}
              style={{ color: '#0B72E7' }}
            />
          </Tooltip>
          <Tooltip title="Sửa Doanh nghiệp (MH-MA2-04)">
            <Button
              type="text"
              size="small"
              icon={<Edit size={16} />}
              onClick={() => navigate(`/admin/companies/${record.id}/edit`)}
              style={{ color: '#0B72E7' }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>
            Danh sách Tenant
          </Title>
          <Text type="secondary">
            Quản lý hồ sơ pháp nhân, thông tin liên hệ và trạng thái hoạt động của doanh nghiệp
          </Text>
        </div>
        <Space>
          <Tag color="blue" style={{ fontSize: 13, padding: '4px 10px', borderRadius: 6 }}>
            MH-MA2-01
          </Tag>
          <Button
            type="primary"
            icon={<Plus size={16} />}
            onClick={() => navigate('/admin/companies/new')}
            style={{ backgroundColor: '#0B72E7', borderRadius: 8, fontWeight: 500 }}
          >
            Tạo Tenant mới
          </Button>
        </Space>
      </div>

      {/* Main Content Card */}
      <Card style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        {/* Toolbar: Search + Filters (Item 2, 3, 4) */}
        <div style={{ marginBottom: 18 }}>
          <Row gutter={[12, 12]} align="middle">
            {/* STT 2: Tìm theo tên doanh nghiệp, mã số thuế */}
            <Col xs={24} md={12} lg={10}>
              <Input
                placeholder="Tìm theo tên doanh nghiệp, mã số thuế..."
                prefix={<Search size={16} style={{ color: '#94A3B8', marginRight: 4 }} />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
                maxLength={100}
              />
            </Col>

            {/* STT 3: Dropdown Lọc Trạng thái */}
            <Col xs={12} md={6} lg={5}>
              <Select
                value={filterStatus}
                onChange={(val) => {
                  setFilterStatus(val);
                  setCurrentPage(1);
                }}
                style={{ width: '100%' }}
                options={[
                  { value: 'all', label: 'Trạng thái: Tất cả' },
                  ...TENANT_STATUSES.map((s) => ({
                    value: s.value,
                    label: s.label,
                  })),
                ]}
              />
            </Col>

            {/* STT 4: Dropdown Lọc Loại hình */}
            <Col xs={12} md={6} lg={5}>
              <Select
                value={filterIndustry}
                onChange={(val) => {
                  setFilterIndustry(val);
                  setCurrentPage(1);
                }}
                style={{ width: '100%' }}
                options={[
                  { value: 'all', label: 'Loại hình: Tất cả' },
                  ...INDUSTRY_TYPES.map((i) => ({
                    value: i.value,
                    label: i.label,
                  })),
                ]}
              />
            </Col>

            {/* Reset filters */}
            <Col xs={24} lg={4} style={{ textAlign: 'right' }}>
              <Button
                type="text"
                size="small"
                icon={<RotateCcw size={14} />}
                onClick={() => {
                  setSearchText('');
                  setFilterStatus('all');
                  setFilterIndustry('all');
                  setCurrentPage(1);
                }}
              >
                Xóa bộ lọc
              </Button>
            </Col>
          </Row>
        </div>

        {/* Table: 8 columns + 10 items/page (BR-A21) */}
        <Table
          dataSource={filteredTenants}
          columns={columns}
          rowKey="id"
          loading={loading}
          bordered
          size="middle"
          scroll={{ x: 900 }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: filteredTenants.length,
            onChange: (page) => setCurrentPage(page),
            showTotal: (total, range) => (
              <span style={{ fontSize: 13 }}>
                Trang {currentPage}/{Math.ceil(total / pageSize) || 1} · {total} Doanh nghiệp · 10 bản ghi/trang (BR-A21)
              </span>
            ),
          }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Không tìm thấy Doanh nghiệp phù hợp. (MSG-01)"
              />
            ),
          }}
        />
      </Card>
    </div>
  );
}
