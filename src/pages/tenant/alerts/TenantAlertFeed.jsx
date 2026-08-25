// Mã màn hình: MH-MT3-06 (Feed Lịch Sử & Nhật Ký Xử Lý Cảnh Báo — Tenant Portal)
// Dựa theo FN-MT3-08 & UC-MT3-08 trong SmartSite_Function_List_v9 & SmartSite_IoT_UseCase_List_v5
import React, { useState, useMemo } from 'react';
import {
  Card,
  Typography,
  Space,
  Tag,
  Timeline,
  Select,
  Row,
  Col,
  Input,
  Avatar,
  Badge,
  Empty,
  Radio,
  Divider,
} from 'antd';
import {
  History,
  CheckCircle2,
  Clock,
  AlertTriangle,
  User,
  Search,
  Filter,
  ArrowRight,
  ShieldAlert,
  Bot,
  Bell,
  Mail,
  Smartphone,
  Layers,
} from 'lucide-react';
import { useTheme } from '../../../theme/ThemeContext';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

export default function TenantAlertFeed() {
  const { isDark } = useTheme();
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [filterActor, setFilterActor] = useState('ALL');
  const [searchText, setSearchText] = useState('');

  // Feed dữ liệu nhật ký sự cố (sinh tự động từ UC-MT3-06 & hệ thống escalation BR-T36)
  const feedItems = [
    {
      id: 'FEED-01',
      actor: 'Nguyễn Hoàng Long (Tenant Admin)',
      isSystem: false,
      action: 'Tiếp nhận xử lý sự cố',
      alertId: 'ALT-3001',
      alertTitle: 'Áp suất máy bơm PUMP-TOC-01 tụt dưới ngưỡng an toàn (2.1 bar)',
      severity: 'CRITICAL',
      fromStatus: 'Chưa xử lý',
      toStatus: 'Đang xử lý',
      note: 'Đã gọi cho tổ trưởng bảo trì tòa nhà T1 xuống kiểm tra van áp suất và đường ống cấp.',
      timestamp: '20/08/2026 15:35:10',
    },
    {
      id: 'FEED-ESC-02',
      actor: 'Hệ thống SmartSite IoT (Tự động Escalation)',
      isSystem: true,
      action: 'Escalation Bước 2 (BR-T36)',
      alertId: 'ALT-3001',
      alertTitle: 'Áp suất máy bơm PUMP-TOC-01 tụt dưới ngưỡng an toàn (2.1 bar)',
      severity: 'CRITICAL',
      fromStatus: 'Chưa xử lý',
      toStatus: 'Escalated Level 2',
      note: 'Sự cố Critical chưa được Acknowledge sau 7 phút (+2 phút từ Bước 1) ➔ Hệ thống tự động gửi thông báo khẩn tới TOÀN BỘ Tenant Admin của ACV.',
      timestamp: '20/08/2026 15:37:00',
    },
    {
      id: 'FEED-ESC-01',
      actor: 'Hệ thống SmartSite IoT (Tự động Escalation)',
      isSystem: true,
      action: 'Escalation Bước 1 (BR-T36)',
      alertId: 'ALT-3001',
      alertTitle: 'Áp suất máy bơm PUMP-TOC-01 tụt dưới ngưỡng an toàn (2.1 bar)',
      severity: 'CRITICAL',
      fromStatus: 'Chưa xử lý',
      toStatus: 'Escalated Level 1',
      note: 'Sự cố Critical chưa được Acknowledge sau 5 phút (BR-T28) ➔ Hệ thống tự động gửi lại tin nhắn SMS + Email nhắc nhở người phụ trách chính.',
      timestamp: '20/08/2026 15:35:00',
    },
    {
      id: 'FEED-02',
      actor: 'Trần Thị Mai (Kỹ thuật viên)',
      isSystem: false,
      action: 'Chuyển trạng thái & Ghi nhận hiện trường',
      alertId: 'ALT-3002',
      alertTitle: 'Nhiệt độ Kho Lạnh ALS vượt ngưỡng cảnh báo (-14.8°C > -18°C)',
      severity: 'WARNING',
      fromStatus: 'Chưa xử lý',
      toStatus: 'Đang xử lý',
      note: 'Đang cử nhân viên bảo trì kiểm tra cửa gió dàn bay hơi block B và cảm biến SN-200.',
      timestamp: '20/08/2026 14:20:00',
    },
    {
      id: 'FEED-03',
      actor: 'Hệ thống tự động (Auto-Resolved)',
      isSystem: true,
      action: 'Khắc phục hoàn tất tự động',
      alertId: 'ALT-3003',
      alertTitle: 'Gateway GW-NB-001 tự động kết nối lại thành công sau 20 phút',
      severity: 'INFO',
      fromStatus: 'Đang xử lý',
      toStatus: 'Hoàn thành',
      note: 'Kết nối mạng cáp quang Ga T2 phục hồi, toàn bộ 24 cảm biến đã đồng bộ realtime.',
      timestamp: '20/08/2026 10:01:00',
    },
    {
      id: 'FEED-04',
      actor: 'Lê Văn Hùng (Nhân viên Bảo trì)',
      isSystem: false,
      action: 'Khắc phục hoàn tất sự cố',
      alertId: 'ALT-2998',
      alertTitle: 'Chiller T2 quá tải dòng điện pha A (52A > 50A)',
      severity: 'WARNING',
      fromStatus: 'Đang xử lý',
      toStatus: 'Hoàn thành',
      note: 'Đã cân pha lại tại tủ phân phối tầng 1, dòng điện pha A đã hạ về mức an toàn 44A.',
      timestamp: '19/08/2026 17:45:00',
    },
  ];

  const filteredFeed = useMemo(() => {
    const list = feedItems.filter((item) => {
      const term = searchText.toLowerCase().trim();
      const matchSearch =
        !term ||
        item.alertTitle.toLowerCase().includes(term) ||
        item.actor.toLowerCase().includes(term) ||
        item.note.toLowerCase().includes(term) ||
        item.alertId.toLowerCase().includes(term);

      const matchSeverity = filterSeverity === 'ALL' || item.severity === filterSeverity;
      const matchActor =
        filterActor === 'ALL' ||
        (filterActor === 'SYSTEM' ? item.isSystem : !item.isSystem);

      return matchSearch && matchSeverity && matchActor;
    });

    // Logic nghiệp vụ: Sắp xếp theo dòng thời gian giảm dần (Mới nhất lên đầu — Reverse Chronological)
    return list.sort((a, b) => {
      const parseDate = (dStr) => {
        if (!dStr) return 0;
        const [datePart, timePart] = dStr.split(' ');
        const [d, m, y] = datePart.split('/');
        const [h, min, s] = (timePart || '00:00:00').split(':');
        return new Date(y, m - 1, d, h, min, s).getTime();
      };
      return parseDate(b.timestamp) - parseDate(a.timestamp);
    });
  }, [feedItems, searchText, filterSeverity, filterActor]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1050, margin: '0 auto' }}>
      {/* Header trang */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Space size={8} align="center">
            <History size={24} style={{ color: '#0B72E7' }} />
            <Title level={4} style={{ margin: 0 }}>
              Feed Nhật Ký Xử Lý Cảnh Báo (Audit Trail)
            </Title>
          </Space>
          <Text type="secondary" style={{ fontSize: 13, display: 'block', marginTop: 2 }}>
            Tra cứu ai đã xử lý cảnh báo nào, thời điểm và nội dung khắc phục cùng các sự kiện tự động escalation (MH-MT3-06)
          </Text>
        </div>

        <Space>
          <Tag color="blue" style={{ fontSize: 13, padding: '4px 10px', borderRadius: 6 }}>
            MH-MT3-06
          </Tag>
        </Space>
      </div>

      {/* Bộ lọc Feed */}
      <Card style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <Row gutter={[16, 16]} align="middle" justify="space-between">
          <Col xs={24} md={10}>
            <Input
              prefix={<Search size={16} style={{ color: '#9CA3AF' }} />}
              placeholder="Tìm theo nội dung, mã cảnh báo, người xử lý..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>

          <Col xs={24} md={14}>
            <Space wrap style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Select
                value={filterActor}
                onChange={setFilterActor}
                style={{ width: 180 }}
              >
                <Option value="ALL">Tất cả người thực hiện</Option>
                <Option value="USER">Nhân viên / Admin</Option>
                <Option value="SYSTEM">Hệ thống Escalation (BR-T36)</Option>
              </Select>

              <Select
                value={filterSeverity}
                onChange={setFilterSeverity}
                style={{ width: 170 }}
              >
                <Option value="ALL">Tất cả mức độ</Option>
                <Option value="CRITICAL">🔴 Critical (Khẩn cấp)</Option>
                <Option value="WARNING">🟡 Warning (Cảnh báo)</Option>
                <Option value="INFO">🔵 Info (Thông tin)</Option>
              </Select>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Dòng thời gian Timeline Feed */}
      <Card style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        {filteredFeed.length === 0 ? (
          <Empty description="Không có nhật ký xử lý phù hợp. (AF-01)" style={{ padding: '60px 0' }} />
        ) : (
          <Timeline
            style={{ marginTop: 12 }}
            items={filteredFeed.map((item) => {
              let dotColor = '#10B981';
              let badgeColor = 'blue';
              if (item.severity === 'CRITICAL') {
                dotColor = '#DC2626';
                badgeColor = 'error';
              } else if (item.severity === 'WARNING') {
                dotColor = '#F59E0B';
                badgeColor = 'warning';
              }

              return {
                color: dotColor,
                children: (
                  <div
                    style={{
                      padding: 14,
                      borderRadius: 10,
                      background: item.isSystem
                        ? isDark ? '#1E293B' : '#F8FAFC'
                        : isDark ? '#111827' : '#FFFFFF',
                      border: `1px solid ${isDark ? '#374151' : '#E5E7EB'}`,
                      marginBottom: 16,
                      boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                      <Space size={8}>
                        {item.isSystem ? (
                          <Avatar size="small" icon={<Bot size={14} />} style={{ backgroundColor: '#8B5CF6' }} />
                        ) : (
                          <Avatar size="small" icon={<User size={14} />} style={{ backgroundColor: '#0B72E7' }} />
                        )}
                        <Text strong style={{ fontSize: 13 }}>{item.actor}</Text>
                        <Tag color={item.isSystem ? 'purple' : 'blue'} style={{ fontSize: 11 }}>
                          {item.action}
                        </Tag>
                      </Space>

                      <Space size={8}>
                        <Tag color={badgeColor} style={{ fontSize: 11 }}>{item.severity}</Tag>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          <Clock size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: '-1px' }} />
                          {item.timestamp}
                        </Text>
                      </Space>
                    </div>

                    <Divider style={{ margin: '10px 0' }} />

                    <div>
                      <Text strong style={{ fontSize: 13, color: item.severity === 'CRITICAL' ? '#DC2626' : undefined }}>
                        [{item.alertId}] {item.alertTitle}
                      </Text>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '6px 0' }}>
                        <Tag>{item.fromStatus}</Tag>
                        <ArrowRight size={14} style={{ color: '#9CA3AF' }} />
                        <Tag color="processing">{item.toStatus}</Tag>
                      </div>

                      <div style={{ background: isDark ? '#1F2937' : '#F9FAFB', padding: '8px 12px', borderRadius: 6, marginTop: 8 }}>
                        <Text style={{ fontSize: 12 }}>
                          💬 <strong>Nội dung ghi chú (BR-T27):</strong> {item.note}
                        </Text>
                      </div>
                    </div>
                  </div>
                ),
              };
            })}
          />
        )}
      </Card>
    </div>
  );
}
