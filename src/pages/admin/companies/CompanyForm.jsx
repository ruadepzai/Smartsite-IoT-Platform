// Mã màn hình: MH-MA2-02 (Tạo Tenant mới) & MH-MA2-04 (Sửa Tenant)
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Typography,
  Tag,
  Space,
  Button,
  Form,
  Input,
  InputNumber,
  Select,
  Row,
  Col,
  Alert,
  Divider,
  message,
} from 'antd';
import {
  Building2,
  ArrowLeft,
  Save,
  Info,
  AlertTriangle,
  Mail,
  FileText,
} from 'lucide-react';
import { tenantService } from '../../../mock/tenantService';
import {
  PACKAGE_PLANS,
  INDUSTRY_TYPES,
  TENANT_STATUSES,
} from '../../../mock/tenantData';

const { Title, Text } = Typography;

export default function CompanyForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [currentTenant, setCurrentTenant] = useState(null);

  // State theo dõi gói dịch vụ đang chọn
  const [selectedPlan, setSelectedPlan] = useState('Standard');

  // State theo dõi trạng thái đang chọn (để hiện cảnh báo MSG-03 khi Tạm ngưng/Hết hạn)
  const [selectedStatus, setSelectedStatus] = useState('Dùng thử');

  // Load dữ liệu khi ở chế độ Sửa
  useEffect(() => {
    if (isEdit && id) {
      const tenant = tenantService.getTenantById(id);
      if (tenant) {
        setCurrentTenant(tenant);
        setSelectedPlan(tenant.plan);
        setSelectedStatus(tenant.status);
        form.setFieldsValue({
          name: tenant.name,
          taxCode: tenant.taxCode,
          industry: tenant.industry,
          adminEmail: tenant.adminEmail,
          contractCode: tenant.contractCode,
          status: tenant.status,
          plan: tenant.plan,
          max_devices: tenant.max_devices,
          max_users: tenant.max_users,
        });
      } else {
        message.error('Không tìm thấy thông tin Doanh nghiệp.');
        navigate('/admin/companies');
      }
    } else {
      // Chế độ Tạo mới: reset form về giá trị ban đầu
      form.resetFields();
      setCurrentTenant(null);
      setSelectedPlan('Standard');
      setSelectedStatus('Dùng thử');
      const standardPlan = PACKAGE_PLANS.find((p) => p.value === 'Standard');
      form.setFieldsValue({
        name: '',
        taxCode: '',
        industry: 'Viễn thông',
        adminEmail: '',
        contractCode: '',
        plan: 'Standard',
        status: 'Dùng thử',
        max_devices: standardPlan?.max_devices || 50,
        max_users: standardPlan?.max_users || 5,
      });
    }
  }, [id, isEdit, form, navigate]);

  // Xử lý khi chọn Gói dịch vụ: Tự động điền max_devices / max_users (BR-A05)
  const handlePlanChange = (planValue) => {
    setSelectedPlan(planValue);
    const planObj = PACKAGE_PLANS.find((p) => p.value === planValue);

    if (planObj && planObj.value !== 'Custom') {
      form.setFieldsValue({
        max_devices: planObj.max_devices,
        max_users: planObj.max_users,
      });
    } else if (planValue === 'Custom') {
      if (!isEdit) {
        form.setFieldsValue({
          max_devices: undefined,
          max_users: undefined,
        });
      }
    }
  };

  // Xử lý submit Form
  const handleSubmit = (values) => {
    setLoading(true);

    setTimeout(() => {
      setLoading(false);

      if (isEdit) {
        // Cập nhật Doanh nghiệp (MH-MA2-04 / FN-MA2-02)
        const result = tenantService.updateTenant(id, {
          name: values.name,
          taxCode: values.taxCode,
          industry: values.industry,
          adminEmail: values.adminEmail,
          contractCode: values.contractCode,
          status: values.status,
          plan: values.plan,
          max_devices: values.max_devices,
          max_users: values.max_users,
        });

        if (!result.success) {
          if (result.error === 'duplicate_email') {
            form.setFields([
              {
                name: 'adminEmail',
                errors: ['Email này đã được sử dụng bởi Doanh nghiệp khác.'], // MSG-02
              },
            ]);
          } else if (result.error === 'duplicate_tax_code') {
            form.setFields([
              {
                name: 'taxCode',
                errors: ['Mã số thuế này đã được sử dụng bởi Doanh nghiệp khác.'],
              },
            ]);
          } else if (result.error === 'invalid_tax_code') {
            form.setFields([
              {
                name: 'taxCode',
                errors: ['Mã số thuế phải gồm 10 hoặc 13 chữ số.'], // MSG-04
              },
            ]);
          } else if (result.error === 'limit_device_too_low') {
            form.setFields([
              {
                name: 'max_devices',
                errors: [result.message], // MSG-01
              },
            ]);
          } else if (result.error === 'limit_user_too_low') {
            form.setFields([
              {
                name: 'max_users',
                errors: [result.message], // MSG-01
              },
            ]);
          }
          message.error(result.message);
          return;
        }

        // MSG-04: "Cập nhật thông tin Doanh nghiệp thành công."
        message.success(result.message);
        navigate(`/admin/companies/${id}`);
      } else {
        // Tạo Doanh nghiệp mới (MH-MA2-02 / FN-MA2-01)
        const result = tenantService.createTenant({
          name: values.name,
          taxCode: values.taxCode,
          industry: values.industry,
          adminEmail: values.adminEmail,
          contractCode: values.contractCode,
          status: values.status || 'Dùng thử',
          plan: values.plan,
          max_devices: values.max_devices,
          max_users: values.max_users,
        });

        if (!result.success) {
          if (result.error === 'duplicate_email') {
            form.setFields([
              {
                name: 'adminEmail',
                errors: ['Email này đã được sử dụng bởi Doanh nghiệp khác.'], // MSG-02
              },
            ]);
          } else if (result.error === 'duplicate_tax_code') {
            form.setFields([
              {
                name: 'taxCode',
                errors: ['Mã số thuế này đã được sử dụng bởi Doanh nghiệp khác.'],
              },
            ]);
          } else if (result.error === 'invalid_tax_code') {
            form.setFields([
              {
                name: 'taxCode',
                errors: ['Mã số thuế phải gồm 10 hoặc 13 chữ số.'], // MSG-04
              },
            ]);
          } else if (result.error === 'invalid_limit') {
            message.error('Hạn mức phải là số nguyên dương.'); // MSG-03
          }
          message.error(result.message);
          return;
        }

        // MSG-05: "Tạo Tenant thành công. Email kích hoạt đã được gửi tới Quản trị Doanh nghiệp."
        message.success(result.message);
        navigate('/admin/companies');
      }
    }, 300);
  };

  const isCustomPlan = selectedPlan === 'Custom';
  const isSuspendedOrExpired = selectedStatus === 'Tạm ngưng' || selectedStatus === 'Hết hạn';

  const screenCode = isEdit ? 'MH-MA2-04' : 'MH-MA2-02';
  const screenTitle = isEdit
    ? `Sửa thông tin — ${currentTenant?.name || 'Doanh nghiệp'}`
    : 'Tạo Tenant mới';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space align="center" size="middle">
          <Button
            type="text"
            icon={<ArrowLeft size={18} />}
            onClick={() => navigate(isEdit ? `/admin/companies/${id}` : '/admin/companies')}
          />
          <div>
            <Title level={4} style={{ margin: 0 }}>
              {screenTitle}
            </Title>
            <Text type="secondary">
              {isEdit
                ? 'Cập nhật thông tin pháp nhân, điều chỉnh hạn mức và chuyển trạng thái doanh nghiệp'
                : 'Khởi tạo hồ sơ Doanh nghiệp mới và tự động cấp tài khoản Tenant Admin'}
            </Text>
          </div>
        </Space>
        <Tag color="blue" style={{ fontSize: 13, padding: '4px 10px', borderRadius: 6 }}>
          {screenCode}
        </Tag>
      </div>

      {/* Main Form Card */}
      <Card style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            plan: 'Standard',
            status: 'Dùng thử',
            industry: 'Viễn thông',
            max_devices: 50,
            max_users: 5,
          }}
          requiredMark={true}
          style={{ maxWidth: 840, margin: '0 auto', paddingTop: 8 }}
        >
          {/* ================= PHẦN 1: THÔNG TIN CƠ BẢN DOANH NGHIỆP ================= */}
          <Title level={5} style={{ marginBottom: 16, color: '#0B72E7' }}>
            1. Thông tin cơ bản Doanh nghiệp
          </Title>

          {/* STT 1: Tên doanh nghiệp */}
          <Form.Item
            name="name"
            label={<span style={{ fontWeight: 500 }}>Tên doanh nghiệp</span>}
            rules={[
              { required: true, message: 'Vui lòng nhập tên doanh nghiệp' },
              { max: 200, message: 'Tên doanh nghiệp tối đa 200 ký tự' },
            ]}
          >
            <Input
              placeholder="Ví dụ: Tập đoàn Công nghiệp Viễn thông VNPT"
              prefix={<Building2 size={16} style={{ color: '#94A3B8', marginRight: 4 }} />}
            />
          </Form.Item>

          <Row gutter={16}>
            {/* STT 2: Mã số thuế (Bắt buộc, BR-A24 / SSOT v14.0) */}
            <Col xs={24} sm={12}>
              <Form.Item
                name="taxCode"
                label={<span style={{ fontWeight: 500 }}>Mã số thuế</span>}
                normalize={(val) => (val || '').trim()}
                rules={[
                  { required: true, message: 'Vui lòng nhập mã số thuế' },
                  {
                    pattern: /^\d{10}$|^\d{13}$/,
                    message: 'Mã số thuế phải gồm 10 hoặc 13 chữ số.', // MSG-04
                  },
                ]}
                extra={<span style={{ fontSize: 12 }}>Định dạng 10 hoặc 13 chữ số (BR-A24)</span>}
              >
                <Input
                  placeholder="Ví dụ: 0100109106"
                  maxLength={13}
                />
              </Form.Item>
            </Col>

            {/* STT 3: Loại hình doanh nghiệp (Bắt buộc, BR-A24 / SSOT v14.0) */}
            <Col xs={24} sm={12}>
              <Form.Item
                name="industry"
                label={<span style={{ fontWeight: 500 }}>Loại hình doanh nghiệp</span>}
                rules={[{ required: true, message: 'Vui lòng chọn loại hình doanh nghiệp' }]}
              >
                <Select
                  placeholder="-- Chọn loại hình doanh nghiệp --"
                  options={INDUSTRY_TYPES.map((i) => ({
                    value: i.value,
                    label: i.label,
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            {/* STT 4: Email quản trị Tenant (Bắt buộc, BR-A04) */}
            <Col xs={24} sm={12}>
              <Form.Item
                name="adminEmail"
                label={<span style={{ fontWeight: 500 }}>Email Quản trị Tenant</span>}
                normalize={(val) => (val || '').trim()}
                rules={[
                  { required: true, message: 'Vui lòng nhập email quản trị Tenant' },
                  { type: 'email', message: 'Email không đúng định dạng' },
                ]}
                extra={<span style={{ fontSize: 12 }}>Dùng để đăng nhập Tenant Admin và nhận thông báo</span>}
              >
                <Input
                  placeholder="admin@enterprise.vn"
                  prefix={<Mail size={16} style={{ color: '#94A3B8', marginRight: 4 }} />}
                />
              </Form.Item>
            </Col>

            {/* STT 5: Mã hợp đồng (tham chiếu) */}
            <Col xs={24} sm={12}>
              <Form.Item
                name="contractCode"
                label={<span style={{ fontWeight: 500 }}>Mã hợp đồng (tham chiếu)</span>}
                rules={[{ max: 50, message: 'Mã hợp đồng tối đa 50 ký tự' }]}
              >
                <Input
                  placeholder="Ví dụ: HD-2026-001"
                  prefix={<FileText size={16} style={{ color: '#94A3B8', marginRight: 4 }} />}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* STT 6 / Trạng thái Doanh nghiệp */}
          <Form.Item
            name="status"
            label={<span style={{ fontWeight: 500 }}>Trạng thái Doanh nghiệp</span>}
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
            style={{ marginBottom: 12 }}
          >
            <Select
              value={selectedStatus}
              onChange={(val) => setSelectedStatus(val)}
              options={TENANT_STATUSES.map((s) => ({
                value: s.value,
                label: s.label,
              }))}
            />
          </Form.Item>

          {/* CẢNH BÁO CHUYỂN TRẠNG THÁI TẠM NGƯNG / HẾT HẠN (MSG-03 & BR-T05) */}
          {isEdit && isSuspendedOrExpired && (
            <Alert
              type="warning"
              showIcon
              icon={<AlertTriangle size={18} style={{ color: '#D97706' }} />}
              message={<span style={{ fontWeight: 600 }}>Cảnh báo chuyển trạng thái</span>}
              description="Chuyển sang trạng thái này sẽ chặn đăng nhập toàn bộ Quản trị và Người dùng của Doanh nghiệp ngay lập tức. Tiếp tục? (MSG-03)"
              style={{
                borderRadius: 8,
                marginBottom: 20,
              }}
            />
          )}

          <Divider style={{ margin: '24px 0' }} />

          {/* ================= PHẦN 2: GÓI DỊCH VỤ & HẠN MỨC ================= */}
          <Title level={5} style={{ marginBottom: 16, color: '#0B72E7' }}>
            2. Gói dịch vụ & Cấu hình Hạn mức
          </Title>

          {/* STT 7: Gói dịch vụ */}
          <Form.Item
            name="plan"
            label={<span style={{ fontWeight: 500 }}>Gói dịch vụ (Catalog Plan)</span>}
            rules={[{ required: true, message: 'Vui lòng chọn gói dịch vụ' }]}
          >
            <Select
              onChange={handlePlanChange}
              options={PACKAGE_PLANS.map((p) => ({
                value: p.value,
                label: `${p.label} — ${p.description}`,
              }))}
            />
          </Form.Item>

          <Row gutter={16}>
            {/* STT 8: Hạn mức thiết bị */}
            <Col xs={24} sm={12}>
              <Form.Item
                name="max_devices"
                label={
                  <span style={{ fontWeight: 500 }}>
                    Hạn mức thiết bị {isEdit && currentTenant ? `(đang dùng ${currentTenant.used_devices || 0})` : ''}
                  </span>
                }
                rules={[
                  { required: true, message: 'Vui lòng nhập hạn mức thiết bị' },
                  {
                    validator(_, val) {
                      if (val === undefined || val === null || val === '') return Promise.resolve();
                      if (!Number.isInteger(Number(val)) || Number(val) <= 0) {
                        return Promise.reject(new Error('Hạn mức phải là số nguyên dương.'));
                      }
                      if (isEdit && currentTenant && Number(val) < (currentTenant.used_devices || 0)) {
                        return Promise.reject(
                          new Error(
                            `Hạn mức mới nhỏ hơn số lượng đang sử dụng (${currentTenant.used_devices}). Vui lòng giảm số lượng thiết bị/tài khoản trước hoặc chọn hạn mức khác.`
                          )
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Ví dụ: 200"
                  min={1}
                />
              </Form.Item>
            </Col>

            {/* STT 9: Hạn mức người dùng */}
            <Col xs={24} sm={12}>
              <Form.Item
                name="max_users"
                label={
                  <span style={{ fontWeight: 500 }}>
                    Hạn mức người dùng {isEdit && currentTenant ? `(đang dùng ${currentTenant.used_users || 0})` : ''}
                  </span>
                }
                rules={[
                  { required: true, message: 'Vui lòng nhập hạn mức người dùng' },
                  {
                    validator(_, val) {
                      if (val === undefined || val === null || val === '') return Promise.resolve();
                      if (!Number.isInteger(Number(val)) || Number(val) <= 0) {
                        return Promise.reject(new Error('Hạn mức phải là số nguyên dương.'));
                      }
                      if (isEdit && currentTenant && Number(val) < (currentTenant.used_users || 0)) {
                        return Promise.reject(
                          new Error(
                            `Hạn mức mới nhỏ hơn số lượng đang sử dụng (${currentTenant.used_users}). Vui lòng giảm số lượng thiết bị/tài khoản trước hoặc chọn hạn mức khác.`
                          )
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Ví dụ: 20"
                  min={1}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* VÙNG THÔNG BÁO TĨNH (KHÔNG PHẢI CHECKBOX — theo BR-A16 / Man_hinh_MA-2.md) */}
          {!isEdit && (
            <Alert
              type="info"
              showIcon
              icon={<Info size={18} style={{ color: '#0B72E7' }} />}
              message={<span style={{ fontWeight: 600 }}>Tự động khởi tạo tài khoản Quản trị</span>}
              description="Hệ thống sẽ tự động khởi tạo 1 tài khoản Tenant Admin và gửi thông tin mật khẩu tạm thời qua email quản trị doanh nghiệp (theo BR-A16)."
              style={{
                borderRadius: 8,
                marginBottom: 24,
                marginTop: 8,
              }}
            />
          )}

          {/* NÚT THAO TÁC HỦY / LƯU */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 12,
              paddingTop: 16,
              marginTop: 16,
            }}
          >
            <Button onClick={() => navigate(isEdit ? `/admin/companies/${id}` : '/admin/companies')}>
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<Save size={16} />}
              style={{ backgroundColor: '#0B72E7', borderRadius: 6, fontWeight: 500 }}
            >
              {isEdit ? 'Lưu thay đổi' : 'Tạo Tenant'}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}
