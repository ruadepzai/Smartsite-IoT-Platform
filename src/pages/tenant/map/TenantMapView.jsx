// Mã màn hình: MH-MT2-04 (Bản đồ Giám sát Thiết bị IoT GIS — Bản đồ Việt Nam Thực tế)
// Dựa theo FN-MT2-05, FN-MT2-06, FN-MT2-07 & UC-MT2-09 trong SmartSite_Function_List_v9 & SmartSite_IoT_UseCase_List_v5
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Card,
  Typography,
  Space,
  Tag,
  Button,
  Select,
  Row,
  Col,
  Badge,
  Drawer,
  Table,
  Radio,
  Tooltip,
  Empty,
  Divider,
} from 'antd';
import {
  MapPin,
  Building2,
  Cpu,
  Filter,
  RotateCcw,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Info,
  Layers,
  Search,
  User,
  ZoomIn,
  ZoomOut,
  Crosshair,
  ExternalLink,
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { tenantPortalService } from '../../../mock/tenantPortalService';
import { useTheme } from '../../../theme/ThemeContext';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

// Danh sách các Tòa nhà / Điểm giám sát với Tọa độ GPS Việt Nam thực tế
const VIETNAM_BUILDINGS = [
  {
    id: 'BLD-01',
    name: 'Nhà ga Quốc tế T2 — Sân bay Nội Bài',
    code: 'T2-HAN-INTL',
    region: 'Khu vực Miền Bắc',
    address: 'Xã Phú Minh, Huyện Sóc Sơn, TP. Hà Nội',
    lat: 21.2212,
    lng: 105.8072,
    status: 'warning', // Có cảnh báo
    deviceCount: 142,
    onlineCount: 138,
    warningCount: 4,
    criticalCount: 0,
    rooms: ['Phòng Kỹ thuật Điện & HVAC (RM-101)', 'Phòng Server Cảng HK (RM-302)', 'Sảnh Check-in Quốc tế'],
  },
  {
    id: 'BLD-02',
    name: 'Nhà ga Hàng hóa ALS Cargo Nội Bài',
    code: 'ALS-CARGO-HAN',
    region: 'Khu vực Miền Bắc',
    address: 'Khu Công nghiệp Nội Bài, Sóc Sơn, Hà Nội',
    lat: 21.2268,
    lng: 105.8125,
    status: 'normal', // Bình thường
    deviceCount: 88,
    onlineCount: 88,
    warningCount: 0,
    criticalCount: 0,
    rooms: ['Kho Lạnh Âm sâu -20°C (RM-C01)', 'Khu Phân loại Tự động (RM-C02)'],
  },
  {
    id: 'BLD-03',
    name: 'Nhà ga Quốc nội T1 — Sân bay Tân Sơn Nhất',
    code: 'T1-SGN-DOM',
    region: 'Khu vực Miền Nam',
    address: 'Đường Trường Sơn, Phường 2, Quận Tân Bình, TP. Hồ Chí Minh',
    lat: 10.8185,
    lng: 106.6588,
    status: 'critical', // Báo động khẩn cấp
    deviceCount: 165,
    onlineCount: 158,
    warningCount: 5,
    criticalCount: 2,
    rooms: ['Trung tâm Điều hành TOC (RM-TOC)', 'Sảnh Ga Đến Quốc Nội', 'Trạm Bơm Cứu Hỏa T1'],
  },
  {
    id: 'BLD-04',
    name: 'Nhà ga Quốc tế T2 — Sân bay Đà Nẵng',
    code: 'T2-DAD-INTL',
    region: 'Khu vực Miền Trung',
    address: 'Đường Duy Tân, Phường Hòa Thuận Tây, Quận Hải Châu, TP. Đà Nẵng',
    lat: 16.0544,
    lng: 108.2022,
    status: 'normal',
    deviceCount: 95,
    onlineCount: 95,
    warningCount: 0,
    criticalCount: 0,
    rooms: ['Phòng Giám sát An ninh Hàng không', 'Khu vực Băng chuyền Hành lý'],
  },
  {
    id: 'BLD-05',
    name: 'Cảng Hàng không Quốc tế Cần Thơ',
    code: 'VCA-AIRPORT',
    region: 'Khu vực Miền Nam',
    address: '179B Đường Lê Hồng Phong, Quận Bình Thủy, TP. Cần Thơ',
    lat: 10.0851,
    lng: 105.7119,
    status: 'normal',
    deviceCount: 54,
    onlineCount: 53,
    warningCount: 1,
    criticalCount: 0,
    rooms: ['Đài Kiểm soát Không lưu Cần Thơ', 'Trạm Khí tượng Sân bay'],
  },
];

export default function TenantMapView() {
  const { isDark } = useTheme();
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);

  // Phân quyền Role (AT-03 thấy toàn bộ vs AT-04 chỉ thấy Tòa nhà có Room gán - AF-01)
  const [currentRoleView, setCurrentRoleView] = useState('AT-03');

  // Lọc danh sách Tòa nhà
  const filteredBuildings = useMemo(() => {
    return VIETNAM_BUILDINGS.filter((b) => {
      // AF-01: Tenant User (AT-04) chỉ thấy tòa nhà có phòng được gán
      if (currentRoleView === 'AT-04') {
        const allowedBuildingCodes = ['T2-HAN-INTL', 'ALS-CARGO-HAN'];
        if (!allowedBuildingCodes.includes(b.code)) return false;
      }

      if (selectedRegion !== 'ALL' && b.region !== selectedRegion) return false;
      if (selectedStatus !== 'ALL' && b.status !== selectedStatus) return false;
      return true;
    });
  }, [selectedRegion, selectedStatus, currentRoleView]);

  // Khởi tạo và quản lý Bản đồ Leaflet với Nguồn bản đồ Quốc tế chuẩn CartoDB (Voyager cho Light mode, Dark Matter cho Dark mode)
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Khởi tạo Map căn giữa bản đồ Việt Nam (tọa độ Đà Nẵng: 16.047, 108.206, zoom 6)
      const map = L.map(mapContainerRef.current, {
        center: [16.047079, 108.20623],
        zoom: 6,
        zoomControl: false,
        attributionControl: false,
      });

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Tile Layer: Sử dụng CartoDB Quốc tế trung lập (chuẩn OpenStreetMap & CARTO US/EU - Không chứa đường ranh giới phi pháp)
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    const tileUrl = isDark
      ? 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png';

    const tileLayer = L.tileLayer(tileUrl, {
      maxZoom: 19,
      subdomains: 'abcd',
    });
    tileLayer.addTo(map);

    // Kích hoạt invalidateSize để tránh lỗi ô gạch màu xám khi chuyển theme hoặc mở lại tab
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    // Cập nhật Markers trên bản đồ: Chỉ hiển thị các Cơ sở & Tòa nhà giám sát IoT
    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];

    filteredBuildings.forEach((b) => {
      let pinColor = '#10B981'; // normal: green
      let glowColor = 'rgba(16, 185, 129, 0.4)';
      let statusText = 'Hoạt động tốt';

      if (b.status === 'warning') {
        pinColor = '#F59E0B'; // warning: orange
        glowColor = 'rgba(245, 158, 11, 0.4)';
        statusText = 'Có cảnh báo';
      } else if (b.status === 'critical') {
        pinColor = '#EF4444'; // critical: red
        glowColor = 'rgba(239, 68, 68, 0.5)';
        statusText = 'Báo động khẩn cấp';
      }

      // Tạo Custom Pin Icon với SVG và hiệu ứng nhấp nháy pulse
      const customIcon = L.divIcon({
        className: 'custom-gis-pin',
        html: `
          <div style="
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          ">
            <div style="
              position: absolute;
              width: 38px;
              height: 38px;
              border-radius: 50%;
              background: ${glowColor};
              animation: pulseGlow 2s infinite ease-in-out;
            "></div>
            <div style="
              width: 32px;
              height: 32px;
              border-radius: 50%;
              background: ${pinColor};
              border: 2.5px solid #FFFFFF;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #FFFFFF;
              font-weight: 700;
              font-size: 11px;
              box-shadow: 0 4px 10px rgba(0,0,0,0.3);
              z-index: 10;
            ">
              ${b.deviceCount}
            </div>
            <div style="
              position: absolute;
              bottom: -6px;
              width: 0;
              height: 0;
              border-left: 6px solid transparent;
              border-right: 6px solid transparent;
              border-top: 8px solid ${pinColor};
              z-index: 9;
            "></div>
          </div>
        `,
        iconSize: [38, 44],
        iconAnchor: [19, 44],
      });

      const marker = L.marker([b.lat, b.lng], { icon: customIcon }).addTo(map);

      // Popup khi hover/click
      marker.bindTooltip(
        `<strong>${b.name}</strong><br/><span style="color:${pinColor}">● ${statusText}</span> (${b.onlineCount}/${b.deviceCount} Online)`,
        { direction: 'top', offset: [0, -40] }
      );

      marker.on('click', () => {
        setSelectedBuilding(b);
        setDrawerVisible(true);
        map.flyTo([b.lat, b.lng], 14, { duration: 1.2 });
      });

      markersRef.current.push(marker);
    });

    return () => clearTimeout(timer);
  }, [filteredBuildings, isDark]);

  // FN-MT2-07: Quay về vị trí mặc định toàn Việt Nam
  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([16.047079, 108.20623], 6, { duration: 1 });
    }
  };

  // Zoom tới 1 tòa nhà khi bấm vào thẻ trong danh sách bên trái
  const handleFlyToBuilding = (b) => {
    setSelectedBuilding(b);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([b.lat, b.lng], 15, { duration: 1.2 });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header trang */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Space size={8} align="center">
            <MapPin size={24} style={{ color: '#0B72E7' }} />
            <Title level={4} style={{ margin: 0 }}>
              Bản Đồ Điểm Giám Sát IoT (GIS Facility Map)
            </Title>
          </Space>
          <Text type="secondary" style={{ fontSize: 13, display: 'block', marginTop: 2 }}>
            Bản đồ GIS Việt Nam hiển thị trực quan tình trạng vận hành thiết bị tại các Tòa nhà theo tọa độ GPS (MH-MT2-04)
          </Text>
        </div>

        <Space>
          <Tag color="blue" style={{ fontSize: 13, padding: '4px 10px', borderRadius: 6 }}>
            MH-MT2-04
          </Tag>
        </Space>
      </div>

      {/* Bộ lọc & Điều khiển bản đồ */}
      <Card style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <Row gutter={[16, 16]} align="middle" justify="space-between">
          <Col xs={24} xl={14}>
            <Space wrap>
              {/* Role Switcher Demo */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: isDark ? '#1F2937' : '#F3F4F6', padding: '4px 10px', borderRadius: 8 }}>
                <User size={14} style={{ color: '#0B72E7' }} />
                <Text style={{ fontSize: 12 }}>Quyền xem (AF-01):</Text>
                <Radio.Group
                  size="small"
                  value={currentRoleView}
                  onChange={(e) => setCurrentRoleView(e.target.value)}
                >
                  <Radio.Button value="AT-03">Admin (Toàn quốc)</Radio.Button>
                  <Radio.Button value="AT-04">User (Room gán)</Radio.Button>
                </Radio.Group>
              </div>

              <Select
                value={selectedRegion}
                onChange={setSelectedRegion}
                style={{ width: 170 }}
              >
                <Option value="ALL">Toàn bộ Khu vực</Option>
                <Option value="Khu vực Miền Bắc">Khu vực Miền Bắc</Option>
                <Option value="Khu vực Miền Trung">Khu vực Miền Trung</Option>
                <Option value="Khu vực Miền Nam">Khu vực Miền Nam</Option>
              </Select>

              <Select
                value={selectedStatus}
                onChange={setSelectedStatus}
                style={{ width: 170 }}
              >
                <Option value="ALL">Tất cả trạng thái</Option>
                <Option value="normal">Hoạt động bình thường</Option>
                <Option value="warning">Có cảnh báo (Warning)</Option>
                <Option value="critical">Báo động (Critical)</Option>
              </Select>
            </Space>
          </Col>

          <Col xs={24} xl={10} style={{ textAlign: 'right' }}>
            <Space size={14} wrap style={{ justifyContent: 'flex-end', width: '100%' }}>
              <Button
                icon={<RotateCcw size={15} />}
                onClick={handleResetView}
                style={{ borderRadius: 8, height: 34 }}
              >
                Về Vị Trí Mặc Định
              </Button>

              <Space size={12}>
                <Space size={5}>
                  <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#10B981', display: 'inline-block' }}></span>
                  <Text style={{ fontSize: 11 }}>Bình thường</Text>
                </Space>
                <Space size={5}>
                  <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#F59E0B', display: 'inline-block' }}></span>
                  <Text style={{ fontSize: 11 }}>Cảnh báo</Text>
                </Space>
                <Space size={5}>
                  <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#EF4444', display: 'inline-block' }}></span>
                  <Text style={{ fontSize: 11 }}>Báo động</Text>
                </Space>
              </Space>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Khung Bản Đồ GIS Thực Tế (Bên Trái) & Danh Sách Tòa Nhà (Bên Phải) */}
      <Row gutter={[16, 16]}>
        {/* Cột Bản Đồ Leaflet GIS bên trái */}
        <Col xs={24} lg={16}>
          <Card
            bodyStyle={{ padding: 0 }}
            style={{
              borderRadius: 12,
              height: 600,
              overflow: 'hidden',
              position: 'relative',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            {/* Div chứa bản đồ Leaflet */}
            <div
              ref={mapContainerRef}
              style={{
                width: '100%',
                height: 600,
                background: isDark ? '#0B0F19' : '#E2E8F0',
              }}
            />

            {/* Keyframe animation cho Pin pulse */}
            <style>{`
              @keyframes pulseGlow {
                0% { transform: scale(0.9); opacity: 0.8; }
                50% { transform: scale(1.35); opacity: 0.15; }
                100% { transform: scale(0.9); opacity: 0.8; }
              }
              .leaflet-container {
                font-family: inherit;
              }
            `}</style>

            {/* Overlay Attribution Badge */}
            <div
              style={{
                position: 'absolute',
                bottom: 10,
                right: 10,
                background: 'rgba(0,0,0,0.65)',
                padding: '3px 8px',
                borderRadius: 4,
                color: '#FFFFFF',
                fontSize: 10,
                zIndex: 1000,
              }}
            >
              © CARTO • OpenStreetMap • SmartSite GIS Vietnam
            </div>
          </Card>
        </Col>

        {/* Cột Danh sách Tòa nhà bên phải */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <Building2 size={16} style={{ color: '#0B72E7' }} />
                <span>Cơ sở & Tòa nhà ({filteredBuildings.length})</span>
              </Space>
            }
            style={{ borderRadius: 12, height: 600, overflow: 'auto' }}
          >
            {filteredBuildings.length === 0 ? (
              <Empty description="Không có điểm giám sát phù hợp với bộ lọc (AF-02)." style={{ marginTop: 80 }} />
            ) : (
              <Space direction="vertical" size={12} style={{ width: '100%' }}>
                {filteredBuildings.map((b) => {
                  const isSelected = selectedBuilding?.id === b.id;
                  let badgeColor = '#10B981';
                  let statusLabel = 'Bình thường';
                  if (b.status === 'warning') {
                    badgeColor = '#F59E0B';
                    statusLabel = 'Cảnh báo';
                  } else if (b.status === 'critical') {
                    badgeColor = '#EF4444';
                    statusLabel = 'Báo động khẩn';
                  }

                  return (
                    <div
                      key={b.id}
                      onClick={() => handleFlyToBuilding(b)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 10,
                        border: `1.5px solid ${isSelected ? '#0B72E7' : isDark ? '#374151' : '#E5E7EB'}`,
                        background: isSelected
                          ? isDark ? '#1E293B' : '#EFF6FF'
                          : isDark ? '#111827' : '#FFFFFF',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text strong style={{ fontSize: 13, color: isSelected ? '#0B72E7' : undefined }}>
                          {b.name}
                        </Text>
                        <Tag color={b.status === 'normal' ? 'success' : b.status === 'warning' ? 'warning' : 'error'} style={{ margin: 0, fontSize: 11 }}>
                          {statusLabel}
                        </Tag>
                      </div>

                      <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 4 }}>
                        📍 {b.address}
                      </Text>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, fontSize: 12 }}>
                        <Space size={4}>
                          <Cpu size={14} style={{ color: '#0B72E7' }} />
                          <Text style={{ fontSize: 11 }}>{b.onlineCount}/{b.deviceCount} Thiết bị Online</Text>
                        </Space>
                        <Button
                          type="link"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBuilding(b);
                            setDrawerVisible(true);
                          }}
                          style={{ padding: 0, fontSize: 11 }}
                        >
                          Chi tiết &gt;
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </Space>
            )}
          </Card>
        </Col>
      </Row>

      {/* Drawer Xem Nhanh Chi Tiết Tòa Nhà & Thiết Bị (UC-MT2-09 Bước 4) */}
      <Drawer
        title={
          <Space>
            <Building2 size={18} style={{ color: '#0B72E7' }} />
            <span>{selectedBuilding?.name}</span>
          </Space>
        }
        placement="right"
        width={540}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      >
        {selectedBuilding && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Thông tin tọa độ GPS */}
            <Card size="small" style={{ borderRadius: 8 }}>
              <Row gutter={12}>
                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Tọa độ GPS (BR-T25):</Text>
                  <Text strong style={{ display: 'block', fontSize: 12 }}>{selectedBuilding.lat}° N, {selectedBuilding.lng}° E</Text>
                </Col>
                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Khu vực trực thuộc:</Text>
                  <Text strong style={{ display: 'block', fontSize: 12 }}>{selectedBuilding.region}</Text>
                </Col>
              </Row>
              <Divider style={{ margin: '8px 0' }} />
              <Text type="secondary" style={{ fontSize: 12 }}>Địa chỉ thực tế:</Text>
              <Text style={{ display: 'block', fontSize: 12 }}>{selectedBuilding.address}</Text>
            </Card>

            {/* Các phòng trực thuộc */}
            <div>
              <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>
                Các Không Gian / Phòng Trực Thuộc ({selectedBuilding.rooms.length}):
              </Text>
              <Space wrap>
                {selectedBuilding.rooms.map((rm, idx) => (
                  <Tag key={idx} color="blue" style={{ borderRadius: 4, padding: '3px 8px' }}>
                    {rm}
                  </Tag>
                ))}
              </Space>
            </div>

            {/* Tình trạng thiết bị */}
            <div>
              <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>
                Thống Kê Thiết Bị Vận Hành:
              </Text>
              <Row gutter={8}>
                <Col span={8}>
                  <Card size="small" style={{ textAlign: 'center', borderRadius: 8 }}>
                    <Text type="secondary" style={{ fontSize: 11 }}>Tổng thiết bị</Text>
                    <Title level={4} style={{ margin: '2px 0 0 0', color: '#0B72E7' }}>{selectedBuilding.deviceCount}</Title>
                  </Card>
                </Col>
                <Col span={8}>
                  <Card size="small" style={{ textAlign: 'center', borderRadius: 8 }}>
                    <Text type="secondary" style={{ fontSize: 11 }}>Online</Text>
                    <Title level={4} style={{ margin: '2px 0 0 0', color: '#10B981' }}>{selectedBuilding.onlineCount}</Title>
                  </Card>
                </Col>
                <Col span={8}>
                  <Card size="small" style={{ textAlign: 'center', borderRadius: 8 }}>
                    <Text type="secondary" style={{ fontSize: 11 }}>Cảnh báo</Text>
                    <Title level={4} style={{ margin: '2px 0 0 0', color: selectedBuilding.criticalCount > 0 ? '#DC2626' : '#F59E0B' }}>
                      {selectedBuilding.warningCount + selectedBuilding.criticalCount}
                    </Title>
                  </Card>
                </Col>
              </Row>
            </div>

            <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
              <Button
                type="primary"
                block
                style={{ backgroundColor: '#0B72E7', borderRadius: 8 }}
                onClick={() => {
                  setDrawerVisible(false);
                  window.location.href = '/tenant/devices';
                }}
              >
                Xem Danh Sách Thiết Bị Tại Đây
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
