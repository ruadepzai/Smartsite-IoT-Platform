# Quy tắc dịch UC Description → UI (UC-to-UI Translation Ruleset)
### SmartSite IoT Platform — dùng chung Admin Console + Tenant Portal — Giai đoạn 2 (build chi tiết module)

> **v2.0 — bản gộp canonical.** File này thay thế cả 2 bản trước đó: `Quy_tac_dich_UC_UI.md` (bản gốc, scope riêng Admin, có mapping Ant Design + checklist review) và `Ruleset_Dich_UC_sang_UI.md` (bản scope chung Admin+Tenant, có 7 quy tắc gộp/tách màn hình). Từ giờ **chỉ dùng 1 file này**, không dùng lại 2 bản cũ để tránh lệch logic dịch giữa các module đã build trước và các module build sau.
>
> **Cách dùng:** Mỗi lần prompt Antigravity build 1 module, đính kèm 3 file: file này + `UC_Description_MA-x.md`/`UC_Description_MT-x.md` tương ứng + các dòng liên quan trong `Danh_sach_man_hinh_MA1_MA6.md`/`Danh_sach_man_hinh_MT1_MT5.md`. Mục tiêu là để toàn bộ 11 module (MA-1→MA-6, MT-1→MT-5) build ra **cùng 1 logic dịch**, tránh mỗi module Antigravity "sáng tác" một kiểu khác nhau — đây là rủi ro lớn nhất khi giao AI build tuần tự nhiều module.

---

## 1. Nguyên tắc nền (đọc trước khi build bất kỳ module nào)

1. **1 UC không nhất thiết = 1 màn hình.** UC có thể trải trên nhiều component (form + modal + toast), miễn đúng logic — không tự gộp/tách khác với `Danh_sach_man_hinh_MA1_MA6.md`/`Danh_sach_man_hinh_MT1_MT5.md` đã chốt. **7 quy tắc gộp/tách cụ thể xem mục 4.**
2. **Main Flow = happy path mặc định trên UI.** Field nào xuất hiện trong Main Flow thì luôn hiển thị, không ẩn có điều kiện.
3. **Thứ tự field trên UI PHẢI khớp thứ tự bước trong Main Flow.** Không tự sắp xếp lại theo "gu thẩm mỹ" của AI.
4. **Alternative Flow (AF) chia 2 loại** — actor chủ động chọn (ra control mới) vs hệ thống tự kích hoạt (chỉ hiển thị thụ động, actor không bấm gì). Xem bảng mục 2.
5. **Exception Flow (EF) luôn ra 1 message cụ thể**, gắn đúng vị trí gây lỗi.
6. **Business Rule (BR) không tự sinh UI mới** — BR luôn "bám" vào 1 control đã có ở Main Flow/AF, đóng vai trò ràng buộc (validate/giới hạn/hành vi), không phải lý do để vẽ thêm field.
7. **Mọi chỗ UC Description đánh dấu `[cần xác nhận với nghiệp vụ]` → Antigravity PHẢI để placeholder rõ ràng** (badge "TODO — chờ xác nhận nghiệp vụ", màu vàng cam), **cấm tự chọn 1 giá trị mặc định** thay BA. Đây là nguyên tắc "Explicit flagging over silent resolution" của dự án — vi phạm nguyên tắc này là lỗi nghiêm trọng nhất, không phải lỗi UI thông thường.
8. **Case gộp/tách hoặc case dịch chưa khớp bất kỳ quy tắc nào trong file này** → dừng lại, hỏi Luong/PM trước, không tự quyết rồi bổ sung thành tiền lệ ngầm cho module sau.

---

## 2. Bảng ánh xạ chi tiết (Main Flow / AF / EF / BR → UI)

