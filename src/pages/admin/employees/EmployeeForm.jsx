// Mã màn hình: MH-MA1-04 (Form tài khoản nhân viên vận hành — Thêm/Sửa Modal)
import React, { useEffect, useState } from 'react';
import { Form, Input, Select, Button, Switch, Checkbox, Space, Typography, Row, Col, message } from 'antd';
import { Save, User, Mail, Shield, Lock, AlertCircle } from 'lucide-react';
import { ROLE_OPTIONS, MODULE_OPTIONS } from '../../../mock/mockData';
import { authService } from '../../../mock/authService';

const { Text } = Typography;

export default function EmployeeForm({ employee, onSuccess, onCancel }) {
  const [form] = Form.useForm();
  const isEdit = Boolean(employee);
  const [selectedRole, setSelectedRole] = useState(employee?.role || undefined);
  const [modulesValue, setModulesValue] = useState(employee?.modules || []);
  const [isLocked, setIsLocked] = useState(employee?.status === 'Đã khóa');
  const [loading, setLoading] = useState(false);

  // Khi modal mở hoặc employee thay đổi, set initial values
  useEffect(() => {
    if (employee) {
      const locked = employee.status === 'Đã khóa';
      setIsLocked(locked);
      setSelectedRole(employee.role);
      setModulesValue(employee.modules || []);
      form.setFieldsValue({
        name: employee.name,
        email: employee.email,
        role: employee.role,
        isLocked: locked,
        modules: employee.modules || [],
      });
    } else {
      // Chế độ Thêm: Mặc định chọn Quản trị hệ thống hoặc để trống, modules rỗng
      setIsLocked(false);
      setSelectedRole(undefined);
      setModulesValue([]);
      form.resetFields();
    }
  }, [employee, form]);

  // Hành vi tự động tick checkbox theo Role (đã xác nhận trong đặc tả MH-MA1-04)
  const handleRoleChange = (roleValue) => {
    setSelectedRole(roleValue);
    const targetRole = ROLE_OPTIONS.find((r) => r.value === roleValue);
    if (targetRole && targetRole.defaultModules) {
      // Auto-tick sẵn các module tương ứng
      const autoModules = [...targetRole.defaultModules];
      setModulesValue(autoModules);
      form.setFieldsValue({ modules: autoModules });
    }
  };

  // Xử lý submit Form
  const handleSubmit = (values) => {
    // Validate module checkbox
    if (!values.modules || values.modules.length === 0) {
      form.setFields([
        {
          name: 'modules',
          errors: ['Vui lòng chọn ít nhất 1 module.'],
        },
      ]);
      message.error('Vui lòng nhập đầy đủ thông tin bắt buộc.'); // MSG-02
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);

      if (isEdit) {
        // Cập nhật nhân viên
        const result = authService.updateEmployee(employee.id, {
          name: values.name,
          email: values.email,
          role: values.role,
          modules: values.modules,
          isLocked: isLocked,
        });

        if (!result.success) {
          if (result.error === 'duplicate_email') {
            // MSG-01: "Email này đã được sử dụng bởi tài khoản khác."
            form.setFields([
              {
                name: 'email',
                errors: ['Email này đã được sử dụng bởi tài khoản khác.'],
              },
            ]);
          }
          message.error(result.message);
          return;
        }

        // MSG-04: "Cập nhật thông tin thành công."
        // MSG-05: "Cập nhật thông tin thành công. Tài khoản đã bị khóa."
        message.success(result.message);
        if (onSuccess) onSuccess(result.employee);
      } else {
        // Tạo nhân viên mới
        const result = authService.createEmployee({
          name: values.name,
          email: values.email,
          role: values.role,
          modules: values.modules,
        });

        if (!result.success) {
          if (result.error === 'duplicate_email') {
            // MSG-01: "Email này đã được sử dụng bởi tài khoản khác."
            form.setFields([
              {
                name: 'email',
                errors: ['Email này đã được sử dụng bởi tài khoản khác.'],
              },
            ]);
          }
          message.error(result.message);
          return;
        }

        // MSG-03: "Tạo tài khoản thành công. Email kích hoạt đã được gửi."
        message.success(result.message);
        if (onSuccess) onSuccess(result.employee);
      }
    }, 400);
  };

  return (
    <div style={{ paddingTop: 8 }}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={true}
      >
        {/* STT 1: Họ tên */}
        <Form.Item
          name="name"
          label={<span style={{ fontWeight: 500 }}>Họ và tên</span>}
          rules={[
            { required: true, message: 'Vui lòng nhập họ và tên' },
            { max: 100, message: 'Họ tên không vượt quá 100 ký tự' },
          ]}
          style={{ marginBottom: 16 }}
        >
          <Input
            placeholder="Ví dụ: Nguyễn Văn A"
            prefix={<User size={16} style={{ color: '#94A3B8', marginRight: 4 }} />}
          />
        </Form.Item>

        {/* STT 2: Email */}
        <Form.Item
          name="email"
          label={<span style={{ fontWeight: 500 }}>Email</span>}
          rules={[
            { required: true, message: 'Vui lòng nhập email' },
            { type: 'email', message: 'Email không đúng định dạng' },
          ]}
          style={{ marginBottom: 16 }}
        >
          <Input
            placeholder="ten.nv@smartsite.io"
            prefix={<Mail size={16} style={{ color: '#94A3B8', marginRight: 4 }} />}
          />
        </Form.Item>

        {/* STT 3: Role (Select) */}
        <Form.Item
          name="role"
          label={<span style={{ fontWeight: 500 }}>Role (Vai trò)</span>}
          rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
          style={{ marginBottom: 16 }}
        >
          <Select
            placeholder="-- Chọn Role cho nhân viên --"
            onChange={handleRoleChange}
            options={ROLE_OPTIONS.map((r) => ({
              value: r.value,
              label: r.label,
            }))}
          />
        </Form.Item>

        {/* STT 4: Toggle Khóa tài khoản (CHỈ HIỂN THỊ Ở CHẾ ĐỘ SỬA theo MH-MA1-04) */}
        {isEdit && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 8,
              background: isLocked ? 'rgba(240, 68, 56, 0.08)' : 'rgba(100, 116, 139, 0.08)',
              border: `1px solid ${isLocked ? '#F97066' : '#334155'}`,
              marginBottom: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, color: isLocked ? '#F04438' : undefined }}>
                {isLocked ? 'Trạng thái: Đã khóa tài khoản' : 'Khóa tài khoản'}
              </div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {isLocked
                  ? 'Tài khoản này đang bị khóa không thể đăng nhập.'
                  : 'Bật toggle để tạm khóa tài khoản và hủy session làm việc ngay.'}
              </Text>
            </div>
            <Switch
              checked={isLocked}
              onChange={(checked) => {
                setIsLocked(checked);
                form.setFieldsValue({ isLocked: checked });
              }}
              style={{ backgroundColor: isLocked ? '#F04438' : undefined }}
            />
          </div>
        )}

        {/* STT 5: Phạm vi quyền theo module (4 module - Checkbox Group) */}
        <Form.Item
          name="modules"
          label={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <span style={{ fontWeight: 500 }}>Phạm vi quyền theo module (chọn tối thiểu 1)</span>
              {selectedRole && (
                <Text type="secondary" style={{ fontSize: 11, fontStyle: 'italic' }}>
                  (Tự động tick theo Role {selectedRole})
                </Text>
              )}
            </div>
          }
          rules={[
            {
              validator(_, val) {
                if (val && val.length > 0) return Promise.resolve();
                return Promise.reject(new Error('Vui lòng chọn ít nhất 1 module'));
              },
            },
          ]}
          style={{ marginBottom: 24 }}
        >
          <Checkbox.Group
            value={modulesValue}
            onChange={(checkedList) => {
              setModulesValue(checkedList);
              form.setFieldsValue({ modules: checkedList });
            }}
            style={{ width: '100%' }}
          >
            <Row gutter={[16, 12]}>
              {MODULE_OPTIONS.map((mod) => (
                <Col span={12} key={mod.value}>
                  <Checkbox value={mod.value} style={{ fontSize: 13 }}>
                    {mod.label}
                  </Checkbox>
                </Col>
              ))}
            </Row>
          </Checkbox.Group>
        </Form.Item>

        {/* STT 6 & 7: Nút Hủy / Lưu */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid #2A303C', paddingTop: 16 }}>
          <Button onClick={onCancel} disabled={loading}>
            Hủy
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            icon={<Save size={16} />}
            style={{ backgroundColor: '#0B72E7', borderRadius: 6, fontWeight: 500 }}
          >
            Lưu
          </Button>
        </div>
      </Form>
    </div>
  );
}
