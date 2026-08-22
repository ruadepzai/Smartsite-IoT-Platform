// Mã màn hình: MH-MT2-05 (Danh sách gói Firmware) & MH-MT2-06 (Cập nhật Firmware thiết bị OTA — Tenant Portal)
// Dựa theo FN-MT2-08, FN-MT2-09, FN-MT2-10 & UC-MT2-07, UC-MT2-08, UC-MT2-10 trong SmartSite_Function_List_v9 & SmartSite_IoT_UseCase_List_v5
import React, { useState } from 'react';
import {
  Card,
  Typography,
  Space,
  Tag,
  Button,
  Table,
  Modal,
  Progress,
  Form,
  Input,
  Select,
  Upload,
  Alert,
  Row,
  Col,
  Checkbox,
  Badge,
  Tooltip,
  message,
  Divider,
} from 'antd';
import {
  HardDriveDownload,
  Cpu,
  CheckCircle2,
  UploadCloud,
  RefreshCw,
  Plus,
  Send,
  AlertTriangle,
  Clock,
  XCircle,
  FileCode,
  Shield,
  Layers,
} from 'lucide-react';
import { useTheme } from '../../../theme/ThemeContext';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

export default function TenantFirmwareList() {
  const { isDark } = useTheme();

  // Danh sách Firmware (MH-MT2-05 / UC-MT2-07)
  const [firmwares, setFirmwares] = useState([
    {
      id: 'FW-01',
      fileName: 'gw500_ota_v2.4.1.bin',
      version: 'v2.4.1-rc3',
      targetModel: 'Gateway IoT GW-500',
      source: 'Cung cấp bởi Admin Hệ thống',
      status: 'Khả dụng',
      updatedDevices: 18,
      totalDevices: 28,
      releasedAt: '15/08/2026',
      checksum: 'sha256:4f8a9...b32c',
    },
    {
      id: 'FW-03',
      fileName: 'sn200_ota_v1.8.2.hex',
      version: 'v1.8.2',
      targetModel: 'Sensor Node SN-200',
      source: 'Gói cấp riêng Doanh nghiệp',
      status: 'Khả dụng',
      updatedDevices: 140,
      totalDevices: 150,
      releasedAt: '12/06/2026',
      checksum: 'sha256:9a7c1...f01e',
    },
    {
      id: 'FW-CUSTOM-01',
      fileName: 'custom_meter_patch_v1.0.bin',
      version: 'v1.0-custom',
      targetModel: 'Smart Meter SM-100',
      source: 'Doanh nghiệp tự tải lên',
      status: 'Tùy chỉnh',
      updatedDevices: 45,
      totalDevices: 60,
      releasedAt: '01/08/2026',
      checksum: 'sha256:7b2e4...e89d',
    },
  ]);

  // Modal Tải lên Gói Firmware mới (UC-MT2-08)
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [uploadForm] = Form.useForm();

  // Modal / Drawer Cập nhật Firmware OTA cho thiết bị (MH-MT2-06 / UC-MT2-10)
  const [otaModalVisible, setOtaModalVisible] = useState(false);
  const [selectedFirmwareForOta, setSelectedFirmwareForOta] = useState(null);
  const [selectedDeviceKeys, setSelectedDeviceKeys] = useState([]);
  const [otaProgressState, setOtaProgressState] = useState(null); // null | 'in_progress' | 'completed'

  // Mock danh sách thiết bị tương thích phục vụ OTA (UC-MT2-10)
  const [otaDevices, setOtaDevices] = useState([
    { key: 'DEV-01', code: 'GW-500-001', name: 'Gateway Sảnh T2', model: 'Gateway IoT GW-500', currentFw: 'v2.3.0', status: 'online', otaState: 'idle' },
    { key: 'DEV-02', code: 'GW-500-002', name: 'Gateway Phòng Server', model: 'Gateway IoT GW-500', currentFw: 'v2.3.0', status: 'online', otaState: 'idle' },
    { key: 'DEV-03', code: 'GW-500-003', name: 'Gateway Kho Hàng ALS', model: 'Gateway IoT GW-500', currentFw: 'v2.4.1-rc3', status: 'online', otaState: 'idle' },
    { key: 'DEV-04', code: 'GW-500-004', name: 'Gateway Ga T1 Dự phòng', model: 'Gateway IoT GW-500', currentFw: 'v2.3.0', status: 'offline', otaState: 'idle' },
  ]);

  // Xử lý Tải lên Gói Firmware mới (UC-MT2-08)
  const handleUploadFirmware = (values) => {
    // Validate unique version theo model trong phạm vi Tenant (EF-02)
    const duplicate = firmwares.some(
      (f) => f.targetModel === values.targetModel && f.version.toLowerCase() === values.version.trim().toLowerCase()
    );
    if (duplicate) {
      uploadForm.setFields([
        {
          name: 'version',
          errors: ['Phiên bản đã tồn tại cho model này trong Tenant. (EF-02)'],
        },
      ]);
      message.error('Phiên bản đã tồn tại cho model này.');
      return;
    }

    const newFw = {
      id: `FW-CUSTOM-${Date.now().toString().slice(-4)}`,
      fileName: values.fileName || 'firmware_custom_build.bin',
      version: values.version.trim(),
      targetModel: values.targetModel,
      source: 'Doanh nghiệp tự tải lên',
      status: 'Tùy chỉnh',
      updatedDevices: 0,
      totalDevices: 28,
      releasedAt: 'Hôm nay',
      checksum: 'sha256:' + Math.random().toString(36).substring(2, 10),
    };

    setFirmwares([newFw, ...firmwares]);
    message.success('Tải lên gói firmware thành công. (UC-MT2-08)');
    setUploadModalVisible(false);
    uploadForm.resetFields();
  };

  // Mở màn hình Cập nhật OTA cho 1 gói (MH-MT2-06)
  const handleOpenOtaModal = (fw) => {
    setSelectedFirmwareForOta(fw);
    setSelectedDeviceKeys(['DEV-01', 'DEV-02']);
    setOtaProgressState(null);
    setOtaDevices((prev) => prev.map((d) => ({ ...d, otaState: 'idle' })));
    setOtaModalVisible(true);
  };

  // Gửi lệnh cập nhật OTA (UC-MT2-10)
  const handleSendOtaCommand = () => {
    if (selectedDeviceKeys.length === 0) {
      message.warning('Vui lòng chọn ít nhất 1 thiết bị để cập nhật firmware.');
      return;
    }

    // Kiểm tra thiết bị offline (EF-02)
    const selectedDevs = otaDevices.filter((d) => selectedDeviceKeys.includes(d.key));
    const offlineDevs = selectedDevs.filter((d) => d.status === 'offline');
    if (offlineDevs.length > 0) {
      message.error(
        `${offlineDevs.length} thiết bị đang offline, không thể gửi lệnh cập nhật — vui lòng thử lại khi thiết bị online. (EF-02 / UC-MT2-10)`
      );
      return;
    }

    // Mô hình 4 trạng thái BR-T15: Pending -> Success / Failed / Timeout
    setOtaProgressState('in_progress');
    message.loading('Đang gửi gói tin firmware OTA tới các thiết bị đã chọn...', 1);

    // Bắt đầu chuyển trạng thái Pending
    setOtaDevices((prev) =>
      prev.map((d) =>
        selectedDeviceKeys.includes(d.key) ? { ...d, otaState: 'Pending (Đang tải nạp)' } : d
      )
    );

    // Giả lập hoàn thành sau 2.5 giây
    setTimeout(() => {
      setOtaDevices((prev) =>
        prev.map((d) => {
          if (selectedDeviceKeys.includes(d.key)) {
            return {
              ...d,
              currentFw: selectedFirmwareForOta.version,
              otaState: 'Success (Thành công)',
            };
          }
          return d;
        })
      );
      setOtaProgressState('completed');
      message.success(`Đã cập nhật OTA thành công cho ${selectedDeviceKeys.length} thiết bị.`);
    }, 2500);
  };

  const columns = [
    {
      title: 'Tên Gói Firmware & Version',
      dataIndex: 'fileName',
      key: 'fileName',
      render: (fn, r) => (
        <div>
          <Space size={6}>
            <HardDriveDownload size={16} style={{ color: '#0B72E7' }} />
            <Text strong style={{ fontSize: 13 }}>{fn}</Text>
          </Space>
          <div style={{ marginTop: 4 }}>
            <Tag color="blue" style={{ fontWeight: 600 }}>{r.version}</Tag>
            <Tag color={r.source.includes('Admin') ? 'cyan' : 'geekblue'}>{r.source}</Tag>
          </div>
        </div>
      ),
    },
    {
      title: 'Dòng Thiết Bị Tương Thích',
      dataIndex: 'targetModel',
      key: 'targetModel',
      render: (m) => (
        <Space size={4}>
          <Cpu size={14} style={{ color: '#8B5CF6' }} />
          <Text strong style={{ fontSize: 12 }}>{m}</Text>
        </Space>
      ),
    },
    {
      title: 'Mã Kiểm Tra Checksum',
      dataIndex: 'checksum',
      key: 'checksum',
      render: (c) => <code>{c}</code>,
    },
    {
      title: 'Tiến độ Thiết bị Đã Nâng Cấp',
      key: 'progress',
      width: 220,
      render: (_, r) => {
        const pct = Math.round((r.updatedDevices / r.totalDevices) * 100);
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <Text type="secondary">{r.updatedDevices}/{r.totalDevices} thiết bị</Text>
              <Text strong>{pct}%</Text>
            </div>
            <Progress percent={pct} size="small" showInfo={false} strokeColor="#0B72E7" />
          </div>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 150,
      align: 'center',
      render: (_, r) => (
        <Button
          type="primary"
          size="small"
          icon={<Send size={14} />}
          onClick={() => handleOpenOtaModal(r)}
          style={{ backgroundColor: '#0B72E7', borderRadius: 6 }}
        >
          Cập nhật OTA
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
            <HardDriveDownload size={24} style={{ color: '#0B72E7' }} />
            <Title level={4} style={{ margin: 0 }}>
              Quản Lý Gói Firmware & Cập Nhật OTA
            </Title>
          </Space>
          <Text type="secondary" style={{ fontSize: 13, display: 'block', marginTop: 2 }}>
            Danh sách firmware khả dụng (Admin cấp / Tự tải lên) và thực thi cập nhật từ xa cho thiết bị (MH-MT2-05 & MH-MT2-06)
          </Text>
        </div>

        <Space>
          <Tag color="blue" style={{ fontSize: 13, padding: '4px 10px', borderRadius: 6 }}>
            MH-MT2-05 / 06
          </Tag>
          <Button
            type="primary"
            icon={<Plus size={16} />}
            onClick={() => setUploadModalVisible(true)}
            style={{ backgroundColor: '#0B72E7', borderRadius: 8, height: 38 }}
          >
            Tải Lên Firmware Riêng
          </Button>
        </Space>
      </div>

      {/* Bảng danh sách Firmware (MH-MT2-05) */}
      <Card style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <Table
          dataSource={firmwares}
          columns={columns}
          rowKey="id"
          pagination={false}
          bordered
          size="middle"
        />
      </Card>

      {/* Modal Tải Lên Gói Firmware Riêng (UC-MT2-08) */}
      <Modal
        title="Tải Lên Gói Firmware Riêng Của Doanh Nghiệp (UC-MT2-08)"
        open={uploadModalVisible}
        onCancel={() => setUploadModalVisible(false)}
        onOk={() => uploadForm.submit()}
        okText="Tải lên"
        cancelText="Hủy"
        width={560}
      >
        <Form
          form={uploadForm}
          layout="vertical"
          onFinish={handleUploadFirmware}
          initialValues={{ targetModel: 'Gateway IoT GW-500' }}
        >
          <Form.Item
            name="file"
            label={
              <Space>
                <span style={{ fontWeight: 600 }}>Tệp tin Firmware (.bin, .hex)</span>
                <Tag color="orange" style={{ fontSize: 11 }}>
                  [TODO — chờ xác nhận nghiệp vụ: dung lượng tối đa]
                </Tag>
              </Space>
            }
            rules={[{ required: true, message: 'Vui lòng chọn tệp tin firmware!' }]}
          >
            <Upload beforeUpload={() => false} maxCount={1}>
              <Button icon={<UploadCloud size={16} />}>Chọn tệp Firmware từ máy tính</Button>
            </Upload>
          </Form.Item>

          <Form.Item
            name="version"
            label={<span style={{ fontWeight: 600 }}>Số phiên bản (Version — Unique theo model)</span>}
            rules={[{ required: true, message: 'Vui lòng nhập số phiên bản!' }]}
          >
            <Input placeholder="Ví dụ: v2.5.0, v1.0.4-patch..." />
          </Form.Item>

          <Form.Item
            name="targetModel"
            label={<span style={{ fontWeight: 600 }}>Dòng thiết bị tương thích (Model)</span>}
            rules={[{ required: true, message: 'Vui lòng chọn model thiết bị!' }]}
          >
            <Select>
              <Option value="Gateway IoT GW-500">Gateway IoT GW-500</Option>
              <Option value="Sensor Node SN-200">Sensor Node SN-200</Option>
              <Option value="Smart Meter SM-100">Smart Meter SM-100</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Cập Nhật Firmware OTA (MH-MT2-06 / UC-MT2-10) */}
      <Modal
        title={`Thực Thi Cập Nhật OTA — ${selectedFirmwareForOta?.fileName}`}
        open={otaModalVisible}
        onCancel={() => setOtaModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setOtaModalVisible(false)}>
            Đóng
          </Button>,
          <Button
            key="submit"
            type="primary"
            icon={<Send size={16} />}
            loading={otaProgressState === 'in_progress'}
            onClick={handleSendOtaCommand}
            style={{ backgroundColor: '#0B72E7' }}
          >
            Gửi Lệnh Cập Nhật OTA
          </Button>,
        ]}
        width={720}
      >
        {selectedFirmwareForOta && (
          <div>
            <div style={{ background: isDark ? '#1F2937' : '#F8FAFC', padding: 12, borderRadius: 8, marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={8}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Phiên bản mục tiêu:</Text>
                  <Text strong style={{ display: 'block', color: '#0B72E7' }}>{selectedFirmwareForOta.version}</Text>
                </Col>
                <Col span={8}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Dòng thiết bị:</Text>
                  <Text strong style={{ display: 'block' }}>{selectedFirmwareForOta.targetModel}</Text>
                </Col>
                <Col span={8}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Mô hình theo dõi:</Text>
                  <Text strong style={{ display: 'block', color: '#10B981' }}>BR-T15 (4 Trạng thái)</Text>
                </Col>
              </Row>
            </div>

            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              Chọn thiết bị cần cập nhật firmware (Chặn thiết bị Offline — EF-02):
            </Text>

            <Table
              dataSource={otaDevices}
              rowSelection={{
                selectedRowKeys: selectedDeviceKeys,
                onChange: setSelectedDeviceKeys,
                getCheckboxProps: (record) => ({
                  disabled: record.status === 'offline', // EF-02: Disable checkbox cho thiết bị offline
                }),
              }}
              columns={[
                { title: 'Mã & Tên thiết bị', render: (_, r) => <div><strong>{r.name}</strong><br /><Text type="secondary">{r.code}</Text></div> },
                { title: 'Fw Hiện Tại', dataIndex: 'currentFw', render: (fw) => <Tag>{fw}</Tag> },
                {
                  title: 'Trạng thái Kết nối',
                  dataIndex: 'status',
                  render: (st) =>
                    st === 'online' ? (
                      <Badge status="success" text="Online" />
                    ) : (
                      <Tooltip title="Chặn gửi lệnh cho thiết bị offline (EF-02)">
                        <Badge status="error" text="Offline (Bị chặn)" />
                      </Tooltip>
                    ),
                },
                {
                  title: 'Tiến trình OTA (BR-T15)',
                  dataIndex: 'otaState',
                  render: (state) => {
                    if (state.includes('Success')) return <Tag color="success">{state}</Tag>;
                    if (state.includes('Pending')) return <Tag color="processing" icon={<RefreshCw size={12} className="spin" />}>{state}</Tag>;
                    return <Text type="secondary">—</Text>;
                  },
                },
              ]}
              pagination={false}
              size="small"
              bordered
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
