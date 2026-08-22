// Mã màn hình: MH-MT2-01 (Cấu trúc tài sản: Khu vực / Tòa nhà / Tầng / Phòng — Asset Tree)
// Dựa theo FN-MT2-01 & UC-MT2-01, UC-MT2-02, UC-MT2-03 trong SmartSite_Function_List_v9 & SmartSite_IoT_UseCase_List_v5
import React, { useState, useMemo } from 'react';
import {
  Card,
  Typography,
  Space,
  Tag,
  Button,
  Table,
  Modal,
  Form,
  Input,
  Select,
  Row,
  Col,
  Tooltip,
  Badge,
  Empty,
  message,
  Divider,
  Alert,
} from 'antd';
import {
  Building2,
  Plus,
  Edit,
  Trash2,
  Layers,
  MapPin,
  DoorOpen,
  FolderTree,
  Search,
  Navigation,
  Info,
  AlertTriangle,
} from 'lucide-react';
import { tenantPortalService } from '../../../mock/tenantPortalService';
import { useTheme } from '../../../theme/ThemeContext';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

export default function TenantAssetList() {
  const { isDark } = useTheme();
  const [assetTree, setAssetTree] = useState(tenantPortalService.getAssetTree());
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [editingItem, setEditingItem] = useState(null);
  const [selectedAssetType, setSelectedAssetType] = useState('building');
  const [form] = Form.useForm();

  // Helper lấy toàn bộ ID của các nút có nút con
  const getAllParentKeys = (nodes) => {
    let keys = [];
    nodes.forEach((n) => {
      if (n.children && n.children.length > 0) {
        keys.push(n.id);
        keys = keys.concat(getAllParentKeys(n.children));
      }
    });
    return keys;
  };

  // Quản lý state mở rộng độc lập từng nhánh cây (Fix lỗi thu nhỏ 1 nhánh làm sập toàn bộ)
  const [expandedRowKeys, setExpandedRowKeys] = useState(() =>
    getAllParentKeys(tenantPortalService.getAssetTree())
  );

  const handleExpandAll = () => {
    setExpandedRowKeys(getAllParentKeys(assetTree));
  };

  const handleCollapseAll = () => {
    setExpandedRowKeys([]);
  };

  // Lọc cây cấu trúc nếu có từ khóa tìm kiếm
  const visibleAssetTree = useMemo(() => {
    if (!searchText.trim()) return assetTree;
    const term = searchText.toLowerCase().trim();

    const filterNodes = (nodes) => {
      return nodes
        .map((node) => {
          const matchSelf =
            node.name.toLowerCase().includes(term) ||
            (node.address && node.address.toLowerCase().includes(term)) ||
            (node.code && node.code.toLowerCase().includes(term));

          const filteredChildren = node.children ? filterNodes(node.children) : [];

          if (matchSelf || filteredChildren.length > 0) {
            return {
              ...node,
              children: filteredChildren.length > 0 ? filteredChildren : node.children,
            };
          }
          return null;
        })
        .filter(Boolean);
    };

    return filterNodes(assetTree);
  }, [assetTree, searchText]);

  // Mở Modal Thêm mới (UC-MT2-01)
  const handleOpenCreateModal = (parentItem = null) => {
    setModalMode('create');
    setEditingItem(null);
    form.resetFields();

    if (parentItem) {
      if (parentItem.type === 'region') {
        setSelectedAssetType('building');
        form.setFieldsValue({ type: 'building', parentId: parentItem.id });
      } else if (parentItem.type === 'building') {
        setSelectedAssetType('floor');
        form.setFieldsValue({ type: 'floor', parentId: parentItem.id });
      } else if (parentItem.type === 'floor') {
        setSelectedAssetType('room');
        form.setFieldsValue({ type: 'room', parentId: parentItem.id });
      }
    } else {
      setSelectedAssetType('region');
      form.setFieldsValue({ type: 'region' });
    }

    setModalVisible(true);
  };

  // Mở Modal Sửa (UC-MT2-02)
  const handleOpenEditModal = (item) => {
    setModalMode('edit');
    setEditingItem(item);
    setSelectedAssetType(item.type);
    form.setFieldsValue({
      name: item.name,
      type: item.type,
      description: item.description || '',
      address: item.address || '',
      coordinates: item.coordinates || '',
      parentId: item.parentId || '',
    });
    setModalVisible(true);
  };

  // Lưu Form Thêm / Sửa (Quy tắc 1: Form dùng chung Thêm-Sửa)
  const handleSaveAsset = (values) => {
    // Validate BR-T25: Building bắt buộc có tọa độ hoặc địa chỉ
    if (values.type === 'building' && !values.address?.trim() && !values.coordinates?.trim()) {
      form.setFields([
        {
          name: 'address',
          errors: ['Tòa nhà bắt buộc có địa chỉ hoặc tọa độ GPS để hiển thị Bản đồ (BR-T25).'],
        },
      ]);
      message.error('Tòa nhà bắt buộc có địa chỉ hoặc tọa độ GPS để hiển thị Bản đồ (BR-T25).');
      return;
    }

    // Validate BR-T23: Building bắt buộc chọn Khu vực cha
    if (values.type === 'building' && !values.parentId) {
      form.setFields([
        {
          name: 'parentId',
          errors: ['Tòa nhà bắt buộc thuộc 1 Khu vực quản lý (BR-T23).'],
        },
      ]);
      message.error('Vui lòng chọn Khu vực cha cho Tòa nhà.');
      return;
    }

    if (modalMode === 'create') {
      // UC-MT2-01: Tạo cấu trúc mới
      const newId = `AST-${Date.now().toString().slice(-4)}`;
      const newItem = {
        id: newId,
        key: newId,
        name: values.name,
        type: values.type,
        description: values.description,
        address: values.address,
        coordinates: values.coordinates,
        parentId: values.parentId,
        deviceCount: 0,
        children: values.type === 'room' ? undefined : [],
      };

      // Thêm vào tree
      if (!values.parentId || values.type === 'region') {
        setAssetTree((prev) => [...prev, newItem]);
      } else {
        const updateChildren = (nodes) => {
          return nodes.map((node) => {
            if (node.id === values.parentId) {
              return {
                ...node,
                children: [...(node.children || []), newItem],
              };
            }
            if (node.children) {
              return { ...node, children: updateChildren(node.children) };
            }
            return node;
          });
        };
        setAssetTree(updateChildren(assetTree));
      }

      message.success(`Tạo mới ${values.name} thành công. (UC-MT2-01)`);
    } else {
      // UC-MT2-02: Sửa cấu trúc
      const updateNode = (nodes) => {
        return nodes.map((node) => {
          if (node.id === editingItem.id) {
            return {
              ...node,
              name: values.name,
              description: values.description,
              address: values.address,
              coordinates: values.coordinates,
            };
          }
          if (node.children) {
            return { ...node, children: updateNode(node.children) };
          }
          return node;
        });
      };
      setAssetTree(updateNode(assetTree));
      message.success(`Cập nhật thông tin ${values.name} thành công. (UC-MT2-02)`);
    }

    setModalVisible(false);
    form.resetFields();
  };

  // Xóa cấu trúc (UC-MT2-03: Cascade xóa cấp con & thiết bị bên trong - BR-T07, gỡ quyền User-Room - BR-T20)
  const handleDeleteAsset = (record) => {
    Modal.confirm({
      title: `Xác nhận xóa "${record.name}"?`,
      icon: <AlertTriangle size={20} style={{ color: '#DC2626' }} />,
      content: (
        <div>
          <Paragraph style={{ margin: '8px 0' }}>
            Hành động này sẽ <strong>cascade xóa toàn bộ cấp con</strong> (Tầng/Phòng) và <strong>toàn bộ {record.deviceCount || 0} thiết bị IoT</strong> trực thuộc bên trong (<strong>BR-T07</strong>).
          </Paragraph>
          {record.type === 'room' && (
            <Alert
              type="warning"
              showIcon
              message="Gỡ quyền phân quyền nhân viên (BR-T20)"
              description="Toàn bộ phân quyền của nhân viên gắn với Phòng này sẽ tự động bị thu hồi."
              style={{ marginTop: 8 }}
            />
          )}
        </div>
      ),
      okText: 'Xác nhận xóa',
      okType: 'danger',
      onOk() {
        const deleteFromTree = (nodes) => {
          return nodes
            .filter((n) => n.id !== record.id)
            .map((n) => ({
              ...n,
              children: n.children ? deleteFromTree(n.children) : undefined,
            }));
        };
        setAssetTree(deleteFromTree(assetTree));
        message.success(`Đã xóa ${record.name} và các tài nguyên trực thuộc. (UC-MT2-03)`);
      },
    });
  };

  const columns = [
    {
      title: 'Tên Không Gian / Cấu Trúc Tài Sản',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => {
        let icon = <MapPin size={16} style={{ color: '#0B72E7' }} />;
        if (record.type === 'building') icon = <Building2 size={16} style={{ color: '#10B981' }} />;
        if (record.type === 'floor') icon = <Layers size={16} style={{ color: '#8B5CF6' }} />;
        if (record.type === 'room') icon = <DoorOpen size={16} style={{ color: '#06B6D4' }} />;

        return (
          <Space size={8}>
            {icon}
            <div>
              <Text strong style={{ fontSize: 13 }}>{name}</Text>
              {record.address && (
                <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
                  📍 {record.address} {record.coordinates ? `(${record.coordinates})` : ''}
                </Text>
              )}
            </div>
          </Space>
        );
      },
    },
    {
      title: 'Phân cấp',
      dataIndex: 'type',
      key: 'type',
      width: 140,
      render: (type) => {
        if (type === 'region') return <Tag color="blue">Khu vực (Region)</Tag>;
        if (type === 'building') return <Tag color="green">Tòa nhà (Building)</Tag>;
        if (type === 'floor') return <Tag color="purple">Tầng (Floor)</Tag>;
        return <Tag color="cyan">Phòng (Room)</Tag>;
      },
    },
    {
      title: 'Số Thiết bị IoT',
      dataIndex: 'deviceCount',
      key: 'deviceCount',
      width: 150,
      render: (c) => (c > 0 ? <Tag color="processing">{c} Thiết bị</Tag> : <Text type="secondary">—</Text>),
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 160,
      align: 'center',
      render: (_, record) => (
        <Space size={4}>
          {record.type !== 'room' && (
            <Tooltip title="Thêm cấp con">
              <Button
                type="text"
                size="small"
                icon={<Plus size={14} />}
                onClick={() => handleOpenCreateModal(record)}
                style={{ color: '#10B981' }}
              />
            </Tooltip>
          )}
          <Tooltip title="Sửa thông tin">
            <Button
              type="text"
              size="small"
              icon={<Edit size={14} />}
              onClick={() => handleOpenEditModal(record)}
              style={{ color: '#0B72E7' }}
            />
          </Tooltip>
          <Tooltip title="Xóa cấp này">
            <Button
              type="text"
              size="small"
              icon={<Trash2 size={14} />}
              danger
              onClick={() => handleDeleteAsset(record)}
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
            <FolderTree size={24} style={{ color: '#0B72E7' }} />
            <Title level={4} style={{ margin: 0 }}>
              Cấu Trúc Không Gian & Tài Sản (Asset Hierarchy)
            </Title>
          </Space>
          <Text type="secondary" style={{ fontSize: 13, display: 'block', marginTop: 2 }}>
            Quản lý phân cấp Khu vực → Tòa nhà → Tầng → Phòng làm nền tảng gán thiết bị và phân quyền nhân viên (MH-MT2-01)
          </Text>
        </div>

        <Space>
          <Tag color="blue" style={{ fontSize: 13, padding: '4px 10px', borderRadius: 6 }}>
            MH-MT2-01
          </Tag>
          <Button
            type="primary"
            icon={<Plus size={16} />}
            onClick={() => handleOpenCreateModal()}
            style={{ backgroundColor: '#0B72E7', borderRadius: 8, height: 38 }}
          >
            Thêm Cấu Trúc Mới
          </Button>
        </Space>
      </div>

      {/* Summary KPI Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 10 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>Khu vực quản lý</Text>
            <Title level={3} style={{ margin: '4px 0 0 0', color: '#0B72E7' }}>2</Title>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 10 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>Tòa nhà / Cơ sở</Text>
            <Title level={3} style={{ margin: '4px 0 0 0', color: '#10B981' }}>3</Title>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 10 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>Tầng / Phân khu</Text>
            <Title level={3} style={{ margin: '4px 0 0 0', color: '#8B5CF6' }}>8</Title>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 10 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>Phòng giám sát (Rooms)</Text>
            <Title level={3} style={{ margin: '4px 0 0 0', color: '#06B6D4' }}>24</Title>
          </Card>
        </Col>
      </Row>

      {/* Tree Table Card */}
      <Card style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <Input
            prefix={<Search size={16} style={{ color: '#9CA3AF' }} />}
            placeholder="Tìm kiếm không gian, tòa nhà, phòng..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ maxWidth: 320 }}
            allowClear
          />
          <Space>
            <Button size="small" onClick={handleExpandAll}>
              Mở rộng tất cả
            </Button>
            <Button size="small" onClick={handleCollapseAll}>
              Thu gọn tất cả
            </Button>
          </Space>
        </div>

        <Table
          rowKey="id"
          dataSource={visibleAssetTree}
          columns={columns}
          pagination={false}
          expandable={{
            expandedRowKeys: expandedRowKeys,
            onExpandedRowsChange: (keys) => setExpandedRowKeys(keys),
          }}
          bordered
          size="middle"
        />
      </Card>

      {/* Modal Thêm / Sửa Cấu trúc (Quy tắc 1: Form dùng chung) */}
      <Modal
        title={modalMode === 'create' ? 'Tạo Mới Cấp Cấu Trúc Tài Sản' : `Chỉnh Sửa — ${editingItem?.name}`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        okText={modalMode === 'create' ? 'Tạo mới' : 'Lưu thay đổi'}
        cancelText="Hủy"
        width={560}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveAsset}
          initialValues={{ type: 'building' }}
        >
          <Form.Item
            name="type"
            label={<span style={{ fontWeight: 600 }}>Cấp phân loại</span>}
            rules={[{ required: true }]}
          >
            <Select
              disabled={modalMode === 'edit'}
              onChange={(val) => setSelectedAssetType(val)}
            >
              <Option value="region">Khu vực (Region)</Option>
              <Option value="building">Tòa nhà (Building — Hiển thị Bản đồ)</Option>
              <Option value="floor">Tầng (Floor)</Option>
              <Option value="room">Phòng / Khu vực chức năng (Room)</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="name"
            label={<span style={{ fontWeight: 600 }}>Tên cấu trúc (Unique theo cấp cha — BR-T35)</span>}
            rules={[{ required: true, message: 'Vui lòng nhập tên cấu trúc!' }]}
          >
            <Input placeholder="Ví dụ: Nhà ga Hành khách T2, Phòng Máy Chủ..." />
          </Form.Item>

          {selectedAssetType === 'building' && (
            <>
              <Form.Item
                name="parentId"
                label={<span style={{ fontWeight: 600 }}>Khu vực cha (Bắt buộc — BR-T23)</span>}
                rules={[{ required: true, message: 'Tòa nhà bắt buộc thuộc 1 Khu vực!' }]}
              >
                <Select placeholder="Chọn Khu vực trực thuộc">
                  <Option value="REG-01">Khu vực Miền Bắc (Hà Nội)</Option>
                  <Option value="REG-02">Khu vực Miền Nam (TP.HCM)</Option>
                </Select>
              </Form.Item>

              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item
                    name="coordinates"
                    label={<span style={{ fontWeight: 600 }}>Tọa độ GPS (Lat, Lng)</span>}
                  >
                    <Input placeholder="Ví dụ: 21.2212, 105.8072" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="address"
                    label={<span style={{ fontWeight: 600 }}>Địa chỉ hiển thị (BR-T25)</span>}
                  >
                    <Input placeholder="Sân bay Quốc tế Nội Bài" />
                  </Form.Item>
                </Col>
              </Row>
            </>
          )}

          {selectedAssetType === 'floor' && (
            <Form.Item
              name="parentId"
              label={<span style={{ fontWeight: 600 }}>Tòa nhà cha</span>}
              rules={[{ required: true, message: 'Vui lòng chọn Tòa nhà trực thuộc!' }]}
            >
              <Select placeholder="Chọn Tòa nhà">
                <Option value="BLD-01">Nhà ga Hành khách T2</Option>
                <Option value="BLD-02">Nhà ga Hàng hóa ALS Cargo</Option>
                <Option value="BLD-03">Nhà ga Quốc nội T1</Option>
              </Select>
            </Form.Item>
          )}

          {selectedAssetType === 'room' && (
            <Form.Item
              name="parentId"
              label={<span style={{ fontWeight: 600 }}>Tầng trực thuộc</span>}
              rules={[{ required: true, message: 'Vui lòng chọn Tầng trực thuộc!' }]}
            >
              <Select placeholder="Chọn Tầng">
                <Option value="FLR-01">Tầng 1 — Sảnh Đến Quốc Tế</Option>
                <Option value="FLR-02">Tầng 2 — Phòng Kỹ Thuật & Server</Option>
                <Option value="FLR-03">Tầng 3 — Khu Vực Cách Ly</Option>
              </Select>
            </Form.Item>
          )}

          <Form.Item
            name="description"
            label={<span style={{ fontWeight: 600 }}>Mô tả bổ sung</span>}
          >
            <Input.TextArea rows={2} placeholder="Ghi chú thêm về không gian này..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
