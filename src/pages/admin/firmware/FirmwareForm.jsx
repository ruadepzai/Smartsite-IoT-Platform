// Mã màn hình: MH-MA5-02 (Form Tải lên / Sửa gói Firmware — Trang riêng biệt dùng chung)
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Card,
  Form,
  Input,
  Select,
  Radio,
  Button,
  Upload,
  Typography,
  Space,
  Row,
  Col,
  Tag,
  Alert,
  message,
  Divider,
} from 'antd';
import {
  HardDriveDownload,
  UploadCloud,
  FileCode,
  Save,
  ArrowLeft,
  Info,
  CheckCircle2,
  Lock,
  Building2,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { firmwareService, COMPATIBLE_MODELS } from '../../../mock/firmwareService';
import { tenantService } from '../../../mock/tenantService';
import { useTheme } from '../../../theme/ThemeContext';

const { Title, Text, Paragraph } = Typography;
const { Dragger } = Upload;

export default function FirmwareForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [form] = Form.useForm();

  const isEdit = Boolean(id);
  const [currentFirmware, setCurrentFirmware] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scopeValue, setScopeValue] = useState('all'); // 'all' | 'specific'
  const [fileList, setFileList] = useState([]);
  const [tenantsList, setTenantsList] = useState([]);

  // Load danh sách Doanh nghiệp
  useEffect(() => {
    const list = tenantService.getTenants();
    setTenantsList(
      list.map((t) => ({
        value: t.id,
        label: `${t.name} (${t.id})`,
      }))
    );
  }, []);

  // Khi mở form ở chế độ Edit
  useEffect(() => {
    if (isEdit) {
      const fw = firmwareService.getFirmwareById(id);
      if (!fw) {
        message.error('Không tìm thấy gói firmware.');
        navigate('/admin/firmware');
        return;
      }
      setCurrentFirmware(fw);
      setScopeValue(fw.scope);
      form.setFieldsValue({
        fileName: fw.fileName,
        version: fw.version,
        targetModel: fw.targetModel,
        scope: fw.scope,
        assignedTenants: fw.assignedTenants || [],
        notes: fw.notes || '',
      });
    } else {
      setScopeValue('all');
      form.resetFields();
      form.setFieldsValue({
        scope: 'all',
        targetModel: 'Gateway IoT GW-500',
        assignedTenants: [],
      });
    }
  }, [id, isEdit, form, navigate]);

  // Xử lý upload file giả lập (Chế độ Thêm)
  const handleCustomUpload = ({ file, onSuccess }) => {
    setTimeout(() => {
      setFileList([file]);
      form.setFieldsValue({ fileName: file.name });
      onSuccess('ok');
      message.success(`Đã đính kèm file ${file.name}`);
    }, 200);
  };

  // Submit form
  const handleSubmit = (values) => {
    setLoading(true);

    setTimeout(() => {
      setLoading(false);

      if (isEdit) {
        // Cập nhật Firmware (FN-MA5-02 / UC-MA5-02)
        const res = firmwareService.updateFirmware(id, {
          targetModel: values.targetModel,
          scope: values.scope,
          assignedTenants: values.scope === 'specific' ? values.assignedTenants : [],
          notes: values.notes,
        });

        if (!res.success) {
          if (res.error === 'missing_model') {
            form.setFields([{ name: 'targetModel', errors: ['Vui lòng chọn model thiết bị tương thích.'] }]);
          } else if (res.error === 'missing_tenants') {
            form.setFields([{ name: 'assignedTenants', errors: ['Vui lòng chọn ít nhất 1 Doanh nghiệp.'] }]);
          }
          message.error(res.message);
          return;
        }

        message.success(res.message); // MSG-06: "Cập nhật gói firmware thành công."
        navigate('/admin/firmware');
      } else {
        // Tải lên gói mới (FN-MA5-01 / UC-MA5-01)
        const chosenFile = fileList[0];
        const fileName = chosenFile ? chosenFile.name : values.fileName;

        if (!fileName) {
          message.error('Vui lòng chọn file firmware để tải lên.'); // MSG-01
          return;
        }

        const res = firmwareService.createFirmware({
          fileName,
          version: values.version,
          targetModel: values.targetModel,
          size: chosenFile ? `${(chosenFile.size / (1024 * 1024)).toFixed(1)} MB` : '14.2 MB',
          scope: values.scope,
          assignedTenants: values.scope === 'specific' ? values.assignedTenants : [],
          notes: values.notes,
        });

        if (!res.success) {
          if (res.error === 'duplicate_version') {
            form.setFields([{ name: 'version', errors: ['Phiên bản đã tồn tại cho model này.'] }]); // MSG-02
          } else if (res.error === 'missing_model') {
            form.setFields([{ name: 'targetModel', errors: ['Vui lòng chọn model thiết bị tương thích.'] }]); // MSG-03
          } else if (res.error === 'missing_tenants') {
            form.setFields([{ name: 'assignedTenants', errors: ['Vui lòng chọn ít nhất 1 Doanh nghiệp.'] }]); // MSG-04
          }
          message.error(res.message);
          return;
        }

        message.success(res.message); // MSG-05: "Tải lên gói firmware thành công."
        navigate('/admin/firmware');
      }
    }, 300);
  };

  const pageTitle = isEdit
    ? `Sửa gói Firmware — ${currentFirmware?.version || ''} (${currentFirmware?.targetModel || ''})`
    : 'Tải lên gói Firmware mới';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 900, margin: '0 auto' }}>
      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space size={12} align="center">
          <Button
            type="text"
            icon={<ArrowLeft size={18} />}
            onClick={() => navigate('/admin/firmware')}
            style={{ borderRadius: 8 }}
          />
          <div>
            <Title level={4} style={{ margin: 0 }}>
              {pageTitle}
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              {isEdit
                ? 'Điều chỉnh model tương thích và phân phối phạm vi áp dụng cho doanh nghiệp'
                : 'Đăng tải bản build binary OTA mới và cấu hình phân phối thiết bị'}
            </Text>
          </div>
        </Space>

        <Tag color="blue" style={{ fontSize: 13, padding: '4px 10px', borderRadius: 6 }}>
          MH-MA5-02
        </Tag>
      </div>

      {/* Main Form Card */}
      <Card style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={true}
          initialValues={{
            scope: 'all',
            targetModel: 'Gateway IoT GW-500',
            assignedTenants: [],
          }}
        >
          {/* ================= FIELD 1: FILE FIRMWARE ================= */}
          <div style={{ marginBottom: 24 }}>
            <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 8 }}>
              1. Tệp tin Firmware (.bin, .hex, .tar.gz, .zip) <span style={{ color: '#DC2626' }}>*</span>
            </Text>

            {isEdit ? (
              // Chế độ Sửa: Khóa read-only
              <div
                style={{
                  padding: '14px 18px',
                  borderRadius: 8,
                  backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                  border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <FileCode size={24} style={{ color: '#0B72E7' }} />
                  <div>
                    <Text strong style={{ fontSize: 14 }}>{currentFirmware?.fileName}</Text>
                    <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
                      Dung lượng: {currentFirmware?.size} • Ngày tải lên: {currentFirmware?.createdAt}
                    </Text>
                  </div>
                </div>
                <Tag color="default" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <Lock size={12} />
                  <span>Khóa (Read-only)</span>
                </Tag>
              </div>
            ) : (
              // Chế độ Thêm: Dragger Upload
              <Dragger
                name="file"
                multiple={false}
                customRequest={handleCustomUpload}
                fileList={fileList}
                onRemove={() => {
                  setFileList([]);
                  form.setFieldsValue({ fileName: undefined });
                }}
                accept=".bin,.hex,.zip,.tar.gz"
                style={{
                  borderRadius: 10,
                  backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                  borderColor: isDark ? '#334155' : '#D0D5DD',
                  padding: '20px 0',
                }}
              >
                <p className="ant-upload-drag-icon" style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
                  <UploadCloud size={40} style={{ color: '#0B72E7' }} />
                </p>
                <p className="ant-upload-text" style={{ fontSize: 14, fontWeight: 600 }}>
                  Nhấp hoặc kéo thả file firmware vào khu vực này
                </p>
                <p className="ant-upload-hint" style={{ fontSize: 12, color: '#64748B' }}>
                  Hỗ trợ định dạng binary .bin, .hex, .tar.gz hoặc .zip (Dung lượng tối đa 50MB)
                </p>
              </Dragger>
            )}

            {isEdit && (
              <Alert
                message="Quy tắc hệ thống: Không cho phép đổi file hoặc phiên bản của gói đã phát hành. Để triển khai file mới, vui lòng bấm 'Tải lên gói mới'."
                type="info"
                showIcon
                style={{ marginTop: 10, fontSize: 12, borderRadius: 8 }}
              />
            )}
          </div>

          <Divider style={{ margin: '20px 0' }} />

          {/* ================= FIELD 2: PHIÊN BẢN (VERSION) ================= */}
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="version"
                label={<span style={{ fontWeight: 600 }}>2. Phiên bản Firmware (Version)</span>}
                rules={[
                  { required: !isEdit, message: 'Vui lòng nhập phiên bản firmware' },
                  { max: 50, message: 'Phiên bản tối đa 50 ký tự' },
                ]}
                tooltip="Quy tắc: Version bắt buộc unique theo từng Model thiết bị tương thích."
              >
                {isEdit ? (
                  <Input disabled value={currentFirmware?.version} prefix={<Lock size={14} style={{ color: '#94A3B8' }} />} />
                ) : (
                  <Input placeholder="Ví dụ: v2.4.2 hoặc v1.8.3-rc1" />
                )}
              </Form.Item>
            </Col>

            {/* ================= FIELD 3: MODEL TƯƠNG THÍCH ================= */}
            <Col xs={24} md={12}>
              <Form.Item
                name="targetModel"
                label={<span style={{ fontWeight: 600 }}>3. Model thiết bị tương thích</span>}
                rules={[{ required: true, message: 'Vui lòng chọn model thiết bị tương thích' }]} // MSG-03
              >
                <Select
                  options={COMPATIBLE_MODELS}
                  placeholder="Chọn dòng thiết bị hỗ trợ"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ margin: '16px 0' }} />

          {/* ================= FIELD 4: PHẠM VI ÁP DỤNG ================= */}
          <Form.Item
            name="scope"
            label={<span style={{ fontWeight: 600 }}>4. Phạm vi áp dụng (Phân phối Doanh nghiệp)</span>}
            rules={[{ required: true }]}
          >
            <Radio.Group
              onChange={(e) => setScopeValue(e.target.value)}
              style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
            >
              <Radio value="all">
                <span style={{ fontWeight: 500 }}>Tất cả Doanh nghiệp</span>
                <Text type="secondary" style={{ display: 'block', fontSize: 12, marginLeft: 24 }}>
                  Tất cả các Doanh nghiệp sở hữu thiết bị dòng này đều nhìn thấy và được phép nâng cấp OTA.
                </Text>
              </Radio>

              <Radio value="specific">
                <span style={{ fontWeight: 500 }}>Chỉ định cụ thể Doanh nghiệp</span>
                <Text type="secondary" style={{ display: 'block', fontSize: 12, marginLeft: 24 }}>
                  Chỉ các Doanh nghiệp được chọn trong danh sách mới có quyền tiếp cận bản build này (Beta / Thử nghiệm).
                </Text>
              </Radio>
            </Radio.Group>
          </Form.Item>

          {/* ================= FIELD 5: CHỌN DOANH NGHIỆP ================= */}
          {scopeValue === 'specific' && (
            <div
              style={{
                marginLeft: 24,
                marginBottom: 20,
                padding: 16,
                borderRadius: 8,
                backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}`,
              }}
            >
              <Form.Item
                name="assignedTenants"
                label={<span style={{ fontWeight: 600 }}>Danh sách Doanh nghiệp được cấp phép</span>}
                rules={[
                  {
                    validator(_, val) {
                      if (scopeValue === 'specific' && (!val || val.length === 0)) {
                        return Promise.reject(new Error('Vui lòng chọn ít nhất 1 Doanh nghiệp. (MSG-04)'));
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Select
                  mode="multiple"
                  placeholder="Tìm và chọn các Doanh nghiệp..."
                  options={tenantsList}
                  style={{ width: '100%' }}
                  maxTagCount="responsive"
                />
              </Form.Item>
            </div>
          )}

          <Divider style={{ margin: '16px 0' }} />

          {/* ================= FIELD 6: GHI CHÚ PHÁT HÀNH (CHANGELOG) ================= */}
          <Form.Item
            name="notes"
            label={<span style={{ fontWeight: 600 }}>5. Ghi chú phát hành (Release Notes / Changelog)</span>}
            rules={[{ max: 1000, message: 'Ghi chú tối đa 1000 ký tự' }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Mô tả các tính năng mới, bản sửa lỗi an ninh, hoặc hướng dẫn nâng cấp đặc biệt..."
            />
          </Form.Item>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
            <Button onClick={() => navigate('/admin/firmware')} style={{ borderRadius: 8 }}>
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<Save size={16} />}
              style={{ backgroundColor: '#0B72E7', borderRadius: 8, fontWeight: 500 }}
            >
              {isEdit ? 'Lưu thay đổi' : 'Tải lên gói Firmware'}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}
