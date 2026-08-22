// Mã màn hình: MH-MA3-01 (Catalog Gói Dịch Vụ: Cards Grid + Bảng Chi tiết + Modal Tạo/Sửa)
import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Tag,
  Space,
  Button,
  Table,
  Modal,
  Form,
  Input,
  InputNumber,
  Row,
  Col,
  List,
  message,
  Tooltip,
  Divider,
} from 'antd';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  Save,
  Check,
  Cpu,
  Users,
  Layers,
  Sparkles,
} from 'lucide-react';
import { planService } from '../../../mock/planService';

const { Title, Text, Paragraph } = Typography;

export default function PlanList() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [form] = Form.useForm();
  const [submitLoading, setSubmitLoading] = useState(false);

  const loadPlans = () => {
    setLoading(true);
    setTimeout(() => {
      const data = planService.getPlans();
      setPlans(data);
      setLoading(false);
    }, 150);
  };

  useEffect(() => {
    loadPlans();
  }, []);

  // Mở Modal Tạo mới (FN-MA3-01 / UC-MA3-01)
  const handleOpenCreate = () => {
    setEditingPlan(null);
    form.resetFields();
    form.setFieldsValue({
      name: '',
      description: '',
      max_devices: 100,
      max_users: 10,
      price: '',
    });
    setModalOpen(true);
  };

  // Mở Modal Sửa (FN-MA3-02 / UC-MA3-02)
  const handleOpenEdit = (plan) => {
    setEditingPlan(plan);
    form.setFieldsValue({
      name: plan.name,
      description: plan.description,
      max_devices: plan.max_devices,
      max_users: plan.max_users,
      price: plan.price,
    });
    setModalOpen(true);
  };

  // Xử lý Xóa gói Plan (FN-MA3-02 / UC-MA3-03 — BR-A06 & MSG-05)
  const handleDeletePlan = (plan) => {
    const tenantCount = planService.getTenantCountUsingPlan(plan.name);

    let contentMsg = `Bạn có chắc muốn xóa gói '${plan.name}' khỏi Catalog?`;
    if (tenantCount > 0) {
      contentMsg += ` Gói này đang được áp dụng bởi ${tenantCount} Doanh nghiệp — các Doanh nghiệp đó sẽ không bị ảnh hưởng, chỉ gói bị gỡ khỏi Catalog (BR-A06).`;
    }

    Modal.confirm({
      title: 'Xác nhận xóa gói dịch vụ',
      icon: <AlertTriangle size={22} style={{ color: '#DC2626', marginRight: 8 }} />,
      content: contentMsg, // MSG-05
      okText: 'Xóa gói Plan',
      okType: 'danger',
      cancelText: 'Hủy',
      centered: true,
      onOk() {
        const res = planService.deletePlan(plan.id);
        if (res.success) {
          message.success(res.message); // MSG-06: "Xóa gói dịch vụ thành công."
          loadPlans();
        }
      },
    });
  };

  // Submit Form Modal Tạo / Sửa
  const handleSubmitForm = (values) => {
    setSubmitLoading(true);

    setTimeout(() => {
      setSubmitLoading(false);

      if (editingPlan) {
        // Sửa gói Plan
        const res = planService.updatePlan(editingPlan.id, {
          name: values.name,
          description: values.description,
          max_devices: values.max_devices,
          max_users: values.max_users,
          price: values.price,
        });

        if (!res.success) {
          if (res.error === 'duplicate_name') {
            form.setFields([
              {
                name: 'name',
                errors: ['Tên gói này đã tồn tại trong Catalog.'], // MSG-01
              },
            ]);
          } else if (res.error === 'invalid_limit') {
            message.error('Hạn mức phải là số nguyên dương.'); // MSG-02
          }
          message.error(res.message);
          return;
        }

        message.success(res.message); // MSG-04: "Cập nhật gói dịch vụ thành công."
        setModalOpen(false);
        loadPlans();
      } else {
        // Tạo gói Plan
        const res = planService.createPlan({
          name: values.name,
          description: values.description,
          max_devices: values.max_devices,
          max_users: values.max_users,
          price: values.price,
        });

        if (!res.success) {
          if (res.error === 'duplicate_name') {
            form.setFields([
              {
                name: 'name',
                errors: ['Tên gói này đã tồn tại trong Catalog.'], // MSG-01
              },
            ]);
          } else if (res.error === 'invalid_limit') {
            message.error('Hạn mức phải là số nguyên dương.'); // MSG-02
          }
          message.error(res.message);
          return;
        }

        message.success(res.message); // MSG-03: "Tạo gói dịch vụ thành công."
        setModalOpen(false);
        loadPlans();
      }
    }, 250);
  };

  // Cột bảng Catalog chi tiết
  const columns = [
    {
      title: 'Tên gói',
      dataIndex: 'name',
      key: 'name',
      width: 280,
      render: (name, record) => {
        let tagColor = 'blue';
        if (name === 'Enterprise') tagColor = 'purple';
        if (name === 'Pro') tagColor = 'cyan';
        if (name === 'Custom') tagColor = 'magenta';

        return (
          <div>
            <Space size={8} style={{ marginBottom: 2 }}>
              <Text strong style={{ fontSize: 14 }}>
                {name}
              </Text>
              {record.badge && <Tag color={tagColor}>{record.badge}</Tag>}
            </Space>
            <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
              {record.description}
            </Text>
          </div>
        );
      },
    },
    {
      title: 'Hạn mức thiết bị',
      dataIndex: 'max_devices',
      key: 'max_devices',
      width: 170,
      render: (max_devices) => (
        <Space size={6}>
          <Cpu size={15} style={{ color: '#0B72E7' }} />
          <Text strong style={{ fontSize: 13 }}>
            {max_devices} thiết bị
          </Text>
        </Space>
      ),
    },
    {
      title: 'Hạn mức user',
      dataIndex: 'max_users',
      key: 'max_users',
      width: 160,
      render: (max_users) => (
        <Space size={6}>
          <Users size={15} style={{ color: '#16A34A' }} />
          <Text strong style={{ fontSize: 13 }}>
            {max_users} tài khoản
          </Text>
        </Space>
      ),
    },
    {
      title: 'Giá tham khảo',
      dataIndex: 'price',
      key: 'price',
      width: 180,
      render: (price) => (
        <Text strong style={{ color: '#0B72E7', fontSize: 13 }}>
          {price || 'Liên hệ'}
        </Text>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Space size={4}>
          <Tooltip title="Sửa gói Plan">
            <Button
              type="text"
              size="small"
              icon={<Edit size={16} />}
              onClick={() => handleOpenEdit(record)}
              style={{ color: '#0B72E7' }}
            />
          </Tooltip>
          <Tooltip title="Xóa gói Plan">
            <Button
              type="text"
              size="small"
              icon={<Trash2 size={16} />}
              onClick={() => handleDeletePlan(record)}
              style={{ color: '#DC2626' }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>
            Catalog Gói Dịch Vụ
          </Title>
          <Text type="secondary">
            Cấu hình định mức tài nguyên, giá bán và chính sách hạn mức của các gói cước IoT
          </Text>
        </div>
        <Space>
          <Tag color="blue" style={{ fontSize: 13, padding: '4px 10px', borderRadius: 6 }}>
            MH-MA3-01
          </Tag>
          <Button
            type="primary"
            icon={<Plus size={16} />}
            onClick={handleOpenCreate}
            style={{ backgroundColor: '#0B72E7', borderRadius: 8, fontWeight: 500 }}
          >
            Tạo gói mới
          </Button>
        </Space>
      </div>

      {/* ================= PHẦN 1: CÁC Ô VUÔNG GÓI DỊCH VỤ (CARDS GRID) ================= */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <Sparkles size={18} style={{ color: '#0B72E7' }} />
          <Text strong style={{ fontSize: 15 }}>
            Các gói dịch vụ tiêu biểu (Catalog Packages)
          </Text>
        </div>

        <Row gutter={[16, 16]}>
          {plans.map((p) => {
            const isFeatured = p.featured || p.name === 'Pro';
            let badgeColor = 'default';
            if (p.name === 'Enterprise') badgeColor = 'purple';
            if (p.name === 'Pro') badgeColor = 'blue';
            if (p.name === 'Custom') badgeColor = 'magenta';

            return (
              <Col xs={24} sm={12} lg={6} key={p.id}>
                <Card
                  hoverable
                  style={{
                    borderRadius: 12,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    border: isFeatured
                      ? '2px solid #0B72E7'
                      : undefined,
                    position: 'relative',
                    boxShadow: isFeatured ? '0 4px 14px rgba(11, 114, 231, 0.15)' : undefined,
                  }}
                  bodyStyle={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    padding: 20,
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <Text strong style={{ fontSize: 17 }}>
                        {p.name}
                      </Text>
                      {p.badge && <Tag color={badgeColor}>{p.badge}</Tag>}
                    </div>

                    <div style={{ margin: '6px 0 14px 0' }}>
                      <span style={{ fontSize: 20, fontWeight: 700, color: '#0B72E7' }}>
                        {p.price || 'Liên hệ'}
                      </span>
                    </div>

                    <Paragraph
                      type="secondary"
                      style={{ fontSize: 12, minHeight: 36, marginBottom: 16 }}
                      ellipsis={{ rows: 2 }}
                    >
                      {p.description}
                    </Paragraph>

                    <Divider style={{ margin: '12px 0' }} />

                    {/* Tiêu chí tài nguyên */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                        <Check size={16} style={{ color: '#16A34A', flexShrink: 0 }} />
                        <span>Hạn mức: <strong>{p.max_devices}</strong> thiết bị</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                        <Check size={16} style={{ color: '#16A34A', flexShrink: 0 }} />
                        <span>Hạn mức: <strong>{p.max_users}</strong> tài khoản</span>
                      </div>
                    </div>
                  </div>

                  {/* Nút hành động nhanh trên Card */}
                  <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                    <Button
                      block
                      size="middle"
                      icon={<Edit size={14} />}
                      onClick={() => handleOpenEdit(p)}
                    >
                      Sửa
                    </Button>
                    <Button
                      danger
                      type="text"
                      icon={<Trash2 size={15} />}
                      onClick={() => handleDeletePlan(p)}
                    />
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      </div>

      {/* ================= PHẦN 2: BẢNG DANH SÁCH CHI TIẾT CATALOG ================= */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <Layers size={18} style={{ color: '#0B72E7' }} />
          <Text strong style={{ fontSize: 15 }}>
            Bảng quản lý chi tiết Catalog gói dịch vụ
          </Text>
        </div>

        <Card style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <Table
            dataSource={plans}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={false}
            bordered
            size="middle"
          />
        </Card>
      </div>

      {/* Modal Tạo / Sửa gói Plan dùng chung */}
      <Modal
        title={
          <Space size={8}>
            <Package size={20} style={{ color: '#0B72E7' }} />
            <span>{editingPlan ? `Sửa gói dịch vụ — ${editingPlan.name}` : 'Tạo gói dịch vụ mới'}</span>
          </Space>
        }
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        destroyOnClose
        centered
        width={560}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitForm}
          requiredMark={true}
          style={{ marginTop: 16 }}
        >
          {/* STT 1: Tên gói */}
          <Form.Item
            name="name"
            label={<span style={{ fontWeight: 500 }}>Tên gói dịch vụ</span>}
            rules={[
              { required: true, message: 'Vui lòng nhập tên gói dịch vụ' },
              { max: 100, message: 'Tên gói tối đa 100 ký tự' },
            ]}
          >
            <Input placeholder="Ví dụ: Custom Plus" />
          </Form.Item>

          {/* STT 2: Mô tả */}
          <Form.Item
            name="description"
            label={<span style={{ fontWeight: 500 }}>Mô tả gói dịch vụ</span>}
            rules={[{ max: 500, message: 'Mô tả tối đa 500 ký tự' }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Mô tả phạm vi áp dụng, đối tượng khách hàng mục tiêu..."
            />
          </Form.Item>

          <Row gutter={16}>
            {/* STT 3: Hạn mức thiết bị */}
            <Col span={12}>
              <Form.Item
                name="max_devices"
                label={<span style={{ fontWeight: 500 }}>Hạn mức thiết bị</span>}
                rules={[
                  { required: true, message: 'Vui lòng nhập hạn mức thiết bị' },
                  {
                    validator(_, val) {
                      if (val === undefined || val === null || val === '') return Promise.resolve();
                      if (!Number.isInteger(Number(val)) || Number(val) <= 0) {
                        return Promise.reject(new Error('Hạn mức phải là số nguyên dương.')); // MSG-02
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <InputNumber style={{ width: '100%' }} placeholder="Ví dụ: 500" min={1} />
              </Form.Item>
            </Col>

            {/* STT 4: Hạn mức user */}
            <Col span={12}>
              <Form.Item
                name="max_users"
                label={<span style={{ fontWeight: 500 }}>Hạn mức người dùng</span>}
                rules={[
                  { required: true, message: 'Vui lòng nhập hạn mức người dùng' },
                  {
                    validator(_, val) {
                      if (val === undefined || val === null || val === '') return Promise.resolve();
                      if (!Number.isInteger(Number(val)) || Number(val) <= 0) {
                        return Promise.reject(new Error('Hạn mức phải là số nguyên dương.')); // MSG-02
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <InputNumber style={{ width: '100%' }} placeholder="Ví dụ: 50" min={1} />
              </Form.Item>
            </Col>
          </Row>

          {/* STT 5: Giá tham khảo */}
          <Form.Item
            name="price"
            label={<span style={{ fontWeight: 500 }}>Giá tham khảo</span>}
          >
            <Input placeholder="Ví dụ: 10.000.000 ₫/tháng hoặc Liên hệ" />
          </Form.Item>

          {/* Nút Thao tác Modal */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <Button onClick={() => setModalOpen(false)}>Hủy</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitLoading}
              icon={<Save size={16} />}
              style={{ backgroundColor: '#0B72E7' }}
            >
              {editingPlan ? 'Lưu thay đổi' : 'Tạo gói Plan'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
