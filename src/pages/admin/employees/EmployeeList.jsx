// Mã màn hình: MH-MA1-03 (Danh sách nhân viên vận hành)
import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  Typography,
  Tag,
  Space,
  Button,
  Table,
  Modal,
  Input,
  Select,
  Dropdown,
  Badge,
  Empty,
  message,
  Row,
  Col,
} from 'antd';
import {
  Users,
  UserPlus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Filter,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import EmployeeForm from './EmployeeForm';
import { authService } from '../../../mock/authService';
import { ROLE_OPTIONS } from '../../../mock/mockData';

const { Title, Text, Paragraph } = Typography;

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  // State tìm kiếm & bộ lọc
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRole, setFilterRole] = useState('all');

  // State phân trang (20 dòng/trang theo BR-A20)
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // State modal Thêm / Sửa
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  // Load danh sách nhân viên
  const loadEmployees = () => {
    setLoading(true);
    setTimeout(() => {
      const data = authService.getEmployees();
      setEmployees(data);
      setLoading(false);
    }, 200);
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  // Debounce tìm kiếm ~300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchText);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchText]);

  // Lọc dữ liệu danh sách theo từ khóa, status, role
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      // 1. Lọc theo từ khóa tìm kiếm (tên hoặc email)
      const term = debouncedSearch.trim().toLowerCase();
      const matchSearch =
        !term ||
        (emp.name && emp.name.toLowerCase().includes(term)) ||
        (emp.email && emp.email.toLowerCase().includes(term));

      // 2. Lọc theo Trạng thái
      const matchStatus =
        filterStatus === 'all' || emp.status === filterStatus;

      // 3. Lọc theo Role
      const matchRole =
        filterRole === 'all' || emp.role === filterRole;

      return matchSearch && matchStatus && matchRole;
    });
  }, [employees, debouncedSearch, filterStatus, filterRole]);

  // Xử lý Xóa nhân viên (AF-02, UC-MA1-05 & MSG-02, MSG-03)
  const handleDeleteEmployee = (record) => {
    Modal.confirm({
      title: 'Xác nhận xóa tài khoản',
      icon: <AlertTriangle size={22} style={{ color: '#F04438', marginRight: 8 }} />,
      content: 'Bạn có chắc muốn xóa tài khoản này? Hành động không thể hoàn tác.', // MSG-02
      okText: 'Xóa tài khoản',
      okType: 'danger',
      cancelText: 'Hủy',
      centered: true,
      onOk() {
        const res = authService.deleteEmployee(record.id);
        if (res.success) {
          message.success('Xóa tài khoản thành công.'); // MSG-03
          loadEmployees();
        }
      },
    });
  };

  // Callback sau khi Thêm/Sửa thành công
  const handleFormSuccess = () => {
    setModalOpen(false);
    setEditingEmployee(null);
    loadEmployees();
  };

  // Cấu hình các cột bảng (khớp chính xác bảng mô tả MH-MA1-03)
  const columns = [
    {
      title: 'Họ và tên',
      dataIndex: 'name',
      key: 'name',
      width: 220,
      render: (name, record) => (
        <div>
          <Text strong style={{ color: record.status === 'Đã khóa' ? '#94A3B8' : undefined }}>
            {name}
          </Text>
          <div style={{ fontSize: 11, color: '#64748B' }}>Mã: {record.id}</div>
        </div>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email) => <Text style={{ color: '#94A3B8' }}>{email}</Text>,
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      width: 200,
      render: (role) => {
        let color = 'blue';
        if (role === 'Quản trị hệ thống') color = 'purple';
        if (role === 'Vận hành kỹ thuật') color = 'cyan';
        if (role === 'CSKH/Support') color = 'orange';
        if (role === 'Sales') color = 'green';
        return <Tag color={color}>{role}</Tag>;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 160,
      render: (status) => {
        const isAct = status === 'Đang hoạt động';
        return (
          <Badge
            status={isAct ? 'success' : 'error'}
            text={
              <span style={{ color: isAct ? '#3DD68C' : '#F97066', fontWeight: 500 }}>
                {status}
              </span>
            }
          />
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 80,
      align: 'center',
      render: (_, record) => {
        const menuItems = [
          {
            key: 'edit',
            icon: <Edit size={14} />,
            label: 'Sửa',
            onClick: () => {
              setEditingEmployee(record);
              setModalOpen(true);
            },
          },
          {
            type: 'divider',
          },
          {
            key: 'delete',
            icon: <Trash2 size={14} />,
            label: 'Xóa',
            danger: true,
            onClick: () => handleDeleteEmployee(record),
          },
        ];

        return (
          <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
            <Button
              type="text"
              size="small"
              icon={<MoreVertical size={16} />}
              style={{ color: '#94A3B8' }}
              title="Thao tác"
            />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>
            Danh sách nhân viên vận hành
          </Title>
          <Text type="secondary">
            Quản lý danh sách tài khoản nội bộ và phân quyền truy cập chức năng Admin Console
          </Text>
        </div>
        <Space>
          <Tag color="blue" style={{ fontSize: 13, padding: '4px 10px', borderRadius: 6 }}>
            MH-MA1-03
          </Tag>
          <Button
            type="primary"
            icon={<UserPlus size={16} />}
            onClick={() => {
              setEditingEmployee(null);
              setModalOpen(true);
            }}
            style={{ backgroundColor: '#0B72E7', borderRadius: 8, fontWeight: 500 }}
          >
            Thêm mới
          </Button>
        </Space>
      </div>

      {/* Main Table Card */}
      <Card style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        {/* Thanh công cụ Tìm kiếm & Bộ lọc (Item 2, 3, 4) */}
        <div style={{ marginBottom: 18 }}>
          <Row gutter={[12, 12]} align="middle">
            {/* STT 2: Ô tìm theo tên, email (debounce ~300ms) */}
            <Col xs={24} md={12} lg={10}>
              <Input
                placeholder="Tìm theo tên, email..."
                prefix={<Search size={16} style={{ color: '#94A3B8', marginRight: 4 }} />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
                maxLength={100}
              />
            </Col>

            {/* STT 3: Dropdown Lọc Trạng thái */}
            <Col xs={12} md={6} lg={5}>
              <Select
                value={filterStatus}
                onChange={(val) => {
                  setFilterStatus(val);
                  setCurrentPage(1);
                }}
                style={{ width: '100%' }}
                options={[
                  { value: 'all', label: 'Trạng thái: Tất cả' },
                  { value: 'Đang hoạt động', label: 'Đang hoạt động' },
                  { value: 'Đã khóa', label: 'Đã khóa' },
                ]}
              />
            </Col>

            {/* STT 4: Dropdown Lọc Role */}
            <Col xs={12} md={6} lg={5}>
              <Select
                value={filterRole}
                onChange={(val) => {
                  setFilterRole(val);
                  setCurrentPage(1);
                }}
                style={{ width: '100%' }}
                options={[
                  { value: 'all', label: 'Role: Tất cả' },
                  ...ROLE_OPTIONS.map((r) => ({
                    value: r.value,
                    label: r.value,
                  })),
                ]}
              />
            </Col>

            {/* Nút reset filter & reset mock data */}
            <Col xs={24} lg={4} style={{ textAlign: 'right' }}>
              <Button
                type="text"
                size="small"
                icon={<RotateCcw size={14} />}
                onClick={() => {
                  setSearchText('');
                  setFilterStatus('all');
                  setFilterRole('all');
                  setCurrentPage(1);
                }}
                style={{ color: '#94A3B8' }}
              >
                Xóa bộ lọc
              </Button>
            </Col>
          </Row>
        </div>

        {/* Bảng dữ liệu nhân viên (Item 5, 6, 7) */}
        <Table
          dataSource={filteredEmployees}
          columns={columns}
          rowKey="id"
          loading={loading}
          bordered
          size="middle"
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: filteredEmployees.length,
            onChange: (page) => setCurrentPage(page),
            showTotal: (total, range) => (
              <span style={{ color: '#94A3B8', fontSize: 13 }}>
                Trang {currentPage}/{Math.ceil(total / pageSize) || 1} · {total} tài khoản · 20 dòng/trang
              </span>
            ),
          }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span style={{ color: '#94A3B8' }}>
                    Không tìm thấy tài khoản nào khớp. (MSG-01)
                  </span>
                }
              />
            ),
          }}
        />
      </Card>

      {/* Modal Form Thêm/Sửa Nhân viên (MH-MA1-04) */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>
              {editingEmployee
                ? 'Sửa tài khoản nhân viên vận hành'
                : 'Thêm tài khoản nhân viên vận hành'}
            </span>
            <Tag color="blue">MH-MA1-04</Tag>
          </div>
        }
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditingEmployee(null);
        }}
        footer={null}
        destroyOnClose
        width={560}
      >
        <EmployeeForm
          employee={editingEmployee}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setModalOpen(false);
            setEditingEmployee(null);
          }}
        />
      </Modal>
    </div>
  );
}
