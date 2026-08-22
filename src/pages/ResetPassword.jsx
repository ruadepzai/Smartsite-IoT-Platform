// Mã màn hình: MH-MA1-06 (Đặt lại mật khẩu mới — Màn hình bổ sung)
import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, Form, Input, Button, Typography, Alert, Space, message, Tag } from 'antd';
import { Lock, ShieldCheck, CheckCircle2, ArrowRight, XCircle, Check, ArrowLeft, AlertTriangle } from 'lucide-react';
import { authService } from '../mock/authService';

const { Title, Text, Paragraph } = Typography;

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Nhánh lỗi: Kiểm tra xem link có bị đánh dấu hết hạn hay không (EF-02, UC-MA1-03)
  const isExpired = searchParams.get('expired') === 'true';

  // State theo dõi input mật khẩu mới để hiển thị checklist BR-A17 tương tác thời gian thực
  const [newPasswordValue, setNewPasswordValue] = useState('');

  // Validate các tiêu chí BR-A17
  const strengthCheck = useMemo(() => {
    return authService.validatePasswordStrength(newPasswordValue);
  }, [newPasswordValue]);

  // Xử lý submit Đặt lại mật khẩu mới
  const handleSubmit = (values) => {
    if (isExpired) {
      message.error('Đường dẫn đã hết hạn, vui lòng yêu cầu lại.');
      return;
    }

    // Kiểm tra độ mạnh mật khẩu BR-A17
    if (!strengthCheck.valid) {
      message.error('Mật khẩu mới chưa đạt yêu cầu: tối thiểu 6 ký tự, có chữ hoa, số và ký tự đặc biệt.'); // MSG-04
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const res = authService.resetPasswordWithToken(values.password);
      if (res.success) {
        setIsSuccess(true);
        message.success('Đổi mật khẩu thành công.');
      } else {
        message.error(res.message);
      }
    }, 500);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        backgroundColor: '#101828',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Decorative Pattern */}
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(11,114,231,0.15) 0%, rgba(16,24,40,0) 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-20%',
          left: '-10%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, rgba(16,24,40,0) 70%)',
          pointerEvents: 'none',
        }}
      />

      <Card
        style={{
          width: '100%',
          maxWidth: 460,
          borderRadius: 16,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
          border: '1px solid #1E293B',
          background: '#161B22',
        }}
        bodyStyle={{ padding: '36px 32px' }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: 12,
              backgroundColor: '#0B72E7',
              color: '#FFFFFF',
              marginBottom: 14,
              boxShadow: '0 4px 14px rgba(11, 114, 231, 0.4)',
            }}
          >
            <ShieldCheck size={28} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Title level={3} style={{ margin: 0, color: '#FFFFFF', fontWeight: 700, letterSpacing: '-0.02em' }}>
              Đặt lại mật khẩu
            </Title>
            <Tag color="blue" style={{ fontSize: 11 }}>MH-MA1-06</Tag>
          </div>
          <Text style={{ color: '#94A3B8', fontSize: 13, display: 'block', marginTop: 4 }}>
            Nhập mật khẩu mới an toàn cho tài khoản quản trị của bạn
          </Text>
        </div>

        {/* NHÁNH EF-02: Link hết hạn (BR-A18) */}
        {isExpired && (
          <div style={{ marginBottom: 20 }}>
            <Alert
              type="warning"
              showIcon
              message={<span style={{ fontWeight: 600 }}>Liên kết không hợp lệ hoặc đã hết hạn</span>}
              description={
                <span style={{ fontSize: 13 }}>
                  Đường dẫn đã hết hạn, vui lòng yêu cầu lại. (MSG-03)
                </span>
              }
              style={{
                borderRadius: 8,
                border: '1px solid #F79009',
                backgroundColor: 'rgba(247, 144, 9, 0.12)',
              }}
            />
            <Button
              type="primary"
              block
              size="large"
              icon={<ArrowLeft size={16} />}
              onClick={() => navigate('/login')}
              style={{ marginTop: 16, backgroundColor: '#0B72E7', height: 44, borderRadius: 8 }}
            >
              Quay lại yêu cầu liên kết mới
            </Button>
          </div>
        )}

        {!isExpired && !isSuccess && (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            requiredMark={false}
            onValuesChange={(_, all) => {
              setNewPasswordValue(all.password || '');
            }}
          >
            {/* Field 1: Mật khẩu mới */}
            <Form.Item
              name="password"
              label={<span style={{ color: '#E2E8F0', fontWeight: 500 }}>Mật khẩu mới</span>}
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                {
                  validator(_, value) {
                    if (!value) return Promise.resolve();
                    const s = authService.validatePasswordStrength(value);
                    if (!s.valid) {
                      return Promise.reject(
                        new Error(
                          'Mật khẩu mới chưa đạt yêu cầu: tối thiểu 6 ký tự, có chữ hoa, số và ký tự đặc biệt.'
                        )
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
              style={{ marginBottom: 12 }}
            >
              <Input.Password
                size="large"
                prefix={<Lock size={18} style={{ color: '#64748B', marginRight: 6 }} />}
                placeholder="Nhập mật khẩu mới"
                style={{ background: '#0D1117', borderColor: '#334155', color: '#F1F5F9' }}
              />
            </Form.Item>

            {/* Checklist trực quan độ mạnh mật khẩu BR-A17 */}
            <div
              style={{
                background: '#0B0F19',
                padding: '10px 12px',
                borderRadius: 6,
                border: '1px solid #1E293B',
                marginBottom: 16,
              }}
            >
              <Text style={{ color: '#94A3B8', fontSize: 11, display: 'block', marginBottom: 6, fontWeight: 500 }}>
                Yêu cầu độ mạnh mật khẩu (BR-A17):
              </Text>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 8px' }}>
                <span
                  style={{
                    fontSize: 11,
                    color: strengthCheck.lengthOk ? '#3DD68C' : '#64748B',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  {strengthCheck.lengthOk ? <Check size={13} /> : <span style={{ width: 13, display: 'inline-block' }}>•</span>}
                  Tối thiểu 6 ký tự
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color: strengthCheck.uppercaseOk ? '#3DD68C' : '#64748B',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  {strengthCheck.uppercaseOk ? <Check size={13} /> : <span style={{ width: 13, display: 'inline-block' }}>•</span>}
                  Có chữ in hoa (A-Z)
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color: strengthCheck.numberOk ? '#3DD68C' : '#64748B',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  {strengthCheck.numberOk ? <Check size={13} /> : <span style={{ width: 13, display: 'inline-block' }}>•</span>}
                  Có chữ số (0-9)
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color: strengthCheck.specialOk ? '#3DD68C' : '#64748B',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  {strengthCheck.specialOk ? <Check size={13} /> : <span style={{ width: 13, display: 'inline-block' }}>•</span>}
                  Ký tự đặc biệt (!@#$)
                </span>
              </div>
            </div>

            {/* Field 2: Xác nhận mật khẩu mới */}
            <Form.Item
              name="confirmPassword"
              label={<span style={{ color: '#E2E8F0', fontWeight: 500 }}>Xác nhận mật khẩu mới</span>}
              dependencies={['password']}
              rules={[
                { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                  },
                }),
              ]}
              style={{ marginBottom: 20 }}
            >
              <Input.Password
                size="large"
                prefix={<Lock size={18} style={{ color: '#64748B', marginRight: 6 }} />}
                placeholder="Nhập lại mật khẩu mới"
                style={{ background: '#0D1117', borderColor: '#334155', color: '#F1F5F9' }}
              />
            </Form.Item>

            {/* Nút Đặt lại mật khẩu */}
            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
                style={{
                  height: 44,
                  fontWeight: 600,
                  fontSize: 15,
                  backgroundColor: '#0B72E7',
                  borderRadius: 8,
                }}
              >
                Đặt lại mật khẩu
              </Button>
            </Form.Item>
          </Form>
        )}

        {/* Thành công */}
        {isSuccess && (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Alert
              type="success"
              showIcon
              message={<span style={{ fontWeight: 600 }}>Đổi mật khẩu thành công</span>}
              description="Mật khẩu của bạn đã được cập nhật thành công. Bạn có thể sử dụng mật khẩu mới để đăng nhập ngay bây giờ."
              style={{
                borderRadius: 8,
                border: '1px solid #12B45A',
                backgroundColor: 'rgba(18, 180, 90, 0.12)',
              }}
            />
            <Button
              type="primary"
              block
              size="large"
              icon={<ArrowRight size={18} />}
              onClick={() => navigate('/login')}
              style={{ backgroundColor: '#0B72E7', height: 44, borderRadius: 8, marginTop: 8 }}
            >
              Đăng nhập ngay
            </Button>
          </Space>
        )}
      </Card>
    </div>
  );
}