| Thành phần UC | Ánh xạ UI mặc định | Ví dụ trong SmartSite | Ghi chú |
|---|---|---|---|
| **Main Flow** — bước nhập liệu tuần tự | Field theo đúng thứ tự bước, top-to-bottom trên form | UC-MA1-04 bước 2 "Nhập họ tên, email, chọn Role" → 3 field đúng thứ tự này ở MH-MA1-04 | Không tự sắp xếp lại |
| **Main Flow** — bước xác nhận cuối | Nút CTA chính (primary), luôn ở cuối form, góc phải | "Lưu", "Đăng nhập" | 1 form chỉ 1 CTA chính |
| **Main Flow** — bước "Xem/hiển thị danh sách [Y]" | Table + Pagination | Danh sách thiết bị, danh sách Tenant | Số dòng/trang lấy theo BR nếu có (BR-A21: 10/trang), không có BR thì mặc định 20 dòng/trang theo quy ước dự án |
| **Main Flow** — bước hệ thống tự kiểm tra/ghi nhận ngầm (actor không thao tác) | Không sinh control | UC-MA1-01 bước 4 "ghi nhận thời điểm đăng nhập" | Chỉ ghi chú Yêu cầu nghiệp vụ nếu ảnh hưởng hiển thị |
| **AF — actor chủ động chọn** | Tab / Toggle / Nút phụ (secondary) / Modal riêng / Conditional field | UC-MA1-05 AF-01 (khóa TK) → toggle trong form Sửa; AF-02 (xóa) → menu ⋮ + confirm dialog | AF đổi cả bộ field hiển thị → dùng Tab; AF chỉ thêm 1 hành vi phụ → dùng Toggle/Button; AF là "chọn phương án khác thay vì mặc định" → conditional field hiện theo lựa chọn |
| **AF — hệ thống tự kích hoạt** (system-triggered) | Banner/Badge/Highlight tự động — **KHÔNG có control cho actor bấm** | UC-MA4-02 AF-01 (CPU>80%) → highlight đỏ tự động | Actor chỉ "thấy", không "làm" |
| **AF — không có dữ liệu/danh sách rỗng** | Khối trạng thái rỗng (empty state) | "Không tìm thấy tài khoản nào khớp." | Không phải MSG lỗi |
| **EF — lỗi input tại 1 field** | Inline error ngay dưới field, viền field đổi đỏ | EF-02 UC-MA1-07 (mật khẩu yếu) → lỗi dưới ô Mật khẩu mới | Không dùng toast cho lỗi field-level |
| **EF — lỗi business logic gắn được vào field** (trùng dữ liệu...) | Vẫn field-level, không phải toast | EF-01 UC-MA1-04 (email trùng) → lỗi dưới field Email | Miễn xác định được đúng field, luôn ưu tiên field-level hơn toast |
| **EF — lỗi business logic KHÔNG gắn được vào field cụ thể** (vượt hạn mức, hết hạn link...) | Toast/Notification hoặc Alert banner đầu trang | EF-02 UC-MA1-03 (link hết hạn) → Alert banner ở màn "Đặt mật khẩu mới" | |
| **EF — chặn truy cập/thao tác toàn màn hình** | Modal chặn hoặc trang lỗi riêng | Tài khoản bị khóa lúc đăng nhập → chặn ngay tại trang login | |
| **EF — dẫn tới soft-delete thay vì chặn hẳn** | Không sinh MSG lỗi — sinh MSG loại **Thành công**, không lộ chi tiết kỹ thuật | UC-MA1-05 EF-01 (xóa TK có Audit Log) → "Xóa tài khoản thành công." dù thực chất soft-delete | Xem thêm dòng BR soft-delete bên dưới |
| **BR — ràng buộc định dạng/độ dài input** | Validation rule gắn trực tiếp field | BR-A17 (mật khẩu ≥6 ký tự, hoa/số/ký tự đặc biệt) → validate ô Mật khẩu mới | Copy nguyên câu chữ BR vào helper text dưới field nếu có thể |
| **BR — giới hạn số lượng hiển thị** | Cấu hình `pagination` của Table | BR-A21 (10 bản ghi/trang) → `pageSize=10` ở MH-MA2-01 | |
| **BR — ngưỡng màu sắc/badge/progress bar** | Control Badge/Progress bar, mapping màu ghi rõ trong Yêu cầu nghiệp vụ | BR-A23 (≥80% Sắp vượt, ≥100% Đã vượt) → 2 mức màu | **Không tự vẽ thêm mức trung gian ngoài BR** — lỗi thật đã xảy ra ở MH-MA3-02 (tự vẽ 3 mức xanh/vàng/đỏ trong khi BR chỉ có 2 mức), xem `project_master_admin_v14.md` changelog v14.0 |
| **BR — cooldown/thời gian chờ** | Disable button + đếm ngược | BR-A27 cooldown gửi lại link reset 60s → disable nút, hiện "Vui lòng đợi 58s" | |
| **BR — ẩn/hiện điều kiện** | Conditional render field/section | Toggle "Khóa tài khoản" chỉ hiện ở chế độ Sửa (MH-MA1-04) | |
| **BR — định dạng file xuất** | Control nút "Xuất", ghi rõ định dạng cho phép | BR-A26/BR-T40 (chỉ Excel, không CSV) | Không tự thêm định dạng ngoài phạm vi BR |
| **BR — quy tắc ngầm phía backend** (soft-delete, cascade, không hồi tố...) | **KHÔNG vẽ control UI mới** — chỉ có thể đổi câu chữ trong confirm dialog nếu cần minh bạch với actor | BR-A19/BR-T36/BR-T38 (soft-delete) → dialog xóa vẫn nói "Xóa tài khoản", không cần lộ chữ "soft-delete" | Rule invisible-to-UI — cấm Antigravity tự vẽ thêm gì (vd tự thêm cột "is_deleted" ra UI) |
| **BR — phân quyền** (chỉ actor X mới thấy/thao tác) | Cột "Vai trò được truy cập" của màn hình + ẩn/hiện control theo role | BR-A01 (chỉ AT-01 vào MH-MA1-03) | Nếu 1 màn phục vụ nhiều actor khác quyền → ghi rõ control nào ẩn/hiện theo role trong Yêu cầu nghiệp vụ |
| **`[cần xác nhận với nghiệp vụ]`** | Badge "TODO — chờ xác nhận nghiệp vụ" cạnh field/control liên quan | UC-MA5-01 (giới hạn dung lượng file firmware chưa chốt) | Không set giá trị mặc định kiểu "chắc tầm 50MB là được" |

