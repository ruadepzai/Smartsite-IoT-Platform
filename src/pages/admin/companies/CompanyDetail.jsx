// Mã màn hình: MH-MA2-03 (Chi tiết Tenant / Doanh nghiệp — 3 Tab)
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Typography,
  Tag,
  Space,
  Button,
  Descriptions,
  Tabs,
  Row,
  Col,
  Progress,
  Badge,
  Table,
  Empty,
} from 'antd';
import {
  Building2,
  ArrowLeft,
  Edit,
  Cpu,
  Users,
  History,
  Activity,
  FileText,
  Mail,
  Calendar,
} from 'lucide-react';
import { tenantService } from '../../../mock/tenantService';
import { TENANT_STATUSES } from '../../../mock/tenantData';

const { Title, Text } = Typography;

export default function CompanyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // State toggle demo trạng thái rỗng cho Tab "Hạn mức và sử dụng" (AF-01)
  const [demoEmptyUsage, setDemoEmptyUsage] = useState(false);

  useEffect(() => {
    if (id) {
      const data = tenantService.getTenantById(id);
      if (data) {
        setTenant(data);
      } else {
        const all = tenantService.getTenants();
        setTenant(all[0]);
      }
    }
  }, [id]);

  if (!tenant) {
    return (
      <Card style={{ borderRadius: 8, textAlign: 'center', padding: 40 }}>
        <Empty description="Không tìm thấy thông tin Doanh nghiệp" />
        <Button type="primary" onClick={() => navigate('/admin/companies')} style={{ marginTop: 16 }}>
          Quay lại danh sách
        </Button>
      </Card>
    );
  }

  // Tính toán % sử dụng thiết bị và người dùng
  const usedDev = tenant.used_devices || 0;
  const maxDev = tenant.max_devices || 1;
  const devPct = Math.round((usedDev / maxDev) * 100);

  const usedUsr = tenant.used_users || 0;
  const maxUsr = tenant.max_users || 1;
  const usrPct = Math.round((usedUsr / maxUsr) * 100);

  // Status color
  const statusObj = TENANT_STATUSES.find((s) => s.value === tenant.status);
  const badgeStatus = statusObj?.badgeStatus || 'default';
  const statusColor =
    tenant.status === 'Đang hoạt động'
      ? '#16A34A'
      : tenant.status === 'Dùng thử'
      ? '#D97706'
      : tenant.status === 'Tạm ngưng'
      ? '#DC2626'
      : '#64748B';

  // Cột bảng nhật ký lịch sử thay đổi (Tab 3)
  const historyColumns = [
    {
      title: 'Thời gian',
      dataIndex: 'time',
      key: 'time',
      width: 170,
      render: (time) => <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{time}</span>,
    },
    {
      title: 'Người thực hiện',
      dataIndex: 'actor',
      key: 'actor',
      width: 200,
      render: (actor) => <Text strong style={{ fontSize: 13 }}>{actor}</Text>,
    },
    {
      title: 'Hành động',
      dataIndex: 'action',
      key: 'action',
      width: 180,
      render: (action) => <Tag color="blue">{action}</Tag>,
    },
    {
      title: 'Chi tiết thay đổi',
      dataIndex: 'detail',
      key: 'detail',
      render: (detail) => <Text type="secondary" style={{ fontSize: 13 }}>{detail}</Text>,
    },
  ];

  const tabItems = [
    {
      key: 'overview',
      label: (
        <Space size={6}>
          <FileText size={16} />
          <span>Thông tin chung</span>
        </Space>
      ),
      children: (
        <div style={{ paddingTop: 12 }}>
          {/* 2 Thẻ số liệu thống kê tổng quan (Item 9, 10) */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} md={12}>
              <Card
                style={{
                  borderRadius: 8,
                  border: '1px solid rgba(11, 114, 231, 0.2)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Space size={8}>
                    <Cpu size={20} style={{ color: '#0B72E7' }} />
                    <Text strong style={{ fontSize: 14 }}>Thiết bị đang dùng</Text>
                  </Space>
                  <Tag color={devPct >= 80 ? 'warning' : 'blue'}>{devPct}% hạn mức</Tag>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 28, fontWeight: 700 }}>{usedDev}</span>
                  <Text type="secondary" style={{ fontSize: 14 }}>/ {maxDev} thiết bị</Text>
                </div>
                <Progress
                  percent={devPct}
                  status={devPct >= 100 ? 'exception' : devPct >= 80 ? 'active' : 'normal'}
                  strokeColor={devPct >= 80 ? '#D97706' : '#0B72E7'}
                  showInfo={false}
                />
              </Card>
            </Col>

            <Col xs={24} md={12}>
              <Card
                style={{
                  borderRadius: 8,
                  border: '1px solid rgba(18, 180, 90, 0.2)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Space size={8}>
                    <Users size={20} style={{ color: '#16A34A' }} />
                    <Text strong style={{ fontSize: 14 }}>Người dùng đang dùng</Text>
                  </Space>
                  <Tag color={usrPct >= 80 ? 'warning' : 'green'}>{usrPct}% hạn mức</Tag>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 28, fontWeight: 700 }}>{usedUsr}</span>
                  <Text type="secondary" style={{ fontSize: 14 }}>/ {maxUsr} tài khoản</Text>
                </div>
                <Progress
                  percent={usrPct}
                  status={usrPct >= 100 ? 'exception' : usrPct >= 80 ? 'active' : 'normal'}
                  strokeColor={usrPct >= 80 ? '#D97706' : '#16A34A'}
                  showInfo={false}
                />
              </Card>
            </Col>
          </Row>

          {/* Bảng Descriptions chi tiết 2 cột (Item 3 -> 8) */}
          <Descriptions
            bordered
            size="middle"
            column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
          >
            <Descriptions.Item label="Mã Doanh nghiệp">
              <Text strong style={{ fontFamily: 'monospace' }}>{tenant.id}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Tên Doanh nghiệp">
              <Text strong>{tenant.name}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Mã số thuế">
              <Text style={{ fontFamily: 'monospace' }}>{tenant.taxCode || '—'}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Loại hình doanh nghiệp">
              <Tag color="cyan">{tenant.industry || '—'}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Email Quản trị Tenant">
              <Space size={6}>
                <Mail size={14} style={{ color: '#94A3B8' }} />
                <span>{tenant.adminEmail}</span>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Mã hợp đồng (tham chiếu)">
              <Text style={{ fontFamily: 'monospace' }}>{tenant.contractCode || '—'}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Gói dịch vụ">
              <Tag color="purple">{tenant.plan}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày khởi tạo">
              <Space size={6}>
                <Calendar size={14} style={{ color: '#94A3B8' }} />
                <span>{tenant.createdAt}</span>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái hiện tại" span={2}>
              <Badge
                status={badgeStatus}
                text={
                  <span style={{ color: statusColor, fontWeight: 600, fontSize: 13 }}>
                    {tenant.status}
                  </span>
                }
              />
            </Descriptions.Item>
          </Descriptions>
        </div>
      ),
    },
    {
      key: 'usage',
      label: (
        <Space size={6}>
          <Activity size={16} />
          <span>Hạn mức và sử dụng</span>
        </Space>
      ),
      children: (
        <div style={{ paddingTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Chi tiết phân bổ hạn mức và đo lường sản lượng thực tế theo từng loại thiết bị
            </Text>
            {/* Toggle demo trạng thái rỗng AF-01 */}
            <Button
              size="small"
              onClick={() => setDemoEmptyUsage(!demoEmptyUsage)}
            >
              {demoEmptyUsage ? 'Hiện dữ liệu giám sát' : 'Demo trạng thái rỗng (AF-01)'}
            </Button>
          </div>

          {!demoEmptyUsage ? (
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Card title="Phân bổ thiết bị IoT" size="small" style={{ borderRadius: 8 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span>Gateways trung tâm</span>
                        <Text strong>{tenant.gateways || 12} / {Math.round(maxDev * 0.1)}</Text>
                      </div>
                      <Progress percent={Math.round(((tenant.gateways || 12) / (maxDev * 0.1 || 1)) * 100)} size="small" strokeColor="#0B72E7" />
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span>Node cảm biến (Sensors)</span>
                        <Text strong>{tenant.sensors || 153} / {maxDev}</Text>
                      </div>
                      <Progress percent={devPct} size="small" strokeColor="#16A34A" />
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span>Tổng thiết bị kết nối</span>
                        <Text strong>{usedDev} / {maxDev}</Text>
                      </div>
                      <Progress percent={devPct} size="small" strokeColor={devPct >= 80 ? '#D97706' : '#0B72E7'} />
                    </div>
                  </div>
                </Card>
              </Col>

              <Col xs={24} md={12}>
                <Card title="Phân bổ người dùng & quyền" size="small" style={{ borderRadius: 8 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span>Tenant Admin (Quản trị DN)</span>
                        <Text strong>1 / 1</Text>
                      </div>
                      <Progress percent={100} size="small" strokeColor="#8B5CF6" />
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span>Tenant User (Vận hành / Giám sát)</span>
                        <Text strong>{Math.max(0, usedUsr - 1)} / {maxUsr - 1}</Text>
                      </div>
                      <Progress percent={usrPct} size="small" strokeColor="#16A34A" />
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span>Tổng tài khoản phân bổ</span>
                        <Text strong>{usedUsr} / {maxUsr}</Text>
                      </div>
                      <Progress percent={usrPct} size="small" strokeColor={usrPct >= 80 ? '#D97706' : '#16A34A'} />
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>
          ) : (
            <Card style={{ textAlign: 'center', padding: '32px 0', borderRadius: 8 }}>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Chưa có dữ liệu giám sát. (AF-01, UC-MA2-03)"
              />
            </Card>
          )}
        </div>
      ),
    },
    {
      key: 'history',
      label: (
        <Space size={6}>
          <History size={16} />
          <span>Lịch sử thay đổi</span>
        </Space>
      ),
      children: (
        <div style={{ paddingTop: 12 }}>
          <Table
            dataSource={tenant.history || []}
            columns={historyColumns}
            rowKey="id"
            bordered
            size="middle"
            pagination={false}
            locale={{
              emptyText: <Empty description="Chưa có nhật ký thay đổi cho Doanh nghiệp này." />,
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space align="center" size="middle">
          <Button
            type="text"
            icon={<ArrowLeft size={18} />}
            onClick={() => navigate('/admin/companies')}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Title level={4} style={{ margin: 0 }}>
                {tenant.name}
              </Title>
              <Badge
                status={badgeStatus}
                text={
                  <span style={{ color: statusColor, fontSize: 13, fontWeight: 600 }}>
                    {tenant.status}
                  </span>
                }
              />
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Mã DN: {tenant.id} · Mã hợp đồng: {tenant.contractCode || '—'} · Gói: {tenant.plan}
            </Text>
          </div>
        </Space>

        <Space>
          <Tag color="blue" style={{ fontSize: 13, padding: '4px 10px', borderRadius: 6 }}>
            MH-MA2-03
          </Tag>
          <Button
            type="primary"
            icon={<Edit size={16} />}
            onClick={() => navigate(`/admin/companies/${tenant.id}/edit`)}
            style={{ backgroundColor: '#0B72E7', borderRadius: 8, fontWeight: 500 }}
          >
            Chỉnh sửa (MH-MA2-04)
          </Button>
        </Space>
      </div>

      {/* Main Tabs Card */}
      <Card style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          size="large"
        />
      </Card>
    </div>
  );
}
