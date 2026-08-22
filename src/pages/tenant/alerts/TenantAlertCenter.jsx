// Mã màn hình: MH-MT3-03 (Danh sách Cảnh báo) & MH-MT3-04 (Chi tiết & Xử lý Cảnh báo — Tenant Portal)
// Dựa theo FN-MT3-04, FN-MT3-05, FN-MT3-06 & UC-MT3-04, UC-MT3-05, UC-MT3-06 trong SmartSite_Function_List_v9 & SmartSite_IoT_UseCase_List_v5
import React, { useState, useMemo } from 'react';
import {
  Card,
  Typography,
  Space,
  Tag,
  Button,
  Table,
  Modal,
  Form,
  Input,
  Select,
  Row,
  Col,
  message,
  Badge,
  Tooltip,
  Drawer,
  Tabs,
  Timeline,
  Alert,
  Radio,
  Divider,
} from 'antd';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  MessageSquare,
  ShieldAlert,
  Flame,
  Check,
  Search,
  Filter,
  User,
  ExternalLink,
  Send,
  Bell,
  Mail,
  Smartphone,
  Shield,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { tenantPortalService } from '../../../mock/tenantPortalService';
import { useTheme } from '../../../theme/ThemeContext';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

export default function TenantAlertCenter() {
  const { isDark } = useTheme();
  const [alerts, setAlerts] = useState(tenantPortalService.getAlerts());
  const [searchText, setSearchText] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [currentRoleView, setCurrentRoleView] = useState('AT-03');

  // Drawer Xem Chi Tiết & Xử Lý Cảnh Báo (MH-MT3-04 / UC-MT3-05, UC-MT3-06)
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [processForm] = Form.useForm();

  // Mở Drawer chi tiết cảnh báo
  const handleOpenDetailDrawer = (alert) => {
    setSelectedAlert(alert);
    processForm.resetFields();
    processForm.setFieldsValue({
      status: alert.status === 'UNACKNOWLEDGED' ? 'IN_PROGRESS' : alert.status,
      note: alert.note || '',
    });
    setDetailDrawerVisible(true);
  };

  // Cập nhật trạng thái xử lý Cảnh báo (UC-MT3-06)
  const handleUpdateAlertStatus = (values) => {
    tenantPortalService.updateAlertStatus(selectedAlert.id, values.status, values.note);
    setAlerts([...tenantPortalService.getAlerts()]);
    
    // Cập nhật local state selectedAlert
    setSelectedAlert((prev) => ({
      ...prev,
      status: values.status,
      note: values.note,
    }));

    message.success(`Cập nhật trạng thái sự cố thành ${values.status === 'RESOLVED' ? 'Hoàn thành' : 'Đang xử lý'}. Đã ghi vào Feed lịch sử (BR-T27).`);
  };

  // Lọc danh sách cảnh báo
  const filteredAlerts = useMemo(() => {
    return alerts.filter((a) => {
      // Phân quyền AT-04 chỉ thấy cảnh báo trong Room được gán (BR-T13)
      if (currentRoleView === 'AT-04') {
        const userAssignedRooms = [
          'Phòng Server Cảng Hàng không (RM-302)',
          'Phòng Kỹ thuật Điện & HVAC Trung tâm (RM-101)',
          'Khu vực Soát vé An ninh A (RM-301)',
        ];
        if (!userAssignedRooms.includes(a.room)) return false;
      }

      const term = searchText.toLowerCase().trim();
      const matchSearch =
        !term ||
        a.title.toLowerCase().includes(term) ||
        a.device.toLowerCase().includes(term) ||
        a.room.toLowerCase().includes(term);

      const matchSeverity = selectedSeverity === 'ALL' || a.severity === selectedSeverity;
      const matchStatus = selectedStatus === 'ALL' || a.status === selectedStatus;

      return matchSearch && matchSeverity && matchStatus;
    });
  }, [alerts, searchText, selectedSeverity, selectedStatus, currentRoleView]);

  // Thống kê nhanh theo mức độ
  const stats = useMemo(() => {
    return {
      total: filteredAlerts.length,
      critical: filteredAlerts.filter((a) => a.severity === 'CRITICAL').length,
      warning: filteredAlerts.filter((a) => a.severity === 'WARNING').length,
      info: filteredAlerts.filter((a) => a.severity === 'INFO').length,
      unacknowledged: filteredAlerts.filter((a) => a.status === 'UNACKNOWLEDGED').length,
    };
  }, [filteredAlerts]);

  const columns = [
    {
      title: 'Mức Độ Cảnh Báo',
      dataIndex: 'severity',
      key: 'severity',
      width: 140,
      render: (sev) => {
        if (sev === 'CRITICAL') return <Tag color="error" style={{ fontWeight: 700 }}>🔴 CRITICAL</Tag>;
        if (sev === 'WARNING') return <Tag color="warning" style={{ fontWeight: 700 }}>🟡 WARNING</Tag>;
        return <Tag color="blue" style={{ fontWeight: 700 }}>🔵 INFO</Tag>;
      },
    },
    {
      title: 'Nội Dung & Thiết Bị Liên Quan',
      dataIndex: 'title',
      key: 'title',
      render: (title, r) => (
        <div>
          <Text strong style={{ fontSize: 13, color: r.severity === 'CRITICAL' ? '#DC2626' : undefined }}>
            {title}
          </Text>
          <Text type="secondary" style={{ display: 'block', fontSize: 11, marginTop: 2 }}>
            Thiết bị: <strong>{r.device}</strong> • Vị trí: {r.room} ({r.building})
          </Text>
        </div>
      ),
    },
    {
      title: 'Thời Điểm Phát Sinh',
      dataIndex: 'triggeredAt',
      key: 'triggeredAt',
      width: 170,
      render: (t) => (
        <Space size={4}>
          <Clock size={12} style={{ color: '#9CA3AF' }} />
          <Text style={{ fontSize: 12 }}>{t}</Text>
        </Space>
      ),
    },
    {
      title: 'Trạng Thái Xử Lý',
      dataIndex: 'status',
      key: 'status',
      width: 160,
      render: (st) => {
        if (st === 'UNACKNOWLEDGED') return <Tag color="error">Chưa xử lý</Tag>;
        if (st === 'IN_PROGRESS') return <Tag color="processing">Đang xử lý</Tag>;
        return <Tag color="success">✓ Hoàn thành</Tag>;
      },
    },
    {
      title: 'Thao Tác',
      key: 'actions',
      width: 130,
      align: 'center',
      render: (_, r) => (
        <Button
          type="primary"
          size="small"
          onClick={() => handleOpenDetailDrawer(r)}
          style={{ backgroundColor: '#0B72E7', borderRadius: 6 }}
        >
          Xử lý sự cố
        </Button>
      ),
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
              Trung Tâm Cảnh Báo & Xử Lý Sự Cố
            </Title>
          </Space>
          <Text type="secondary" style={{ fontSize: 13, display: 'block', marginTop: 2 }}>
            Theo dõi, phân cấp mức độ và cập nhật tiến trình xử lý sự cố cảnh báo toàn hệ thống (MH-MT3-03 & MH-MT3-04)
          </Text>
        </div>

        <Space>
          <Tag color="blue" style={{ fontSize: 13, padding: '4px 10px', borderRadius: 6 }}>
            MH-MT3-03 / 04
          </Tag>
          <Button
            type="default"
            icon={<Clock size={14} />}
            onClick={() => (window.location.href = '/tenant/alert-feed')}
            style={{ borderRadius: 8, height: 38 }}
          >
            Xem Feed Nhật Ký (MH-MT3-06)
          </Button>
        </Space>
      </div>

      {/* KPI Cards Thống Kê Cảnh Báo */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 10 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>Tổng số cảnh báo</Text>
            <Title level={3} style={{ margin: '4px 0 0 0', color: '#0B72E7' }}>{stats.total}</Title>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 10 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>Báo động khẩn (Critical)</Text>
            <Title level={3} style={{ margin: '4px 0 0 0', color: '#DC2626' }}>{stats.critical}</Title>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 10 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>Cảnh báo thông số (Warning)</Text>
            <Title level={3} style={{ margin: '4px 0 0 0', color: '#F59E0B' }}>{stats.warning}</Title>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 10 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>Chưa tiếp nhận xử lý</Text>
            <Title level={3} style={{ margin: '4px 0 0 0', color: '#EF4444' }}>{stats.unacknowledged}</Title>
          </Card>
        </Col>
      </Row>

      {/* Bảng Danh Sách Cảnh Báo (MH-MT3-03) */}
      <Card style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <Row gutter={[16, 16]} align="middle" justify="space-between">
          <Col xs={24} md={8}>
            <Input
              prefix={<Search size={16} style={{ color: '#9CA3AF' }} />}
              placeholder="Tìm theo nội dung, thiết bị, phòng..."
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
                value={selectedSeverity}
                onChange={setSelectedSeverity}
                style={{ width: 160 }}
              >
                <Option value="ALL">Tất cả mức độ</Option>
                <Option value="CRITICAL">🔴 Critical (Khẩn cấp)</Option>
                <Option value="WARNING">🟡 Warning (Cảnh báo)</Option>
                <Option value="INFO">🔵 Info (Thông tin)</Option>
              </Select>

              <Select
                value={selectedStatus}
                onChange={setSelectedStatus}
                style={{ width: 160 }}
              >
                <Option value="ALL">Tất cả trạng thái</Option>
                <Option value="UNACKNOWLEDGED">Chưa xử lý</Option>
                <Option value="IN_PROGRESS">Đang xử lý</Option>
                <Option value="RESOLVED">Hoàn thành</Option>
              </Select>
            </Space>
          </Col>
        </Row>

        <Divider style={{ margin: '16px 0' }} />

        <Table
          dataSource={filteredAlerts}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 8, showTotal: (total) => `Tổng cộng ${total} cảnh báo` }}
          bordered
          size="middle"
        />
      </Card>

      {/* Drawer Chi Tiết & Xử Lý Cảnh Báo (MH-MT3-04) */}
      <Drawer
        title={
          <Space>
            <ShieldAlert size={18} style={{ color: selectedAlert?.severity === 'CRITICAL' ? '#DC2626' : '#F59E0B' }} />
            <span>Chi Tiết Sự Cố — {selectedAlert?.id}</span>
          </Space>
        }
        placement="right"
        width={580}
        open={detailDrawerVisible}
        onClose={() => setDetailDrawerVisible(false)}
      >
        {selectedAlert && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Thông tin sự cố cơ bản */}
            <Alert
              type={selectedAlert.severity === 'CRITICAL' ? 'error' : 'warning'}
              showIcon
              message={selectedAlert.title}
              description={
                <div style={{ marginTop: 4, fontSize: 12 }}>
                  <div><strong>Thiết bị:</strong> {selectedAlert.device}</div>
                  <div><strong>Vị trí:</strong> {selectedAlert.room} — {selectedAlert.building}</div>
                  <div><strong>Thời điểm kích hoạt:</strong> {selectedAlert.triggeredAt}</div>
                  <div><strong>Kênh gửi thông báo (BR-T16):</strong> {selectedAlert.severity === 'CRITICAL' ? 'SMS + Email' : selectedAlert.severity === 'WARNING' ? 'Email' : 'In-App'}</div>
                </div>
              }
            />

            <Tabs defaultActiveKey="action">
              {/* Tab 1: Cập nhật Trạng thái Xử lý (UC-MT3-06) */}
              <Tabs.TabPane tab="Xử lý sự cố" key="action">
                <Form
                  form={processForm}
                  layout="vertical"
                  onFinish={handleUpdateAlertStatus}
                >
                  <Form.Item
                    name="status"
                    label={<span style={{ fontWeight: 600 }}>Cập nhật trạng thái xử lý (Không bắt buộc tuần tự — AF-01)</span>}
                    rules={[{ required: true }]}
                  >
                    <Select>
                      <Option value="UNACKNOWLEDGED">Chưa xử lý (Unacknowledged)</Option>
                      <Option value="IN_PROGRESS">Đang xử lý (In Progress)</Option>
                      <Option value="RESOLVED">Đã hoàn thành / Khắc phục (Resolved)</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="note"
                    label={<span style={{ fontWeight: 600 }}>Ghi chú xử lý & Biện pháp khắc phục (BR-T27)</span>}
                    rules={[{ required: true, message: 'Vui lòng nhập ghi chú xử lý sự cố!' }]}
                  >
                    <Input.TextArea
                      rows={4}
                      placeholder="Ghi rõ hành động đã thực hiện (ví dụ: đã cử nhân viên kỹ thuật cân pha lại tủ điện, kiểm tra van bơm...)"
                    />
                  </Form.Item>

                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    style={{ backgroundColor: '#0B72E7', height: 40, borderRadius: 8 }}
                  >
                    Lưu Thay Đổi & Ghi Vào Feed
                  </Button>
                </Form>
              </Tabs.TabPane>

              {/* Tab 2: Feed Tiến Trình Xử Lý & Cơ chế Escalation 2 Bước (BR-T36) */}
              <Tabs.TabPane tab="Nhật ký & Escalation (BR-T36)" key="feed">
                <Timeline
                  style={{ marginTop: 12 }}
                  items={[
                    {
                      color: 'red',
                      children: (
                        <div>
                          <Text strong style={{ fontSize: 12 }}>Cảnh báo phát sinh tại thiết bị</Text>
                          <Text type="secondary" style={{ display: 'block', fontSize: 11 }}>{selectedAlert.triggeredAt}</Text>
                          <Text style={{ fontSize: 11 }}>Gửi thông báo ban đầu qua SMS + Email tới người phụ trách chính.</Text>
                        </div>
                      ),
                    },
                    {
                      color: 'orange',
                      children: (
                        <div>
                          <Tag color="orange" style={{ fontSize: 10 }}>Hệ thống tự động Escalation Bước 1 (BR-T36)</Tag>
                          <Text style={{ display: 'block', fontSize: 11, marginTop: 2 }}>
                            Tại phút thứ 5 (BR-T28): Chưa được Acknowledge ➔ Gửi lại SMS nhắc nhở cho người được gán ban đầu.
                          </Text>
                        </div>
                      ),
                    },
                    {
                      color: 'red',
                      children: (
                        <div>
                          <Tag color="error" style={{ fontSize: 10 }}>Hệ thống tự động Escalation Bước 2 (BR-T36)</Tag>
                          <Text style={{ display: 'block', fontSize: 11, marginTop: 2 }}>
                            Tại phút thứ 7 (+2 phút): Vẫn chưa Acknowledge ➔ Gửi cảnh báo khẩn cấp tới TOÀN BỘ Tenant Admin của Tenant.
                          </Text>
                        </div>
                      ),
                    },
                    {
                      color: 'green',
                      children: (
                        <div>
                          <Text strong style={{ fontSize: 12 }}>Trạng thái hiện tại: {selectedAlert.status}</Text>
                          <Text type="secondary" style={{ display: 'block', fontSize: 11 }}>
                            Ghi chú: {selectedAlert.note || 'Đang theo dõi xử lý...'}
                          </Text>
                        </div>
                      ),
                    },
                  ]}
                />
              </Tabs.TabPane>
            </Tabs>
          </div>
        )}
      </Drawer>
    </div>
  );
}