---

## 3. Quy ước message (map với Ant Design)

- Loại **"Lỗi"** gắn được vào field → `Form.Item help` (đỏ, dưới field). Không gắn được vào field → `message.error()`.
- Loại **"Cảnh báo"** → `message.warning()`; nếu cần hiển thị lâu, không tự biến mất → `Alert type="warning"`.
- Loại **"Thành công"** → `message.success()`.
- **Giữ nguyên 100% câu chữ** trong cột "Nội dung thông báo" của file đặc tả/UC Description — không để Antigravity diễn giải lại theo ý nó, kể cả khi nó nghĩ câu khác "mượt" hơn.
- Mã hóa: `MSG-01`, `MSG-02`... theo thứ tự xuất hiện trên màn hình, không theo mã EF/AF nguồn.

---

## 4. Quy tắc gộp/tách màn hình (UI/UX-level — không nằm trong UC Description)

UC Description chỉ chứa business logic (Main Flow, BR...), **không chứa quyết định gộp/tách màn hình** — đây là quyết định UI/UX-level phải làm rõ riêng, nếu không Antigravity sẽ tự bịa cách gộp/tách khác nhau cho từng module. 7 quy tắc dưới đây đã được áp dụng nhất quán xuyên suốt cả Admin (MA-1→MA-6) và Tenant (MT-1→MT-5):

1. **CRUD dùng pattern List + Modal/Form dùng chung Thêm-Sửa**, không tách 1 màn/1 thao tác (vd MH-MA1-04, MH-MT2-03, MH-MT4-02).
2. **Action phụ (khóa/mở khóa, vô hiệu hóa, xóa)** xử lý bằng icon 3 chấm (⋮) mở menu ngay trên màn Danh sách; riêng action **đổi trạng thái/khóa** chuyển hẳn vào bên trong Form Sửa dưới dạng toggle (chỉ hiện ở chế độ Sửa, có hiệu lực khi bấm Lưu) — **không** để control này nằm ngoài Danh sách (đã sửa lại 1 lần ở MH-MA1-03/04 sau phản hồi thực tế).
3. **Nhiều FN cùng thao tác trên 1 entity/1 chủ thể** (vd "tài khoản của chính mình") → gộp thành 1 màn hình dạng **Tabs** (MH-MA1-05, MH-MT1-03).
4. **Nhiều FN là hành vi trên cùng 1 khối UI duy nhất** (vd Hiển thị + Lọc + Reset của 1 bản đồ) → gộp thành **1 UC/1 màn hình**, không tách theo từng FN (UC-MT2-09).
5. **1 FN gộp nhiều UC hành động liên tiếp trên cùng entity** (Sửa/Khóa/Xóa) → Main Flow là hành động phổ biến nhất, các hành động còn lại là AF, nhưng UI vẫn chỉ thể hiện thành **1 màn Danh sách + 1 màn Form**, không tách 3 màn riêng theo 3 UC (UC-MA1-05, UC-MT4-03).
6. **Report/Dashboard dạng "Xem/Xuất"** → gộp luôn chức năng Xuất vào cùng UC/màn hình dạng 1 nút "Xuất" cạnh bộ lọc, **không tách UC/màn riêng cho Xuất** (UC-MA6-01, UC-MT5-01/02/03).
7. **Định dạng/giới hạn khi Xuất file** → theo đúng BR hiện hành tại thời điểm build, không tự suy đoán thêm định dạng hay bỏ giới hạn ngoài phạm vi đã chốt.

