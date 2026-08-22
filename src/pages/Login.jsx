// Mã màn hình: MH-MA1-01 (Đăng nhập) & MH-MA1-02 (Quên mật khẩu)
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, Button, Typography, Select, Divider, Alert, Space, message, Tag } from 'antd';
import { LogIn, KeyRound, Mail, Lock, ShieldCheck, ArrowLeft, ExternalLink, AlertCircle, CheckCircle } from 'lucide-react';
import { authService } from '../mock/authService';
import { MOCK_TEST_ACCOUNTS } from '../mock/mockData';

const { Title, Text, Paragraph } = Typography;

export default function Login() {
  const navigate = useNavigate();
  const [formLogin] = Form.useForm();
  const [formForgot] = Form.useForm();
  const emailInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Error state for login form
  const [loginError, setLoginError] = useState(null);

  // State theo dõi giá trị input để disable nút Đăng nhập khi 1 trong 2 ô còn trống (Yêu cầu MH-MA1-01)
  const [loginValues, setLoginValues] = useState({ email: 'admin@smartsite.io', password: 'Admin@123!' });

  // Auto focus vào ô Email khi mở trang
  useEffect(() => {
    if (!isForgotPassword) {
      setTimeout(() => {
        emailInputRef.current?.focus();
      }, 100);
    }
  }, [isForgotPassword]);

  // Đếm ngược 60 giây cho nút Gửi liên kết đặt lại (BR-A24 / BR-A21)
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown]);

  // Kiểm tra điều kiện disable nút Đăng nhập: disable khi 1 trong 2 ô trống
  const isLoginButtonDisabled =
    !loginValues.email ||
    !loginValues.email.trim() ||
    !loginValues.password ||
    !loginValues.password.trim();

  // Xử lý submit Đăng nhập (MH-MA1-01)
  const handleLogin = (values) => {
    setLoading(true);
    setLoginError(null);

    setTimeout(() => {
      setLoading(false);
      const result = authService.login(values.email, values.password);

      if (!result.success) {
        // MSG-01: "Email hoặc mật khẩu không đúng."
        // MSG-02: "Tài khoản đã bị khóa."
        setLoginError(result.message);
        message.error(result.message);
        return;
      }

      // Đăng nhập thành công -> chuyển sang Dashboard tương ứng (Admin Console hoặc Tenant Portal)
      message.success(`Đăng nhập thành công! Chào mừng ${result.user.name}`);
      const target = result.user.targetUrl || (result.user.role?.includes('Doanh nghiệp') || result.user.email?.includes('tenant') ? '/tenant/dashboard' : '/admin/dashboard/system');
      navigate(target);
    }, 400);
  };

  // Nạp nhanh tài khoản mẫu phục vụ kiểm thử demo
  const handleFillAccount = (acc) => {
    formLogin.setFieldsValue({
      email: acc.email,
      password: acc.password,
    });
    setLoginValues({
      email: acc.email,
      password: acc.password,
    });
    setLoginError(null);
  };

  // Xử lý submit Quên mật khẩu (MH-MA1-02)
  const handleForgotPassword = (values) => {
    // BR-A24: Kiểm tra cooldown
    if (countdown > 0) {
      message.warning('Vui lòng đợi ít nhất 60 giây trước khi gửi lại.'); // MSG-04
      return;
    }

    setLoading(true);
    const email = values.resetEmail;

    setTimeout(() => {
      setLoading(false);
      // EF-01: Kiểm tra email có tồn tại trong hệ thống không
      const exists = authService.checkEmailExists(email);

      if (!exists) {
        // MSG-01: "Không tìm thấy tài khoản với email này."
        formForgot.setFields([
          {
            name: 'resetEmail',
            errors: ['Không tìm thấy tài khoản với email này.'],
          },
        ]);
        message.error('Không tìm thấy tài khoản với email này.');
        return;
      }

      // Gửi thành công: Hiện banner Bước 2 (MSG-02) và kích hoạt cooldown 60 giây
      setResetSuccess(true);
      setCountdown(60);
      message.success('Đã gửi liên kết đặt lại mật khẩu.');
    }, 400);
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
          <Title level={3} style={{ margin: 0, color: '#FFFFFF', fontWeight: 700, letterSpacing: '-0.02em' }}>
            SmartSite Admin Console
          </Title>
          <Text style={{ color: '#94A3B8', fontSize: 13, display: 'block', marginTop: 4 }}>
            {!isForgotPassword ? 'Đăng nhập quản trị hệ thống' : 'Khôi phục mật khẩu tài khoản'}
          </Text>
        </div>

        {!isForgotPassword ? (
          /* ================= FORM ĐĂNG NHẬP (MH-MA1-01) ================= */
          <div>
            {loginError && (
              <Alert
                type="error"
                showIcon
                message={loginError}
                style={{ marginBottom: 18, borderRadius: 8 }}
              />
            )}

            <Form
              form={formLogin}
              layout="vertical"
              onFinish={handleLogin}
              requiredMark={false}
              initialValues={loginValues}
              onValuesChange={(_, allValues) => {
                setLoginValues(allValues);
                if (loginError) setLoginError(null);
              }}
            >
              {/* STT 1: Email / Tên đăng nhập */}
              <Form.Item
                name="email"
                label={<span style={{ color: '#E2E8F0', fontWeight: 500 }}>Email / Tên đăng nhập</span>}
                rules={[
                  { required: true, message: 'Vui lòng nhập email hoặc tên đăng nhập!' },
                ]}
              >
                <Input
                  ref={emailInputRef}
                  size="large"
                  prefix={<Mail size={18} style={{ color: '#64748B', marginRight: 6 }} />}
                  placeholder="admin@smartsite.io"
                  style={{ background: '#0D1117', borderColor: '#334155', color: '#F1F5F9' }}
                />
              </Form.Item>

              {/* STT 2: Mật khẩu */}
              <Form.Item
                name="password"
                label={<span style={{ color: '#E2E8F0', fontWeight: 500 }}>Mật khẩu</span>}
                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
              >
                <Input.Password
                  size="large"
                  prefix={<Lock size={18} style={{ color: '#64748B', marginRight: 6 }} />}
                  placeholder="••••••••"
                  style={{ background: '#0D1117', borderColor: '#334155', color: '#F1F5F9' }}
                />
              </Form.Item>

              {/* STT 3: Quên mật khẩu? */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20, marginTop: -4 }}>
                <Button
                  type="link"
                  style={{ padding: 0, color: '#4098FF', fontSize: 13 }}
                  onClick={() => {
                    setIsForgotPassword(true);
                    setResetSuccess(false);
                    setCountdown(0);
                    setLoginError(null);
                  }}
                >
                  Quên mật khẩu?
                </Button>
              </div>

              {/* STT 4: Nút Đăng nhập (disable khi 1 trong 2 ô trống) */}
              <Form.Item style={{ marginBottom: 12 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                  loading={loading}
                  disabled={isLoginButtonDisabled}
                  icon={<LogIn size={18} style={{ color: isLoginButtonDisabled ? '#64748B' : undefined }} />}
                  style={{
                    height: 44,
                    fontWeight: 600,
                    fontSize: 15,
                    backgroundColor: isLoginButtonDisabled ? '#1E293B' : '#0B72E7',
                    color: isLoginButtonDisabled ? '#64748B' : '#FFFFFF',
                    borderColor: isLoginButtonDisabled ? '#334155' : '#0B72E7',
                    borderRadius: 8,
                  }}
                >
                  <span style={{ color: isLoginButtonDisabled ? '#64748B' : '#FFFFFF' }}>
                    Đăng nhập
                  </span>
                </Button>
              </Form.Item>
            </Form>

            {/* ================= PHẦN DEMO TÀI KHOẢN MẪU ĐỂ TEST ================= */}
            <Divider style={{ borderColor: '#2A303C', margin: '20px 0 14px 0' }}>
              <Text style={{ color: '#64748B', fontSize: 12 }}>Tài khoản kiểm thử Demo</Text>
            </Divider>

            <div
              style={{
                background: '#0B0F19',
                padding: '12px 14px',
                borderRadius: 8,
                border: '1px dashed #334155',
              }}
            >
              <Text style={{ color: '#94A3B8', fontSize: 12, display: 'block', marginBottom: 8 }}>
                Chọn nhanh tài khoản để kiểm tra validation và các nhánh lỗi:
              </Text>
              <Space direction="vertical" style={{ width: '100%' }} size={8}>
                {MOCK_TEST_ACCOUNTS.map((acc) => (
                  <Button
                    key={acc.id}
                    block
                    onClick={() => handleFillAccount(acc)}
                    style={{
                      textAlign: 'left',
                      background: '#161B22',
                      borderColor: '#334155',
                      color: acc.status === 'Đã khóa' ? '#F97066' : '#94A3B8',
                      height: 'auto',
                      padding: '8px 12px',
                      borderRadius: 8,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                      }}
                    >
                      <strong style={{ color: '#F1F5F9', fontSize: 13 }}>{acc.email}</strong>
                      <Tag
                        color={acc.status === 'Đã khóa' ? 'error' : acc.id.includes('TNT') ? 'cyan' : 'blue'}
                        style={{ margin: 0, fontSize: 11, lineHeight: '18px', padding: '0 6px', borderRadius: 4 }}
                      >
                        {acc.status === 'Đã khóa' ? 'Tài khoản khóa (MSG-02)' : acc.role}
                      </Tag>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        fontSize: 11,
                        color: '#64748B',
                      }}
                    >
                      <span>Mật khẩu: <code style={{ color: '#94A3B8', background: '#0D1117', padding: '1px 4px', borderRadius: 3 }}>{acc.password}</code></span>
                      <span style={{ fontStyle: 'italic', color: '#64748B', fontSize: 10 }}>{acc.note}</span>
                    </div>
                  </Button>
                ))}
              </Space>
            </div>
          </div>
        ) : (
          /* ================= FORM QUÊN MẬT KHẨU (MH-MA1-02) ================= */
          <div>
            <div style={{ marginBottom: 18 }}>
              <Button
                type="text"
                icon={<ArrowLeft size={16} />}
                onClick={() => {
                  setIsForgotPassword(false);
                  setResetSuccess(false);
                  setCountdown(0);
                }}
                style={{ color: '#94A3B8', padding: 0, height: 'auto', marginBottom: 10 }}
              >
                Quay lại đăng nhập
              </Button>
              <Title level={4} style={{ margin: '0 0 4px 0', color: '#FFFFFF' }}>
                Quên mật khẩu
              </Title>
              <Text style={{ color: '#94A3B8', fontSize: 13 }}>
                Bước 1: Nhập email tài khoản để nhận liên kết khôi phục mật khẩu.
              </Text>
            </div>

            {/* Bước 1: Ô Email + Nút "Gửi liên kết đặt lại" (LUÔN GIỮ NGUYÊN TRÊN GIAO DIỆN) */}
            <Form
              form={formForgot}
              layout="vertical"
              onFinish={handleForgotPassword}
              requiredMark={false}
              initialValues={{ resetEmail: 'admin@smartsite.io' }}
            >
              <Form.Item
                name="resetEmail"
                label={<span style={{ color: '#E2E8F0', fontWeight: 500 }}>Email</span>}
                rules={[
                  { required: true, message: 'Vui lòng nhập email!' },
                  { type: 'email', message: 'Email không đúng định dạng!' },
                ]}
              >
                <Input
                  size="large"
                  prefix={<Mail size={18} style={{ color: '#64748B', marginRight: 6 }} />}
                  placeholder="admin@smartsite.io"
                  style={{ background: '#0D1117', borderColor: '#334155', color: '#F1F5F9' }}
                />
              </Form.Item>

              <Form.Item style={{ marginTop: 18, marginBottom: resetSuccess ? 16 : 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                  loading={loading}
                  disabled={countdown > 0}
                  icon={<KeyRound size={18} style={{ color: countdown > 0 ? '#CBD5E1' : '#FFFFFF' }} />}
                  style={{
                    height: 44,
                    fontWeight: 600,
                    fontSize: 15,
                    backgroundColor: countdown > 0 ? '#334155' : '#0B72E7',
                    color: countdown > 0 ? '#CBD5E1' : '#FFFFFF',
                    borderColor: countdown > 0 ? '#475569' : '#0B72E7',
                    borderRadius: 8,
                    cursor: countdown > 0 ? 'not-allowed' : 'pointer',
                  }}
                >
                  <span style={{ color: countdown > 0 ? '#CBD5E1' : '#FFFFFF', fontWeight: 600 }}>
                    {countdown > 0 ? `Gửi lại sau (${countdown}s)` : 'Gửi liên kết đặt lại'}
                  </span>
                </Button>
              </Form.Item>
            </Form>

            {/* Bước 2: Banner thông báo màu xanh (MSG-02) hiện bên dưới khi gửi thành công */}
            {resetSuccess && (
              <div style={{ marginTop: 16 }}>
                <Alert
                  type="success"
                  showIcon
                  message={<span style={{ fontWeight: 600, color: '#3DD68C' }}>Bước 2: Kiểm tra email</span>}
                  description={
                    <span style={{ color: '#E2E8F0', fontSize: 13, lineHeight: 1.5, display: 'block' }}>
                      Liên kết đặt lại mật khẩu đã gửi tới email, hết hạn sau 5 phút. Bấm vào liên kết trong email để đặt mật khẩu mới — không dùng mã OTP.
                    </span>
                  }
                  style={{
                    borderRadius: 8,
                    border: '1px solid #12B45A',
                    backgroundColor: 'rgba(18, 180, 90, 0.12)',
                  }}
                />

                {/* ================= KHỐI MOCK CLICK-THROUGH DẪN SANG MH-MA1-06 ================= */}
                {/* LƯU Ý: Khối nút này CHỈ để phục vụ demo click-through liên kết email trong môi trường prototype */}
                <div
                  style={{
                    marginTop: 16,
                    background: '#0B0F19',
                    padding: '12px 14px',
                    borderRadius: 8,
                    border: '1px dashed #334155',
                    textAlign: 'center',
                  }}
                >
                  <Text style={{ color: '#94A3B8', fontSize: 12, display: 'block', marginBottom: 8 }}>
                    Giả lập mở liên kết từ hộp thư email:
                  </Text>
                  <Space direction="vertical" style={{ width: '100%' }} size={6}>
                    <Button
                      type="link"
                      onClick={() => navigate('/reset-password?token=valid_demo_token')}
                      style={{
                        color: '#4098FF',
                        padding: '4px 0',
                        fontSize: 13,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        height: 'auto',
                      }}
                    >
                      <ExternalLink size={14} />
                      <span>Demo: Mở liên kết trong email (Hợp lệ)</span>
                    </Button>
                    <Button
                      type="link"
                      onClick={() => navigate('/reset-password?token=expired_token&expired=true')}
                      style={{
                        color: '#F97066',
                        padding: '4px 0',
                        fontSize: 12,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        height: 'auto',
                      }}
                    >
                      <ExternalLink size={14} />
                      <span>Demo: Mở liên kết đã hết hạn (EF-02)</span>
                    </Button>
                  </Space>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
