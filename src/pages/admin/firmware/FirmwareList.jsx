// Mã màn hình: MH-MA5-01 (Danh sách gói Firmware OTA)
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
  Modal,
  Progress,
  Tooltip,
  Row,
  Col,
  Empty,
  message,
} from 'antd';
import {
  HardDriveDownload,
  Upload,
  Search,
  Filter,
  RotateCcw,
  Edit,
  Trash2,
  AlertTriangle,
  FileCode,
  Layers,
  Cpu,
  Building2,
  CheckCircle2,
  Globe,
} from 'lucide-react';
import { firmwareService, COMPATIBLE_MODELS } from '../../../mock/firmwareService';
import { tenantService } from '../../../mock/tenantService';
import { useTheme } from '../../../theme/ThemeContext';

const { Title, Text, Paragraph } = Typography;

export default function FirmwareList() {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const [firmwares, setFirmwares] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters & Search
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [modelFilter, setModelFilter] = useState('all');
  const [scopeFilter, setScopeFilter] = useState('all');

  const loadData = () => {
    setLoading(true);
    setTimeout(() => {
      const list = firmwareService.getFirmwares();
      setFirmwares(list);
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

  // Xóa gói firmware (FN-MA5-02 / UC-MA5-02 — MSG-02, MSG-03, MSG-04)
  const handleDelete = (fw) => {
    const tenantCount = firmwareService.getTenantCountUsingFirmware(fw);

    let confirmContent = 'Bạn có chắc muốn xóa gói firmware này? Hành động không thể hoàn tác. (MSG-02)';
    if (tenantCount > 0) {
      confirmContent = `Gói này đang được ${tenantCount} Doanh nghiệp sử dụng. Xóa khỏi Catalog sẽ không ảnh hưởng đến thiết bị đã cập nhật, nhưng Tenant sẽ không thể chọn lại gói này. Tiếp tục xóa? (MSG-03)`;
    }

    Modal.confirm({
      title: 'Xác nhận xóa gói Firmware',
      icon: <AlertTriangle size={22} style={{ color: '#DC2626', marginRight: 8 }} />,
      content: confirmContent,
      okText: 'Xóa Firmware',
      okType: 'danger',
      cancelText: 'Hủy',
      centered: true,
      onOk() {
        const res = firmwareService.deleteFirmware(fw.id);
        if (res.success) {
          message.success(res.message); // MSG-04: "Xóa gói firmware thành công."
          loadData();
        }
      },
    });
  };

  // Lọc dữ liệu
  const filteredData = useMemo(() => {
    return firmwares.filter((item) => {
      // 1. Tìm theo tên file hoặc version
      const term = debouncedSearch.trim().toLowerCase();
      const matchSearch =
        !term ||
        item.fileName.toLowerCase().includes(term) ||
        item.version.toLowerCase().includes(term) ||
        item.targetModel.toLowerCase().includes(term);

      // 2. Lọc theo Model
      const matchModel = modelFilter === 'all' || item.targetModel === modelFilter;

      // 3. Lọc theo Scope
      const matchScope = scopeFilter === 'all' || item.scope === scopeFilter;

      return matchSearch && matchModel && matchScope;
    });
  }, [firmwares, debouncedSearch, modelFilter, scopeFilter]);

  // Cột bảng danh sách 6 cột theo chuẩn BRD
  const columns = [
    {
      title: 'Tên file & Phiên bản',
      dataIndex: 'fileName',
      key: 'fileName',
      width: 260,
      render: (fileName, record) => (
        <div>
          <Space size={8} align="center" style={{ marginBottom: 2 }}>
            <FileCode size={16} style={{ color: '#0B72E7', flexShrink: 0 }} />
            <Text strong style={{ fontSize: 13 }}>
              {fileName}
            </Text>
          </Space>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
            <Tag color="blue" style={{ fontWeight: 600, fontSize: 11 }}>
              {record.version}
            </Tag>
            <Text type="secondary" style={{ fontSize: 11 }}>
              {record.size}
            </Text>
            {record.status === 'Ổn định' ? (
              <Tag color="success" style={{ fontSize: 11 }}>Ổn định</Tag>
            ) : record.status === 'Lưu trữ' ? (
              <Tag color="default" style={{ fontSize: 11 }}>Lưu trữ</Tag>
            ) : (
              <Tag color="processing" style={{ fontSize: 11 }}>Phát hành</Tag>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Model tương thích',
      dataIndex: 'targetModel',
      key: 'targetModel',
      width: 200,
      render: (model) => {
        let color = 'default';
        if (model.includes('GW-500')) color = 'purple';
        if (model.includes('GW-200')) color = 'cyan';
        if (model.includes('SN-200')) color = 'green';
        if (model.includes('SM-100')) color = 'orange';

        return (
          <Tag color={color} style={{ fontWeight: 500, fontSize: 12 }}>
            {model}
          </Tag>
        );
      },
    },
    {
      title: 'Phạm vi áp dụng',
      dataIndex: 'scope',
      key: 'scope',
      width: 170,
      render: (scope, record) => {
        if (scope === 'all') {
          return (
            <Tag
              color="blue"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '2px 8px',
                borderRadius: 6,
              }}
            >
              <Globe size={12} />
              <span>Tất cả Doanh nghiệp</span>
            </Tag>
          );
        }

        const count = record.assignedTenants?.length || 0;
        return (
          <Tooltip title={`Cấp phép cho: ${record.assignedTenants?.join(', ') || 'Chưa chọn'}`}>
            <Tag
              color="purple"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '2px 8px',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              <Building2 size={12} />
              <span>{count} Doanh nghiệp</span>
            </Tag>
          </Tooltip>
        );
      },
    },
    {
      title: 'Thiết bị đã cập nhật',
      key: 'progress',
      width: 180,
      render: (_, r) => {
        const pct = r.totalCompatibleDevices
          ? Math.round((r.updatedDevices / r.totalCompatibleDevices) * 100)
          : 0;

        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 2 }}>
              <span>
                <strong>{r.updatedDevices}</strong> / {r.totalCompatibleDevices} thiết bị
              </span>
              <span style={{ fontWeight: 600, color: pct >= 80 ? '#16A34A' : '#0B72E7' }}>
                {pct}%
              </span>
            </div>
            <Progress
              percent={pct}
              size="small"
              showInfo={false}
              strokeColor={pct >= 80 ? '#16A34A' : '#0B72E7'}
            />
          </div>
        );
      },
    },
    {
      title: 'Ngày tải lên',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (d) => <Text type="secondary" style={{ fontSize: 12 }}>{d}</Text>,
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 90,
      align: 'center',
      render: (_, record) => (
        <Space size={4}>
          <Tooltip title="Sửa gói Firmware">
            <Button
              type="text"
              size="small"
              icon={<Edit size={16} />}
              onClick={() => navigate(`/admin/firmware/${record.id}/edit`)}
              style={{ color: '#0B72E7' }}
            />
          </Tooltip>
          <Tooltip title="Xóa gói Firmware">
            <Button
              type="text"
              size="small"
              icon={<Trash2 size={16} />}
              onClick={() => handleDelete(record)}
              style={{ color: '#DC2626' }}
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
            Quản Lý Gói Firmware OTA
          </Title>
          <Text type="secondary">
            Đăng tải, quản lý phiên bản và phân phối các bản cập nhật phần mềm nhúng từ xa (FOTA)
          </Text>
        </div>
        <Space>
          <Tag color="blue" style={{ fontSize: 13, padding: '4px 10px', borderRadius: 6 }}>
            MH-MA5-01
          </Tag>
          <Button
            type="primary"
            icon={<Upload size={16} />}
            onClick={() => navigate('/admin/firmware/new')}
            style={{ backgroundColor: '#0B72E7', borderRadius: 8, fontWeight: 500 }}
          >
            Tải lên gói mới
          </Button>
        </Space>
      </div>

      {/* Main Content Card */}
      <Card style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        {/* Toolbar: Tìm kiếm & Bộ lọc */}
        <div style={{ marginBottom: 18 }}>
          <Row gutter={[12, 12]} align="middle">
            {/* STT 2: Ô tìm kiếm full-width */}
            <Col xs={24} md={10}>
              <Input
                placeholder="Tìm theo tên file, số version hoặc model..."
                prefix={<Search size={16} style={{ color: '#94A3B8', marginRight: 4 }} />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </Col>

            {/* Lọc Model */}
            <Col xs={12} md={6}>
              <Select
                value={modelFilter}
                onChange={(val) => setModelFilter(val)}
                style={{ width: '100%' }}
                options={[
                  { value: 'all', label: 'Tất cả dòng Model' },
                  ...COMPATIBLE_MODELS,
                ]}
              />
            </Col>

            {/* Lọc Phạm vi áp dụng */}
            <Col xs={12} md={5}>
              <Select
                value={scopeFilter}
                onChange={(val) => setScopeFilter(val)}
                style={{ width: '100%' }}
                options={[
                  { value: 'all', label: 'Tất cả phạm vi' },
                  { value: 'all', label: '🌐 Tất cả Doanh nghiệp' },
                  { value: 'specific', label: '🏢 Chỉ định cụ thể' },
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
                  setModelFilter('all');
                  setScopeFilter('all');
                }}
              >
                Xóa lọc
              </Button>
            </Col>
          </Row>
        </div>

        {/* Bảng danh sách phân trang 20 dòng/trang (BR-Axx / BRD) */}
        <Table
          dataSource={filteredData}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 20,
            showTotal: (total) => (
              <span style={{ fontSize: 13 }}>
                Tổng cộng {total} gói Firmware
              </span>
            ),
          }}
          bordered
          size="middle"
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Không tìm thấy gói firmware nào khớp. (MSG-01)"
              />
            ),
          }}
        />
      </Card>
    </div>
  );
}
