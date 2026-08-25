// Mã màn hình: MH-MT3-05 (Cấu hình Ngưỡng Cảnh Báo & Escalation — Tenant Portal)
// Dựa theo FN-MT3-07 & UC-MT3-07 trong SmartSite_Function_List_v9 & SmartSite_IoT_UseCase_List_v5
import React, { useState } from 'react';
import {
  Card,
  Typography,
  Space,
  Tag,
  Button,
  Table,
  Switch,
  InputNumber,
  Select,
  Modal,
  Form,
  Input,
  Row,
  Col,
  Alert,
  Tooltip,
  Checkbox,
  message,
  Divider,
} from 'antd';
import {
  Settings,
  Save,
  Plus,
  AlertTriangle,
  Bell,
  Mail,
  Smartphone,
  Shield,
  Clock,
  Layers,
  Edit,
  Trash2,
} from 'lucide-react';
import { useTheme } from '../../../theme/ThemeContext';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

export default function TenantAlertConfig() {
  const { isDark } = useTheme();
  const [rules, setRules] = useState([
    {
      id: 'RULE-01',
      metric: 'Nhiệt độ Phòng Server (Temperature)',
      profile: 'SN-200-MQTT (Sensor Node SN-200)',
      minVal: 18.0,
      maxVal: 28.0,
      unit: '°C',
      severity: 'CRITICAL',
      channels: ['SMS', 'Email'],
      escalationMinutes: 5,
      enabled: true,
    },
    {
      id: 'RULE-02',
      metric: 'Nhiệt độ Kho Lạnh Âm Sâu (Cold Temp)',
      profile: 'SN-200-MQTT (Sensor Node SN-200)',
      minVal: -25.0,
      maxVal: -18.0,
      unit: '°C',
      severity: 'WARNING',
      channels: ['Email', 'In-App'],
      escalationMinutes: null,
      enabled: true,
    },
    {
      id: 'RULE-03',
      metric: 'Áp suất Bơm Nước Cứu Hỏa (Pump Pressure)',
      profile: 'GW-500-MODBUS (Gateway IoT GW-500)',
      minVal: 3.0,
      maxVal: 8.5,
      unit: 'bar',
      severity: 'CRITICAL',
      channels: ['SMS', 'Email'],
      escalationMinutes: 5,
      enabled: true,
    },
    {
      id: 'RULE-04',
      metric: 'Hệ số Công suất Điện (Power Factor cosφ)',
      profile: 'SM-100-PULSE (Smart Meter SM-100)',
      minVal: 0.85,
      maxVal: 1.0,
      unit: '',
      severity: 'INFO',
      channels: ['In-App'],
      escalationMinutes: null,
      enabled: false,
    },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [editingRule, setEditingRule] = useState(null);
  const [selectedSeverity, setSelectedSeverity] = useState('CRITICAL');
  const [form] = Form.useForm();

  // Mở modal Thêm mới quy tắc
  const handleOpenCreateModal = () => {
    setModalMode('create');
    setEditingRule(null);
    form.resetFields();
    form.setFieldsValue({
      profile: 'SN-200-MQTT (Sensor Node SN-200)',
      severity: 'CRITICAL',
      channels: ['SMS', 'Email'], // Mặc định Critical theo BR-T16
      escalationMinutes: 5, // Mặc định 5 phút theo BR-T28
      unit: '°C',
    });
    setSelectedSeverity('CRITICAL');
    setModalVisible(true);
  };

  // Mở modal Sửa quy tắc
  const handleOpenEditModal = (rule) => {
    setModalMode('edit');
    setEditingRule(rule);
    setSelectedSeverity(rule.severity);
    form.setFieldsValue({
      metric: rule.metric,
      profile: rule.profile,
      minVal: rule.minVal,
      maxVal: rule.maxVal,
      unit: rule.unit,
      severity: rule.severity,
      channels: rule.channels,
      escalationMinutes: rule.severity === 'CRITICAL' ? (rule.escalationMinutes || 5) : null,
    });
    setModalVisible(true);
  };

  // Tự động gợi ý kênh thông báo mặc định theo mức độ (BR-T16), cho phép override (BR-T37)
  const handleSeverityChange = (sev) => {
    setSelectedSeverity(sev);
    if (sev === 'CRITICAL') {
      form.setFieldsValue({ channels: ['SMS', 'Email'], escalationMinutes: 5 });
    } else if (sev === 'WARNING') {
      form.setFieldsValue({ channels: ['Email'], escalationMinutes: null });
    } else {
      form.setFieldsValue({ channels: ['In-App'], escalationMinutes: null });
    }
  };

  // Lưu Form Cấu hình Ngưỡng (UC-MT3-07)
  const handleSaveRule = (values) => {
    // Validate EF-01: Ngưỡng Min < Max
    if (values.minVal !== undefined && values.maxVal !== undefined && values.minVal >= values.maxVal) {
      form.setFields([
        {
          name: 'minVal',
          errors: ['Ngưỡng dưới (Min) phải nhỏ hơn ngưỡng trên (Max). (EF-01 / UC-MT3-07)'],
        },
      ]);
      message.error('Ngưỡng dưới (Min) phải nhỏ hơn ngưỡng trên (Max).');
      return;
    }

    const payload = {
      ...values,
      escalationMinutes: values.severity === 'CRITICAL' ? (values.escalationMinutes || 5) : null,
    };

    if (modalMode === 'create') {
      const newRule = {
        id: `RULE-${String(rules.length + 1).padStart(2, '0')}`,
        ...payload,
        enabled: true,
      };
      setRules([...rules, newRule]);
      message.success(`Đã thêm cấu hình ngưỡng mới: ${newRule.metric}`);
    } else {
      setRules(
        rules.map((r) => (r.id === editingRule.id ? { ...r, ...payload } : r))
      );
      message.success(`Đã cập nhật cấu hình ngưỡng: ${editingRule.metric}`);
    }
    setModalVisible(false);
    form.resetFields();
  };

  // Toggle bật/tắt rule
  const handleToggleRule = (id, checked) => {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, enabled: checked } : r)));
    message.info(`Đã ${checked ? 'bật' : 'tắt'} quy tắc cảnh báo.`);
  };

  // Xóa rule
  const handleDeleteRule = (rule) => {
    Modal.confirm({
      title: `Xóa cấu hình cảnh báo "${rule.metric}"?`,
      content: 'Sau khi xóa, hệ thống sẽ không tự động kích hoạt cảnh báo cho ngưỡng này nữa.',
      okText: 'Xóa',
      okType: 'danger',
      onOk() {
        setRules((prev) => prev.filter((r) => r.id !== rule.id));
        message.success(`Đã xóa quy tắc ${rule.metric}`);
      },
    });
  };

  const columns = [
    {
      title: 'Chỉ Số Telemetry & Profile (BR-T26)',
      dataIndex: 'metric',
      key: 'metric',
      render: (m, r) => (
        <div>
          <Text strong style={{ fontSize: 13 }}>{m}</Text>
          <Text type="secondary" style={{ display: 'block', fontSize: 11, marginTop: 2 }}>
            Device Profile: <code>{r.profile}</code>
          </Text>
        </div>
      ),
    },
    {
      title: 'Ngưỡng An Toàn (Min — Max)',
      key: 'threshold',
      render: (_, r) => (
        <Tag color="blue" style={{ fontWeight: 600, fontSize: 12 }}>
          {r.minVal} ~ {r.maxVal} {r.unit}
        </Tag>
      ),
    },
    {
      title: 'Mức Độ Cảnh Báo',
      dataIndex: 'severity',
      key: 'severity',
      width: 130,
      render: (s) => {
        if (s === 'CRITICAL') return <Tag color="error" style={{ fontWeight: 700 }}>🔴 CRITICAL</Tag>;
        if (s === 'WARNING') return <Tag color="warning" style={{ fontWeight: 700 }}>🟡 WARNING</Tag>;
        return <Tag color="blue" style={{ fontWeight: 700 }}>🔵 INFO</Tag>;
      },
    },
    {
      title: 'Kênh Thông Báo (BR-T16 / BR-T37)',
      dataIndex: 'channels',
      key: 'channels',
      render: (ch) => (
        <Space size={4}>
          {ch.map((c) => {
            let color = 'purple';
            if (c === 'SMS') color = 'magenta';
            if (c === 'Email') color = 'cyan';
            return <Tag key={c} color={color}>{c}</Tag>;
          })}
        </Space>
      ),
    },
    {
      title: 'Escalation Tự Động (BR-T28)',
      dataIndex: 'escalationMinutes',
      key: 'escalationMinutes',
      width: 170,
      render: (min, r) =>
        r.severity === 'CRITICAL' ? (
          <Tooltip title="Sau 5 phút tự động nhắc lại; sau 7 phút báo toàn bộ Admin (BR-T36)">
            <Tag color="orange" icon={<Clock size={11} style={{ display: 'inline', verticalAlign: '-1px' }} />}>
              {min} phút (2 Bước)
            </Tag>
          </Tooltip>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 110,
      align: 'center',
      render: (en, r) => (
        <Switch
          checked={en}
          onChange={(chk) => handleToggleRule(r.id, chk)}
          size="small"
        />
      ),
    },
    {
      title: 'Thao Tác',
      key: 'actions',
      width: 110,
      align: 'center',
      render: (_, r) => (
        <Space size={4}>
          <Tooltip title="Sửa cấu hình">
            <Button
              type="text"
              size="small"
              icon={<Edit size={14} />}
              onClick={() => handleOpenEditModal(r)}
              style={{ color: '#0B72E7' }}
            />
          </Tooltip>
          <Tooltip title="Xóa cấu hình">
            <Button
              type="text"
              size="small"
              icon={<Trash2 size={14} />}
              danger
              onClick={() => handleDeleteRule(r)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header trang */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Space size={8} align="center">
            <Settings size={24} style={{ color: '#0B72E7' }} />
            <Title level={4} style={{ margin: 0 }}>
              Cấu Hình Ngưỡng Cảnh Báo & Escalation
            </Title>
          </Space>
          <Text type="secondary" style={{ fontSize: 13, display: 'block', marginTop: 2 }}>
            Thiết lập ngưỡng kích hoạt cảnh báo, kênh gửi thông báo và thời gian escalation tự động theo Device Profile (MH-MT3-05)
          </Text>
        </div>

        <Space>
          <Tag color="blue" style={{ fontSize: 13, padding: '4px 10px', borderRadius: 6 }}>
            MH-MT3-05
          </Tag>
          <Button
            type="primary"
            icon={<Plus size={16} />}
            onClick={handleOpenCreateModal}
            style={{ backgroundColor: '#0B72E7', borderRadius: 8, height: 38 }}
          >
            Thêm Ngưỡng Mới (UC-MT3-07)
          </Button>
        </Space>
      </div>

      {/* Alert giải thích BR-T16, BR-T37 & BR-T36 */}
      <Alert
        type="info"
        showIcon
        message="Quy Tắc Thông Báo & Tùy Chỉnh Kênh (BR-T16 & BR-T37)"
        description="Mặc định: Critical ➔ SMS+Email; Warning ➔ Email; Info ➔ In-App (BR-T16). Tenant Admin được phép tùy chỉnh override kênh gửi riêng cho từng cấu hình (BR-T37). Thời gian escalation mặc định gợi ý 5 phút (BR-T28)."
      />

      {/* Bảng Cấu Hình Ngưỡng */}
      <Card style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <Table
          dataSource={rules}
          columns={columns}
          rowKey="id"
          pagination={false}
          bordered
          size="middle"
        />
      </Card>

      {/* Modal Thêm / Sửa Cấu Hình Ngưỡng (UC-MT3-07) */}
      <Modal
        title={modalMode === 'create' ? 'Thêm Cấu Hình Ngưỡng Cảnh Báo Mới' : `Sửa Cấu Hình — ${editingRule?.metric}`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        okText={modalMode === 'create' ? 'Tạo mới' : 'Lưu thay đổi'}
        cancelText="Hủy"
        width={580}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveRule}
        >
          <Form.Item
            name="profile"
            label={<span style={{ fontWeight: 600 }}>Áp dụng theo Device Profile (BR-T26)</span>}
            rules={[{ required: true, message: 'Vui lòng chọn Device Profile!' }]}
          >
            <Select>
              <Option value="SN-200-MQTT (Sensor Node SN-200)">SN-200-MQTT (Sensor Node SN-200)</Option>
              <Option value="GW-500-MODBUS (Gateway IoT GW-500)">GW-500-MODBUS (Gateway IoT GW-500)</Option>
              <Option value="SM-100-PULSE (Smart Meter SM-100)">SM-100-PULSE (Smart Meter SM-100)</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="metric"
            label={<span style={{ fontWeight: 600 }}>Tên chỉ số giám sát</span>}
            rules={[{ required: true, message: 'Vui lòng nhập tên chỉ số!' }]}
          >
            <Input placeholder="Ví dụ: Nhiệt độ Phòng Server, Áp suất Bơm Chữa Cháy..." />
          </Form.Item>

          <Row gutter={12}>
            <Col span={8}>
              <Form.Item
                name="minVal"
                label={<span style={{ fontWeight: 600 }}>Ngưỡng dưới (Min)</span>}
                rules={[{ required: true, message: 'Nhập Min!' }]}
              >
                <InputNumber style={{ width: '100%' }} placeholder="18.0" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="maxVal"
                label={<span style={{ fontWeight: 600 }}>Ngưỡng trên (Max)</span>}
                rules={[{ required: true, message: 'Nhập Max!' }]}
              >
                <InputNumber style={{ width: '100%' }} placeholder="28.0" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="unit"
                label={<span style={{ fontWeight: 600 }}>Đơn vị tính</span>}
              >
                <Input placeholder="°C, bar, kW..." />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                name="severity"
                label={<span style={{ fontWeight: 600 }}>Mức độ Cảnh báo</span>}
                rules={[{ required: true }]}
              >
                <Select onChange={handleSeverityChange}>
                  <Option value="CRITICAL">🔴 CRITICAL (Báo động khẩn)</Option>
                  <Option value="WARNING">🟡 WARNING (Cảnh báo thông số)</Option>
                  <Option value="INFO">🔵 INFO (Thông tin tham khảo)</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="escalationMinutes"
                label={<span style={{ fontWeight: 600 }}>Thời gian Escalation (BR-T28 / BR-T36)</span>}
                rules={[
                  {
                    required: selectedSeverity === 'CRITICAL',
                    message: 'Vui lòng nhập thời gian Escalation cho sự cố Critical!',
                  },
                ]}
                extra={
                  selectedSeverity === 'CRITICAL' ? (
                    <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 2 }}>
                      Tự động 2 bước: phút 5 nhắc lại, phút 7 báo toàn bộ Admin (BR-T36)
                    </Text>
                  ) : (
                    <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 2, color: '#94A3B8' }}>
                      Chỉ áp dụng tự động Escalation cho mức CRITICAL (BR-T28 / BR-T36)
                    </Text>
                  )
                }
              >
                <InputNumber
                  min={1}
                  max={60}
                  style={{ width: '100%' }}
                  disabled={selectedSeverity !== 'CRITICAL'}
                  placeholder={selectedSeverity === 'CRITICAL' ? '5 phút' : 'Không áp dụng'}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="channels"
            label={<span style={{ fontWeight: 600 }}>Kênh gửi thông báo (Tùy chỉnh override — BR-T37)</span>}
            rules={[{ required: true, message: 'Chọn ít nhất 1 kênh thông báo!' }]}
          >
            <Checkbox.Group
              options={[
                { label: 'Tin nhắn SMS (Khẩn cấp)', value: 'SMS' },
                { label: 'Thư điện tử (Email)', value: 'Email' },
                { label: 'Thông báo trên ứng dụng (In-App)', value: 'In-App' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
