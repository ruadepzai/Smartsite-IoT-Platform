// Mock Service cho Module MA-4: Tổng quan Hệ thống & Kinh doanh (NOC High-Tech Grade)
// File: src/mock/dashboardService.js
import { tenantService } from './tenantService';

export const STATIONS = [
  { value: 'ALL', label: 'Tất cả trạm (Tổng hợp toàn quốc)', location: 'Toàn quốc', isOnline: true },
  { value: 'HN-DC-01', label: 'Trạm Hà Nội (HN-DC-01)', location: 'Hà Nội', isOnline: true },
  { value: 'HCM-DC-02', label: 'Trạm TP.HCM (HCM-DC-02)', location: 'TP. Hồ Chí Minh', isOnline: true },
  { value: 'DN-DC-03', label: 'Trạm Đà Nẵng (DN-DC-03)', location: 'Đà Nẵng', isOnline: true },
  { value: 'HP-EDGE-01', label: 'Trạm Hải Phòng (HP-EDGE-01) — Mất kết nối', location: 'Hải Phòng', isOnline: false },
];

export const dashboardService = {
  // Lấy dữ liệu System Health Dashboard (MH-MA4-02 / FN-MA4-02)
  getSystemHealth(stationId = 'ALL', forceHighLoad = false) {
    if (stationId === 'HP-EDGE-01') {
      return {
        stationId: 'HP-EDGE-01',
        stationName: 'Trạm Hải Phòng (HP-EDGE-01)',
        isOnline: false,
        cpu: 0,
        ram: 0,
        wsConnections: 0,
        throughput: 0,
        bandwidth: '0 MB/s',
        activeGateways: 0,
        totalGateways: 8,
        activeSensors: 0,
        totalSensors: 120,
        uptime: '0% (Offline)',
        latency: 'Timeout',
        packetLoss: '100%',
        message: 'Không có dữ liệu / Mất kết nối. (MSG-04, EF-01)',
      };
    }

    let cpu = 42.4;
    let ram = 63.8;
    let ws = 15820;
    let throughput = 8950;
    let bandwidth = '128.6 MB/s';
    let activeGateways = 294;
    let totalGateways = 298;
    let activeSensors = 4210;
    let totalSensors = 4250;
    let latency = '14ms';
    let packetLoss = '0.01%';
    let stationName = 'Tổng hợp Toàn Quốc';

    if (stationId === 'HN-DC-01') {
      stationName = 'Trạm Hà Nội (HN-DC-01)';
      cpu = forceHighLoad ? 89.2 : 48.2;
      ram = forceHighLoad ? 91.5 : 68.4;
      ws = forceHighLoad ? 12400 : 6200;
      throughput = forceHighLoad ? 8200 : 3420;
      bandwidth = forceHighLoad ? '112.4 MB/s' : '48.2 MB/s';
      activeGateways = 120;
      totalGateways = 120;
      activeSensors = 1850;
      totalSensors = 1860;
      latency = '11ms';
    } else if (stationId === 'HCM-DC-02') {
      stationName = 'Trạm TP.HCM (HCM-DC-02)';
      cpu = forceHighLoad ? 92.4 : 54.6;
      ram = forceHighLoad ? 94.1 : 73.1;
      ws = forceHighLoad ? 14200 : 7150;
      throughput = forceHighLoad ? 9100 : 4180;
      bandwidth = forceHighLoad ? '124.8 MB/s' : '56.4 MB/s';
      activeGateways = 135;
      totalGateways = 136;
      activeSensors = 1920;
      totalSensors = 1930;
      latency = '15ms';
    } else if (stationId === 'DN-DC-03') {
      stationName = 'Trạm Đà Nẵng (DN-DC-03)';
      cpu = forceHighLoad ? 75.2 : 28.5;
      ram = forceHighLoad ? 78.4 : 42.1;
      ws = forceHighLoad ? 4800 : 2470;
      throughput = forceHighLoad ? 3200 : 1350;
      bandwidth = forceHighLoad ? '42.1 MB/s' : '24.0 MB/s';
      activeGateways = 39;
      totalGateways = 42;
      activeSensors = 440;
      totalSensors = 460;
      latency = '22ms';
    } else {
      // ALL
      if (forceHighLoad) {
        cpu = 88.5;
        ram = 91.2;
        ws = 28450;
        throughput = 18650;
        bandwidth = '265.4 MB/s';
        latency = '38ms';
        packetLoss = '0.45%';
      }
    }

    return {
      stationId,
      stationName,
      isOnline: true,
      cpu,
      ram,
      wsConnections: ws,
      throughput,
      bandwidth,
      activeGateways,
      totalGateways,
      activeSensors,
      totalSensors,
      uptime: '99.98%',
      latency,
      packetLoss,
      isCpuOverloaded: cpu > 80, // BR-A10: CPU > 80%
      isRamOverloaded: ram > 85, // BR-A10: RAM > 85%
    };
  },

  // Dữ liệu chuỗi thời gian lọc theo Trạm (Station) và Khoảng thời gian (24h, 7d, 30d) với hình thái đồ thị hoàn toàn độc lập
  getSystemTimeSeriesData(stationId = 'ALL', timeRange = '24h', forceHighLoad = false) {
    // 1. Trạm Hải Phòng: Offline flat line
    if (stationId === 'HP-EDGE-01') {
      const labels = timeRange === '24h'
        ? ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00']
        : timeRange === '7d'
        ? ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật']
        : ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4', 'Hiện tại'];
      return labels.map((t) => ({
        time: t,
        throughput: 0,
        wsConnections: 0,
        cpu: 0,
        ram: 0,
      }));
    }

    // 2. KHOẢNG THỜI GIAN 7 NGÀY (7 Days)
    if (timeRange === '7d') {
      const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];
      if (stationId === 'HN-DC-01') {
        // Hà Nội: Đỉnh điểm đầu tuần (Thứ 2 - Thứ 4)
        return days.map((d, i) => ({
          time: d,
          throughput: forceHighLoad ? [7200, 7600, 7400, 6800, 6200, 3800, 2900][i] : [3400, 3600, 3500, 3100, 2800, 1400, 950][i],
          wsConnections: forceHighLoad ? [12500, 13100, 12800, 11500, 10200, 6800, 5200][i] : [6100, 6400, 6250, 5800, 5200, 3100, 2400][i],
          cpu: forceHighLoad ? [88, 92, 90, 86, 82, 54, 42][i] : [48, 52, 50, 44, 40, 25, 18][i],
          ram: forceHighLoad ? [91, 94, 93, 89, 85, 62, 55][i] : [68, 71, 70, 65, 62, 50, 45][i],
        }));
      } else if (stationId === 'HCM-DC-02') {
        // TP.HCM: Tải cao liên tục cả Thứ 7 do sản xuất công nghiệp
        return days.map((d, i) => ({
          time: d,
          throughput: forceHighLoad ? [8200, 8600, 9100, 8900, 9400, 7800, 4800][i] : [3900, 4100, 4350, 4200, 4500, 3600, 2100][i],
          wsConnections: forceHighLoad ? [13800, 14400, 15100, 14800, 15600, 12400, 8200][i] : [6800, 7100, 7450, 7200, 7600, 5900, 3800][i],
          cpu: forceHighLoad ? [89, 93, 95, 92, 96, 78, 52][i] : [52, 56, 60, 57, 62, 48, 30][i],
          ram: forceHighLoad ? [92, 95, 96, 94, 97, 84, 68][i] : [72, 75, 78, 76, 80, 68, 56][i],
        }));
      } else if (stationId === 'DN-DC-03') {
        // Đà Nẵng: Tải tăng mạnh cuối tuần (Du lịch & Cảng biển)
        return days.map((d, i) => ({
          time: d,
          throughput: forceHighLoad ? [2600, 2800, 2900, 3200, 3700, 4100, 3900][i] : [1150, 1200, 1280, 1350, 1600, 1850, 1720][i],
          wsConnections: forceHighLoad ? [4200, 4400, 4600, 5100, 5800, 6400, 6100][i] : [2100, 2250, 2380, 2500, 2900, 3200, 3050][i],
          cpu: forceHighLoad ? [68, 71, 73, 76, 82, 86, 83][i] : [24, 26, 28, 31, 36, 40, 38][i],
          ram: forceHighLoad ? [72, 74, 76, 79, 84, 88, 85][i] : [38, 40, 42, 45, 50, 55, 52][i],
        }));
      } else {
        // ALL (Tổng hợp)
        return days.map((d, i) => ({
          time: d,
          throughput: forceHighLoad ? [17500, 18400, 19200, 18600, 19600, 15400, 11200][i] : [8450, 8900, 9200, 8750, 9100, 6850, 4770][i],
          wsConnections: forceHighLoad ? [27200, 28400, 29500, 28600, 30200, 24100, 18600][i] : [15100, 15800, 16250, 15700, 16100, 12200, 9250][i],
          cpu: forceHighLoad ? [87, 91, 93, 89, 94, 72, 55][i] : [42, 46, 48, 45, 49, 36, 26][i],
          ram: forceHighLoad ? [90, 93, 94, 91, 95, 80, 67][i] : [64, 67, 69, 66, 70, 58, 48][i],
        }));
      }
    }

    // 3. KHOẢNG THỜI GIAN 30 NGÀY (30 Days / 5 Weeks)
    if (timeRange === '30d') {
      const weeks = ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4', 'Hiện tại'];
      if (stationId === 'HN-DC-01') {
        return weeks.map((w, i) => ({
          time: w,
          throughput: forceHighLoad ? [6800, 7100, 7500, 7800, 8200][i] : [2900, 3100, 3250, 3380, 3420][i],
          wsConnections: forceHighLoad ? [11200, 11800, 12100, 12300, 12400][i] : [5400, 5700, 5950, 6100, 6200][i],
          cpu: forceHighLoad ? [82, 85, 87, 88, 89][i] : [42, 44, 46, 47, 48][i],
          ram: forceHighLoad ? [86, 88, 90, 91, 92][i] : [62, 64, 66, 67, 68][i],
        }));
      } else if (stationId === 'HCM-DC-02') {
        return weeks.map((w, i) => ({
          time: w,
          throughput: forceHighLoad ? [7900, 8200, 8600, 8900, 9100][i] : [3600, 3800, 3950, 4100, 4180][i],
          wsConnections: forceHighLoad ? [12800, 13200, 13700, 14000, 14200][i] : [6200, 6500, 6800, 7000, 7150][i],
          cpu: forceHighLoad ? [86, 88, 90, 91, 92][i] : [48, 50, 52, 53, 55][i],
          ram: forceHighLoad ? [88, 90, 92, 93, 94][i] : [68, 70, 71, 72, 73][i],
        }));
      } else if (stationId === 'DN-DC-03') {
        return weeks.map((w, i) => ({
          time: w,
          throughput: forceHighLoad ? [2400, 2600, 2850, 3050, 3200][i] : [1050, 1120, 1200, 1280, 1350][i],
          wsConnections: forceHighLoad ? [3800, 4100, 4350, 4600, 4800][i] : [1950, 2100, 2250, 2380, 2470][i],
          cpu: forceHighLoad ? [65, 68, 70, 73, 75][i] : [22, 24, 25, 27, 28][i],
          ram: forceHighLoad ? [68, 71, 74, 76, 78][i] : [34, 36, 38, 40, 42][i],
        }));
      } else {
        return weeks.map((w, i) => ({
          time: w,
          throughput: forceHighLoad ? [16800, 17400, 18100, 18450, 18650][i] : [7550, 8020, 8400, 8760, 8950][i],
          wsConnections: forceHighLoad ? [26200, 26900, 27600, 28100, 28450][i] : [13800, 14400, 15100, 15550, 15820][i],
          cpu: forceHighLoad ? [82, 85, 86, 88, 89][i] : [38, 40, 41, 42, 42][i],
          ram: forceHighLoad ? [86, 88, 89, 90, 91][i] : [58, 60, 62, 63, 64][i],
        }));
      }
    }

    // 4. KHOẢNG THỜI GIAN 24 GIỜ (24 Hours - 12 mốc giờ) VỚI HÌNH THÁI ĐẶC TRƯNG TỪNG TRẠM
    const hours = [
      '00:00', '02:00', '04:00', '06:00', '08:00', '10:00',
      '12:00', '14:00', '16:00', '18:00', '20:00', '22:00',
    ];

    if (stationId === 'HN-DC-01') {
      // Hà Nội: Đỉnh sớm buổi sáng (09:00 - 10:00) và đầu giờ chiều (14:00), hạ nhanh buổi tối
      const tp = forceHighLoad
        ? [2100, 1600, 1400, 3900, 8200, 7600, 4800, 7800, 6800, 5100, 3400, 2400]
        : [950, 720, 650, 1850, 3950, 3420, 2150, 3600, 3100, 2250, 1500, 1100];
      const ws = forceHighLoad
        ? [6800, 5900, 5400, 8800, 12400, 11800, 9800, 12100, 11200, 8900, 7400, 6500]
        : [3100, 2800, 2600, 4100, 6200, 5900, 4800, 5800, 5300, 4200, 3600, 3200];
      const cpu = forceHighLoad
        ? [42, 35, 32, 65, 89, 86, 68, 88, 82, 68, 52, 45]
        : [22, 18, 16, 32, 54, 48, 36, 52, 46, 38, 28, 24];
      const ram = forceHighLoad
        ? [68, 65, 64, 78, 92, 90, 82, 91, 88, 80, 72, 68]
        : [48, 48, 46, 55, 68, 66, 58, 68, 64, 58, 52, 50];

      return hours.map((h, i) => ({
        time: h,
        throughput: tp[i],
        wsConnections: ws[i],
        cpu: cpu[i],
        ram: ram[i],
      }));
    } else if (stationId === 'HCM-DC-02') {
      // TP.HCM: Tải cao liên tục từ sáng đến 20:00 tối, đỉnh cao vào 16:00 và 18:00
      const tp = forceHighLoad
        ? [3800, 3100, 2800, 4600, 8500, 8900, 8700, 9200, 9500, 9100, 7800, 5400]
        : [1800, 1450, 1300, 2200, 4100, 4350, 4200, 4600, 4800, 4400, 3800, 2600];
      const ws = forceHighLoad
        ? [8400, 7600, 7100, 9800, 13600, 14100, 13800, 14600, 14900, 14200, 12400, 9800]
        : [4200, 3800, 3500, 4900, 6800, 7150, 6900, 7400, 7600, 7100, 6200, 4800];
      const cpu = forceHighLoad
        ? [55, 48, 45, 68, 88, 90, 87, 93, 95, 91, 78, 62]
        : [32, 28, 26, 40, 62, 65, 60, 68, 73, 67, 56, 42];
      const ram = forceHighLoad
        ? [75, 72, 70, 80, 91, 93, 91, 94, 96, 93, 85, 78]
        : [58, 56, 55, 62, 73, 75, 72, 76, 78, 74, 66, 60];

      return hours.map((h, i) => ({
        time: h,
        throughput: tp[i],
        wsConnections: ws[i],
        cpu: cpu[i],
        ram: ram[i],
      }));
    } else if (stationId === 'DN-DC-03') {
      // Đà Nẵng: Hoạt động logistics & cảm biến cảng biển, đường cong êm đềm, tăng về đêm
      const tp = forceHighLoad
        ? [2800, 3100, 3300, 2900, 2600, 2400, 2200, 2500, 2900, 3400, 3100, 2700]
        : [1200, 1350, 1400, 1250, 1100, 1050, 950, 1100, 1300, 1480, 1350, 1150];
      const ws = forceHighLoad
        ? [4400, 4700, 4900, 4500, 4100, 3800, 3600, 4000, 4500, 5100, 4800, 4300]
        : [2200, 2400, 2470, 2300, 2100, 1950, 1850, 2050, 2300, 2550, 2400, 2150];
      const cpu = forceHighLoad
        ? [52, 58, 62, 56, 48, 44, 40, 48, 56, 65, 60, 52]
        : [26, 29, 30, 28, 24, 22, 20, 24, 28, 32, 29, 25];
      const ram = forceHighLoad
        ? [65, 69, 72, 68, 60, 56, 54, 60, 68, 76, 72, 64]
        : [38, 41, 42, 40, 36, 35, 34, 37, 40, 44, 41, 37];

      return hours.map((h, i) => ({
        time: h,
        throughput: tp[i],
        wsConnections: ws[i],
        cpu: cpu[i],
        ram: ram[i],
      }));
    } else {
      // ALL (Tổng hợp Toàn Quốc) - Đa đỉnh kết hợp
      const tp = forceHighLoad
        ? [8700, 7800, 7500, 11400, 18200, 18900, 15700, 19500, 19200, 18650, 14300, 10500]
        : [3950, 3520, 3350, 5300, 9150, 8820, 7300, 9300, 9200, 8950, 6650, 4850];
      const ws = forceHighLoad
        ? [19600, 18200, 17400, 23100, 28450, 27800, 24600, 28900, 28100, 27400, 23600, 19800]
        : [9500, 8800, 8450, 11300, 15820, 15000, 13550, 15250, 15200, 14750, 12200, 10150];
      const cpu = forceHighLoad
        ? [55, 48, 45, 68, 88, 90, 84, 92, 91, 88, 72, 58]
        : [28, 24, 22, 38, 62, 60, 52, 64, 62, 58, 45, 34];
      const ram = forceHighLoad
        ? [74, 71, 70, 79, 91, 92, 88, 93, 94, 91, 82, 74]
        : [54, 52, 50, 58, 68, 67, 62, 69, 70, 67, 58, 52];

      return hours.map((h, i) => ({
        time: h,
        throughput: tp[i],
        wsConnections: ws[i],
        cpu: cpu[i],
        ram: ram[i],
      }));
    }
  },

  // Dữ liệu phân bổ giao thức IoT cho Dashboard Hệ thống
  getIotProtocolDistribution() {
    return [
      { name: 'MQTT / MQTTS (Broker Primary)', percentage: 68, detail: '12.680 nodes', color: '#0B72E7' },
      { name: 'CoAP / UDP (Low-Power Sensors)', percentage: 18, detail: '3.350 nodes', color: '#10B981' },
      { name: 'HTTP / REST (Edge Gateways)', percentage: 14, detail: '2.610 nodes', color: '#8B5CF6' },
    ];
  },

  // Danh sách các Node / Server Cluster hạ tầng
  getClusterNodes(forceHighLoad = false) {
    return [
      {
        key: '1',
        id: 'NODE-HN-01',
        name: 'Hà Nội Core Primary (DC-01)',
        ip: '10.0.1.10',
        location: 'Hà Nội',
        status: forceHighLoad ? 'Cảnh báo tải cao' : 'Hoạt động',
        cpu: forceHighLoad ? 89 : 48,
        ram: forceHighLoad ? 91 : 68,
        throughput: forceHighLoad ? '8,200 msg/s' : '3,420 msg/s',
        gateways: '120/120',
        latency: '11ms',
        uptime: '45 ngày, 14 giờ',
      },
      {
        key: '2',
        id: 'NODE-HCM-02',
        name: 'TP.HCM Core Secondary (DC-02)',
        ip: '10.0.2.10',
        location: 'TP. Hồ Chí Minh',
        status: forceHighLoad ? 'Cảnh báo tải cao' : 'Hoạt động',
        cpu: forceHighLoad ? 92 : 54,
        ram: forceHighLoad ? 94 : 73,
        throughput: forceHighLoad ? '9,100 msg/s' : '4,180 msg/s',
        gateways: '135/136',
        latency: '15ms',
        uptime: '62 ngày, 08 giờ',
      },
      {
        key: '3',
        id: 'NODE-DN-03',
        name: 'Đà Nẵng Edge Gateway (DC-03)',
        ip: '10.0.3.15',
        location: 'Đà Nẵng',
        status: 'Hoạt động',
        cpu: forceHighLoad ? 75 : 28,
        ram: forceHighLoad ? 78 : 42,
        throughput: forceHighLoad ? '3,200 msg/s' : '1,350 msg/s',
        gateways: '39/42',
        latency: '22ms',
        uptime: '30 ngày, 02 giờ',
      },
      {
        key: '4',
        id: 'NODE-HP-04',
        name: 'Hải Phòng Edge Station (HP-EDGE-01)',
        ip: '10.0.4.20',
        location: 'Hải Phòng',
        status: 'Mất kết nối',
        cpu: 0,
        ram: 0,
        throughput: '0 msg/s',
        gateways: '0/8',
        latency: 'Timeout',
        uptime: '0 giờ (Offline)',
      },
    ];
  },

  // Sự kiện hệ thống thời gian thực (Live NOC Ticker)
  getLiveSystemEvents() {
    return [
      { id: 'EV-01', time: 'Vừa xong', type: 'info', text: 'Gateway GW-HN-104 đã đồng bộ 145 cảm biến thành công.' },
      { id: 'EV-02', time: '1 phút trước', type: 'success', text: 'Tự động tái cân bằng tải cụm máy chủ TP.HCM (HCM-DC-02) hoàn tất.' },
      { id: 'EV-03', time: '3 phút trước', type: 'warning', text: 'Độ trễ trạm Đà Nẵng (DN-DC-03) tăng tạm thời lên 28ms trong 30s.' },
      { id: 'EV-04', time: '5 phút trước', type: 'error', text: 'Mất kết nối với Gateway GW-HP-002 tại Hải Phòng (HP-EDGE-01).' },
      { id: 'EV-05', time: '12 phút trước', type: 'info', text: 'Sao lưu snapshot cơ sở dữ liệu chuỗi thời gian TSDB định kỳ hoàn tất.' },
    ];
  },

  // Lấy dữ liệu Business Dashboard (MH-MA4-01 / FN-MA4-01)
  getBusinessMetrics(period = 'current_month') {
    const tenants = tenantService.getTenants();
    const activeTenants = tenants.filter((t) => t.status === 'Đang hoạt động').length;

    let mrr = 385000000;
    let arr = 4620000000;
    let momGrowth = 12.5;
    let newContracts = 4;

    if (period === 'last_30_days') {
      mrr = 372000000;
      arr = 4464000000;
      momGrowth = 10.8;
      newContracts = 3;
    } else if (period === 'current_quarter') {
      mrr = 1120000000;
      arr = 4480000000;
      momGrowth = 15.4;
      newContracts = 9;
    } else if (period === 'year_2026') {
      mrr = 2850000000;
      arr = 5700000000;
      momGrowth = 24.2;
      newContracts = 16;
    }

    return {
      period,
      mrr,
      arr,
      momGrowth,
      activeTenants,
      totalTenants: tenants.length,
      newContracts,
    };
  },

  // Dữ liệu tăng trưởng doanh thu 12 tháng
  getRevenue12Months() {
    return [
      { month: 'T3/25', revenue: 180, contracts: 5 },
      { month: 'T4/25', revenue: 210, contracts: 6 },
      { month: 'T5/25', revenue: 235, contracts: 7 },
      { month: 'T6/25', revenue: 260, contracts: 8 },
      { month: 'T7/25', revenue: 275, contracts: 8 },
      { month: 'T8/25', revenue: 290, contracts: 9 },
      { month: 'T9/25', revenue: 310, contracts: 10 },
      { month: 'T10/25', revenue: 325, contracts: 11 },
      { month: 'T11/25', revenue: 340, contracts: 12 },
      { month: 'T12/25', revenue: 360, contracts: 13 },
      { month: 'T1/26', revenue: 375, contracts: 14 },
      { month: 'T2/26', revenue: 385, contracts: 16 },
    ];
  },

  // Cơ cấu doanh thu theo gói Plan
  getPlanRevenueBreakdown() {
    return [
      { name: 'Enterprise', percentage: 62, revenue: '238.700.000 ₫', color: '#8B5CF6' },
      { name: 'Pro', percentage: 26, revenue: '100.100.000 ₫', color: '#06B6D4' },
      { name: 'Standard', percentage: 7, revenue: '26.950.000 ₫', color: '#0B72E7' },
      { name: 'Custom', percentage: 5, revenue: '19.250.000 ₫', color: '#D946EF' },
    ];
  },

  // Bảng 10 hợp đồng gần đây nhất (MH-MA4-01)
  getRecentContracts() {
    return [
      {
        key: '1',
        company: 'Tổng công ty Cảng Hàng không Việt Nam (ACV)',
        contractCode: 'HD-2026-016',
        plan: 'Custom',
        value: '180.000.000 ₫',
        debt: '0 ₫',
        date: '01/07/2026',
      },
      {
        key: '2',
        company: 'Công ty TNHH Thiết bị Y tế Tân Long',
        contractCode: 'HD-2026-015',
        plan: 'Standard',
        value: '30.000.000 ₫',
        debt: '15.000.000 ₫',
        date: '15/06/2026',
      },
      {
        key: '3',
        company: 'Công ty Cổ phần Sữa Việt Nam (Vinamilk)',
        contractCode: 'HD-2026-014',
        plan: 'Enterprise',
        value: '120.000.000 ₫',
        debt: '0 ₫',
        date: '01/06/2026',
      },
      {
        key: '4',
        company: 'Công ty Cổ phần Cảng Đà Nẵng',
        contractCode: 'HD-2026-013',
        plan: 'Standard',
        value: '45.000.000 ₫',
        debt: '0 ₫',
        date: '18/05/2026',
      },
      {
        key: '5',
        company: 'Công ty Cổ phần Viễn thông FPT (FPT Telecom)',
        contractCode: 'HD-2026-012',
        plan: 'Enterprise',
        value: '150.000.000 ₫',
        debt: '0 ₫',
        date: '05/05/2026',
      },
      {
        key: '6',
        company: 'Tổng công ty Điện lực Dầu khí Việt Nam (PV Power)',
        contractCode: 'HD-2026-011',
        plan: 'Enterprise',
        value: '150.000.000 ₫',
        debt: '50.000.000 ₫',
        date: '28/04/2026',
      },
      {
        key: '7',
        company: 'Công ty TNHH MTV Thoát nước Đô thị TP.HCM',
        contractCode: 'HD-2026-010',
        plan: 'Standard',
        value: '30.000.000 ₫',
        debt: '0 ₫',
        date: '15/04/2026',
      },
      {
        key: '8',
        company: 'Công ty Cổ phần Thép Hòa Phát Hải Dương',
        contractCode: 'HD-2026-009',
        plan: 'Custom',
        value: '95.000.000 ₫',
        debt: '0 ₫',
        date: '02/04/2026',
      },
      {
        key: '9',
        company: 'Công ty Cổ phần Cảng Quốc tế Cái Mép',
        contractCode: 'HD-2026-008',
        plan: 'Standard',
        value: '30.000.000 ₫',
        debt: '30.000.000 ₫',
        date: '22/03/2026',
      },
      {
        key: '10',
        company: 'Tổng công ty Cổ phần Bưu chính Viettel (Viettel Post)',
        contractCode: 'HD-2026-007',
        plan: 'Enterprise',
        value: '150.000.000 ₫',
        debt: '0 ₫',
        date: '10/03/2026',
      },
    ];
  },
};