> Gặp case chưa khớp hẳn 7 quy tắc trên → áp dụng nguyên tắc 8 ở mục 1: dừng lại hỏi Luong/PM, không tự bịa cách gộp/tách riêng cho module đó.

---

## 5. Quy ước đặt tên & mã hóa

- Mã màn hình: `MH-{module}-{số}`, đánh số theo thứ tự xuất hiện trong module (không theo thứ tự FN) — phải khớp tuyệt đối với mã dùng ở Ma trận truy vết (mục 7.1 BRD) và ở đặc tả use case liên quan.
- Tên điều khiển ("Loại điều khiển"): Việt hóa 100% — "Ô nhập liệu / Danh sách chọn / Ngày tháng / Nút bấm / Nhóm checkbox / Nút chuyển đổi (toggle)" — không viết "Input/Dropdown/Button/Switch" trong tài liệu đặc tả (code thì tự nhiên vẫn dùng tên component AntD như bình thường).
- Giữ nguyên tiếng Anh chỉ với thuật ngữ chuyên ngành không có từ Việt tương đương rõ nghĩa hơn (firmware, debounce, RPC...) và mã kỹ thuật bắt buộc (MH-xx, FN-xx, UC-xx, BR-xx, MSG-xx).

---

## 6. Checklist review bắt buộc sau khi Antigravity build xong 1 module

*(làm bước này TRƯỚC khi chụp ảnh thật dán vào BRD, không làm ngược lại)*

1. Thứ tự field trên UI thật có đúng thứ tự Main Flow không?
2. Mỗi AF trong UC Description có control tương ứng trên UI thật không (Antigravity có bỏ sót nhánh nào không)?
3. Mỗi EF có message đúng câu chữ, đúng vị trí (field-level vs toast) không?
4. Mỗi BR có hành vi/validate **thực sự chạy được**, không chỉ "có mặt" trên giao diện cho đẹp — đặc biệt lưu ý ngưỡng màu/badge (BR-A23 kiểu) không bị tự vẽ thêm mức ngoài BR?
5. Cách gộp/tách màn hình thật có khớp `Danh_sach_man_hinh_...md` và 7 quy tắc mục 4 không?
6. Không có field/nút nào Antigravity tự thêm ngoài đặc tả (kể cả khi nó "hợp lý" theo UX thông thường).
7. Mọi `[cần xác nhận với nghiệp vụ]` vẫn còn là placeholder — chưa bị AI tự chọn giá trị cụ thể.

→ Có lệch ở bước nào: sửa code (nếu Antigravity làm sai so với đặc tả) HOẶC sửa đặc tả (nếu Antigravity đưa ra hướng hợp lý hơn và bạn đồng ý) — nhưng **luôn phải làm 1 trong 2, không để 2 bên lệch nhau tồn tại song song**. Ghi lại quyết định vào "Vấn đề còn tồn đọng" của module đó.

---

## 7. Giới hạn của ruleset — khi nào vẫn cần đặc tả/xác nhận riêng

- **Màn hình phức tạp về layout không match 1-1 với UC** (Dashboard nhiều biểu đồ, Bản đồ giám sát) — ruleset chỉ định hình control chính; vị trí/loại biểu đồ cụ thể vẫn cần phác thảo riêng hoặc theo wireframe thật.
- **Đã có ảnh wireframe/prototype thật đã chốt** (5 màn MA-1) → ảnh thắng tuyệt đối, giữ nguyên đặc tả đã viết, không áp lại ruleset để tránh xung đột 2 nguồn.
- **Case gộp/tách hoặc case dịch chưa khớp bất kỳ quy tắc nào ở mục 2/4** → dừng lại hỏi Luong/PM trước (nguyên tắc 8, mục 1).

---

*Thứ tự build đề xuất: MA-1 trước (đã đủ UC Description, hết câu hỏi mở) → MA-2, MA-3, MA-4 → MA-5, MA-6 (xử lý riêng phần `[cần xác nhận]`) → MT-1 → MT-2 → MT-3 → MT-4 → MT-5 (toàn bộ Tenant đã hết câu hỏi mở nghiệp vụ tính tới 21/08).*

*File này thay thế `Ruleset_Dich_UC_sang_UI.md` và bản gốc `Quy_tac_dich_UC_UI.md` (scope riêng Admin) — chỉ dùng bản v2.0 này từ nay về sau, đi kèm `Danh_sach_man_hinh_MA1_MA6.md` và `Danh_sach_man_hinh_MT1_MT5.md`.*
