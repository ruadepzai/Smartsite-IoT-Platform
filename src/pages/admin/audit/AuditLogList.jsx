// Mã màn hình: MH-MA6-01 (Nhật ký Audit — Tra cứu và Xuất file Excel)
import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  Typography,
  Tag,
  Space,
  Button,
  Table,
  Input,
  Select,
  Row,
  Col,
  Empty,
  message,
  Tooltip,
} from 'antd';
import {
  ScrollText,
  Search,
  RotateCcw,
  FileSpreadsheet,
  Calendar,
  User,
  Shield,
  Bot,
  Layers,
  Clock,
  Globe,
  Users2,
} from 'lucide-react';
import {
  auditLogService,
  AUDIT_ROLES,
  AUDIT_ACTORS,
  AUDIT_TIME_RANGES,
} from '../../../mock/auditLogService';
import { useTheme } from '../../../theme/ThemeContext';

const { Title, Text, Paragraph } = Typography;

export default function AuditLogList() {
  const { isDark } = useTheme();

  // Filter States
  const [timeRange, setTimeRange] = useState('7d'); // '7d' (default) | '30d' | '90d'
  const [selectedRole, setSelectedRole] = useState('all'); // 'all' | 'AT-01' | 'AT-02' | 'SYSTEM'
  const [selectedActor, setSelectedActor] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);

  // Debounce search ~300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedKeyword(keyword);
    }, 300);
    return () => clearTimeout(handler);
  }, [keyword]);

  // Dynamic Actor Options filtered by Selected Role
  const filteredActorOptions = useMemo(() => {
    if (selectedRole === 'all') return AUDIT_ACTORS;
    return AUDIT_ACTORS.filter((a) => a.role === 'all' || a.role === selectedRole);
  }, [selectedRole]);

  // Load audit logs data
  const loadData = () => {
    setLoading(true);
    setTimeout(() => {
      const data = auditLogService.getAuditLogs({
        timeRange,
        role: selectedRole,
        actor: selectedActor,
        keyword: debouncedKeyword,
      });
      setLogs(data);
      setLoading(false);
    }, 120);
  };

  useEffect(() => {
    loadData();
  }, [timeRange, selectedRole, selectedActor, debouncedKeyword]);

  // Xử lý đổi Vai trò -> Nếu Actor hiện tại không thuộc Vai trò mới thì reset Actor về 'all'
  const handleRoleChange = (val) => {
    setSelectedRole(val);
    if (val !== 'all') {
      const currentActorObj = AUDIT_ACTORS.find((a) => a.value === selectedActor);
      if (currentActorObj && currentActorObj.role !== 'all' && currentActorObj.role !== val) {
        setSelectedActor('all');
      }
    }
  };

  // Xử lý Xuất file Excel .xlsx (FN-MA6-02 / UC-MA6-02)
  const handleExportExcel = () => {
    const res = auditLogService.exportToExcel(logs);
    if (!res.success) {
      message.warning(res.message); // MSG-03: "Không có dữ liệu để xuất — vui lòng điều chỉnh bộ lọc."
    } else {
      message.success(res.message); // MSG-04: "Đã xuất file Nhật ký Audit."
    }
  };

  // Reset toàn bộ bộ lọc về mặc định (7 ngày gần nhất)
  const handleResetFilters = () => {
    setTimeRange('7d');
    setSelectedRole('all');
    setSelectedActor('all');
    setKeyword('');
  };

  // Render tag hành động theo loại thao tác
  const renderActionTag = (action, actionType) => {
    let color = 'blue';
    if (actionType === 'CREATE') color = 'success';
    if (actionType === 'UPDATE') color = 'warning';
    if (actionType === 'LOCK' || actionType === 'DELETE') color = 'error';
    if (actionType === 'ALERT') color = 'magenta';
    if (actionType === 'AUTH') color = 'cyan';
    if (actionType === 'SYSTEM') color = 'purple';

    return (
      <Tag
        color={color}
        style={{
          fontWeight: 600,
          fontSize: 12,
          padding: '2px 8px',
          borderRadius: 6,
        }}
      >
        {action}
      </Tag>
    );
  };

  // Cột bảng danh sách 4 cột chuẩn BRD
  const columns = [
    {
      title: 'Thời gian',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 175,
      render: (ts) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Clock size={14} style={{ color: '#94A3B8', flexShrink: 0 }} />
          <Text strong style={{ fontSize: 13, fontFamily: 'monospace' }}>
            {ts}
          </Text>
        </div>
      ),
    },
    {
      title: 'Người thực hiện (Actor)',
      dataIndex: 'actor',
      key: 'actor',
      width: 250,
      render: (actor, record) => {
        const isSystem = record.actorRole === 'SYSTEM';
        const isSuperAdmin = record.actorRole === 'AT-01';

        return (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {isSystem ? (
                <Bot size={15} style={{ color: '#8B5CF6' }} />
              ) : isSuperAdmin ? (
                <Shield size={15} style={{ color: '#0B72E7' }} />
              ) : (
                <User size={15} style={{ color: '#10B981' }} />
              )}
              <Text strong style={{ fontSize: 13 }}>
                {actor}
              </Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
              <Tag
                color={isSuperAdmin ? 'blue' : isSystem ? 'purple' : 'green'}
                style={{ fontSize: 10, padding: '0 6px', borderRadius: 4 }}
              >
                {record.actorRole === 'AT-01' ? 'AT-01 Super Admin' : record.actorRole === 'AT-02' ? 'AT-02 Operations' : 'Hệ thống'}
              </Tag>
              <Text type="secondary" style={{ fontSize: 11 }}>
                {record.actorEmail}
              </Text>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Hành động',
      dataIndex: 'action',
      key: 'action',
      width: 210,
      render: (action, record) => renderActionTag(action, record.actionType),
    },
    {
      title: 'Chi tiết thao tác',
      dataIndex: 'details',
      key: 'details',
      render: (details, record) => (
        <div>
          <Text style={{ fontSize: 13, lineHeight: 1.5, display: 'block' }}>
            {details}
          </Text>
          <Text type="secondary" style={{ fontSize: 11, marginTop: 2, display: 'block' }}>
            Địa chỉ IP: <code>{record.ip}</code>
          </Text>
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* ================= HEADER ================= */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Space size={8} align="center">
            <ScrollText size={20} style={{ color: '#0B72E7' }} />
            <Title level={4} style={{ margin: 0 }}>
              Nhật Ký Audit Hệ Thống
            </Title>
          </Space>
          <Text type="secondary" style={{ fontSize: 13, display: 'block', marginTop: 2 }}>
            Truy vết toàn bộ hoạt động quản trị, thay đổi cấu hình hạ tầng và sự kiện bảo mật theo thời gian thực (BR-A17)
          </Text>
        </div>

        <Space size={10} wrap>
          <Tag color="blue" style={{ fontSize: 13, padding: '4px 10px', borderRadius: 6 }}>
            MH-MA6-01
          </Tag>

          {/* STT 1: Nút Xuất file Excel .xlsx (FN-MA6-02 / UC-MA6-02) */}
          <Button
            type="primary"
            icon={<FileSpreadsheet size={16} />}
            onClick={handleExportExcel}
            style={{
              backgroundColor: '#16A34A',
              borderColor: '#16A34A',
              borderRadius: 8,
              fontWeight: 500,
            }}
          >
            Xuất file Excel (.xlsx)
          </Button>
        </Space>
      </div>

      {/* ================= MAIN CONTENT CARD ================= */}
      <Card style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        {/* Toolbar: 4 Bộ lọc (Thời gian, Vai trò Role, Actor, Keyword Hành động) */}
        <div style={{ marginBottom: 18 }}>
          <Row gutter={[12, 12]} align="middle">
            {/* Bộ lọc 1: Khoảng thời gian */}
            <Col xs={24} sm={12} md={4}>
              <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>
                Khoảng thời gian:
              </Text>
              <Select
                value={timeRange}
                onChange={(val) => setTimeRange(val)}
                options={AUDIT_TIME_RANGES}
                style={{ width: '100%' }}
              />
            </Col>

            {/* Bộ lọc 2: Vai trò (Role) */}
            <Col xs={24} sm={12} md={5}>
              <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>
                Vai trò (Role):
              </Text>
              <Select
                value={selectedRole}
                onChange={handleRoleChange}
                options={AUDIT_ROLES}
                style={{ width: '100%' }}
              />
            </Col>

            {/* Bộ lọc 3: Người thực hiện (Actor) */}
            <Col xs={24} sm={12} md={5}>
              <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>
                Người thực hiện:
              </Text>
              <Select
                value={selectedActor}
                onChange={(val) => setSelectedActor(val)}
                options={filteredActorOptions}
                style={{ width: '100%' }}
              />
            </Col>

            {/* Bộ lọc 4: Ô tìm kiếm từ khóa Hành động & Chi tiết */}
            <Col xs={24} sm={12} md={7}>
              <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>
                Tìm kiếm theo từ khóa:
              </Text>
              <Input
                placeholder="Nhập từ khóa hành động, nội dung, IP... (vd: Khóa, Firmware)"
                prefix={<Search size={16} style={{ color: '#94A3B8', marginRight: 4 }} />}
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                allowClear
              />
            </Col>

            {/* Nút Xóa lọc */}
            <Col xs={24} md={3} style={{ textAlign: 'right', alignSelf: 'flex-end', paddingBottom: 2 }}>
              <Button
                type="text"
                size="small"
                icon={<RotateCcw size={14} />}
                onClick={handleResetFilters}
              >
                Xóa lọc
              </Button>
            </Col>
          </Row>
        </div>

        {/* Bảng dữ liệu 4 cột chuẩn BRD — Phân trang 20 dòng/trang */}
        <Table
          dataSource={logs}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 20,
            showTotal: (total) => (
              <span style={{ fontSize: 13 }}>
                Tổng cộng <strong>{total}</strong> sự kiện Audit Log
              </span>
            ),
          }}
          bordered
          size="middle"
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Không tìm thấy nhật ký phù hợp với bộ lọc đã chọn. (MSG-01)"
              />
            ),
          }}
        />
      </Card>
    </div>
  );
}
