# Chương 5: Kiến trúc Bảo mật (Security Architecture)

## 1. Mô hình Hóa Mối đe dọa (Threat Modeling - STRIDE)

Hệ thống áp dụng mô hình **STRIDE** của Microsoft để phân tích các mối đe dọa bảo mật tiềm tàng và thiết lập các biện pháp giảm thiểu tương ứng:

| Phân nhóm STRIDE | Mô tả Mối đe dọa đối với Atlas | Tác động | Giải pháp Giảm thiểu (Mitigation Strategy) |
| :--- | :--- | :--- | :--- |
| **Spoofing (Giả mạo)** | Kẻ tấn công giả danh nhân viên hoặc Tenant Admin để thực hiện các cuộc gọi API trái phép. | Rò rỉ dữ liệu hoặc thay đổi cấu hình doanh nghiệp. | - Bắt buộc xác thực đa yếu tố (MFA) đối với tài khoản Admin.<br>- Sử dụng JWT ký bằng thuật toán khóa bất đối xứng RS256.<br>- Tích hợp SSO thông qua SAML/OIDC của các nhà cung cấp uy tín. |
| **Tampering (Can thiệp trái phép)** | Người dùng thay đổi thông số `tenant_id` hoặc payload HTTP để sửa đổi dữ liệu của tenant khác. | Rò rỉ dữ liệu chéo giữa các Tenant. | - Thiết kế RLS (Row-Level Security) ở mức Database dựa trên session context.<br>- Kiểm tra chữ ký số của tất cả các yêu cầu.<br>- Xác thực đầu vào (Input Validation) nghiêm ngặt bằng Class-validator ở Backend. |
| **Repudiation (Phủ nhận)** | Quản lý thay đổi bảng lương hoặc duyệt đơn nghỉ phép nhưng phủ nhận hành động của mình. | Mất tính minh bạch, khó khăn khi kiểm toán. | - Xây dựng hệ thống Nhật ký Kiểm toán (Audit Log) bất biến (Append-only).<br>- Ghi vết chi tiết User ID, IP Address, Device Fingerprint, Timestamp và các giá trị trước/sau khi thay đổi. |
| **Information Disclosure (Rò rỉ thông tin)** | Dữ liệu nhạy cảm của nhân viên (CCCD, Số tài khoản ngân hàng, Lương) bị lộ do lỗi SQL Injection hoặc lộ cơ sở dữ liệu. | Vi phạm pháp luật (Nghị định 13), mất uy tín doanh nghiệp. | - Sử dụng Prisma ORM giúp loại bỏ nguy cơ SQL Injection mặc định.<br>- Áp dụng mã hóa cấp ứng dụng (ALE) bằng thuật toán AES-256-GCM đối với các cột thông tin nhạy cảm trước khi lưu xuống DB.<br>- Cấu hình Column-Level Security (CLS) để ẩn dữ liệu lương. |
| **Denial of Service (Từ chối dịch vụ)** | Kẻ tấn công spam API Check-in/out liên tục làm nghẽn hệ thống. | Nhân viên không thể chấm công, hệ thống bị gián đoạn. | - Áp dụng Rate Limiting ở tầng API Gateway (sử dụng Redis Token Bucket).<br>- Phân luồng xử lý đồng bộ và bất đồng bộ (sử dụng BullMQ).<br>- Auto-scaling Kubernetes Pods dựa trên tải thực tế. |
| **Elevation of Privilege (Leo thang đặc quyền)** | Nhân viên thường thay đổi quyền hạn của mình trong Session để tự duyệt đơn xin nghỉ phép của bản thân. | Phá vỡ quy trình vận hành và kiểm soát của doanh nghiệp. | - Stateless Authorization: Đánh giá quyền truy cập động bằng Policy Engine của hệ thống Core trên mỗi request API, không dựa vào thông tin quyền lưu trữ phía Client.<br>- Mã hóa chữ ký JWT kèm thời gian hết hạn (TTL) cực ngắn (15 phút). |

---

## 2. Xác thực & Vòng đời Phiên (Authentication & Session Lifecycle)

*   **Lưu trữ JWT an toàn:** Access Token được truyền qua Header `Authorization: Bearer <token>`. Refresh Token được lưu trữ trong Cookie với các thuộc tính bảo mật nghiêm ngặt:
    *   `HttpOnly`: Chống các cuộc tấn công đánh cắp cookie qua XSS.
    *   `Secure`: Chỉ gửi Cookie qua kết nối HTTPS.
    *   `SameSite=Strict`: Ngăn chặn các cuộc tấn công CSRF (Cross-Site Request Forgery).
*   **Vòng đời Phiên làm việc (Session Lifecycle):**
    ```
    +------------------------------------------------------------+
    |                 Đăng nhập thành công                       |
    |  - Cấp Access Token (Hạn dùng: 15 Phút)                     |
    |  - Cấp Refresh Token (Hạn dùng: 7 Ngày)                    |
    +------------------------------------------------------------+
                                 |
                                 v
    +------------------------------------------------------------+
    |                 Access Token Hết hạn                       |
    |  - Client gửi Refresh Token lên endpoint /refresh          |
    |  - Kiểm tra tính hợp lệ của Refresh Token trong Redis      |
    |  - Cấp Access Token mới nếu hợp lệ                         |
    +------------------------------------------------------------+
                                 |
                                 v (Sự kiện đặc biệt: Đổi mật khẩu/Đăng xuất)
    +------------------------------------------------------------+
    |                 Thu hồi Phiên Tức thời                     |
    |  - Xóa Refresh Token tương ứng khỏi Redis                  |
    |  - Đưa Access Token cũ vào Blacklist trong Redis (nếu cần)  |
    +------------------------------------------------------------+
    ```

---

## 3. Cách ly Đa thuê (Multi-Tenant Isolation)

Để đáp ứng tối đa tính bảo mật và tối ưu chi phí, Atlas hỗ trợ cấu hình cách ly Tenant linh hoạt qua hai phương pháp:

### 3.1. Cách ly Logic dùng chung Cơ sở dữ liệu (Logical Isolation via Row-Level Security - RLS)
*   **Cơ chế hoạt động:** Tất cả các bảng dữ liệu dùng chung đều có cột `tenant_id`. Hệ thống cấu hình tính năng PostgreSQL RLS trên các bảng này.
*   **Triển khai trên NestJS & Prisma:**
    1.  Khi request đi qua Middleware xác thực, hệ thống trích xuất `tenant_id` từ JWT và lưu vào một context an toàn của luồng thực thi (sử dụng `AsyncLocalStorage` của Node.js).
    2.  Trước khi Prisma thực thi bất kỳ câu lệnh SQL nào, Prisma Client Extension sẽ chèn một câu lệnh thiết lập biến phiên làm việc (session variable) vào transaction PostgreSQL:
        `SET LOCAL app.current_tenant_id = 'tenant-uuid-xyz';`
    3.  PostgreSQL tự động thực thi chính sách RLS đã được tạo sẵn:
        `CREATE POLICY tenant_isolation_policy ON target_table USING (tenant_id = current_setting('app.current_tenant_id'));`
    4.  Nhờ đó, lập trình viên không bao giờ cần phải viết thêm điều kiện `WHERE tenant_id = ...` một cách thủ công, loại bỏ hoàn toàn rủi ro quên lọc tenant dẫn đến rò rỉ dữ liệu.

### 3.2. Cách ly Schema/Database Vật lý (Physical Isolation)
*   **Cơ chế hoạt động:** Đối với các khách hàng Enterprise lớn có yêu cầu khắt khe về mặt pháp lý hoặc hiệu năng, hệ thống sẽ ánh xạ Tenant đó với một PostgreSQL Schema riêng biệt hoặc một Database Instance độc lập.
*   **Triển khai:** Tầng kết nối cơ sở dữ liệu (Database Connection Pool Manager) sẽ dựa trên `tenant_id` của request để định tuyến kết nối đến đúng database tương ứng (Dynamic Datasource Routing).

---

## 4. Bảo mật Dữ liệu & Mã hóa (Data Encryption)

### 4.1. Mã hóa Dữ liệu tĩnh cấp Ứng dụng (Application-Level Encryption - ALE)
Nhằm tuân thủ Nghị định 13/2023/NĐ-CP về Bảo vệ dữ liệu cá nhân, hệ thống thực hiện mã hóa các trường thông tin nhạy cảm của người dùng trước khi ghi vào PostgreSQL:

```
[Dữ liệu thô: CCCD]
       |
       v (Mã hóa tại Web Server)
[Sử dụng Khóa AES-256-GCM + Khóa mã hóa Tenant DEK]
       |
       v
[Dữ liệu đã mã hóa dạng Hex/Base64] --> Lưu vào PostgreSQL
```

*   **Thuật toán mã hóa:** Sử dụng **AES-256-GCM** (Advanced Encryption Standard in Galois/Counter Mode). Thuật toán này không chỉ mã hóa dữ liệu mà còn cung cấp tính năng xác thực toàn vẹn dữ liệu (authenticated encryption), ngăn chặn việc kẻ xấu sửa đổi dữ liệu đã mã hóa.
*   **Cơ chế Quản lý Khóa (Envelope Encryption - Mã hóa phong bì):**
    1.  Mỗi Tenant có một Khóa Mã hóa Dữ liệu duy nhất (**Data Encryption Key - DEK**). DEK được dùng để trực tiếp mã hóa/giải mã dữ liệu của Tenant đó.
    2.  DEK không được lưu dưới dạng văn bản thô. Nó được mã hóa bởi một Khóa Quản trị Tối cao (**Key Encrypting Key - KEK** hoặc Master Key) nằm an toàn trong dịch vụ quản lý khóa chuyên dụng (AWS KMS hoặc HashiCorp Vault).
    3.  Khi Web Server khởi động hoặc khi nhận yêu cầu xử lý dữ liệu của Tenant, hệ thống gửi DEK đã mã hóa sang AWS KMS để giải mã, sau đó lưu DEK thô trong bộ nhớ đệm an toàn (Memory) của Web Server để sử dụng và tự động hủy sau khi hoàn thành.

---

## 5. Quản lý Bí mật (Secrets Management)

*   **Không lưu thông tin nhạy cảm trong Code:** Tuyệt đối không hardcode mật khẩu database, khóa API bên thứ ba, hoặc khóa ký JWT trong mã nguồn hoặc file `.env` đẩy lên GitHub.
*   **AWS Secrets Manager / HashiCorp Vault:** Tất cả các tham số cấu hình nhạy cảm được quản lý tập trung trên AWS Secrets Manager. Hệ thống EKS Pods khi khởi chạy sẽ sử dụng cơ chế **External Secrets Operator (ESO)** để đồng bộ trực tiếp các bí mật này thành Kubernetes Secrets ở dạng in-memory.

---

## 6. Nhật ký Kiểm toán Bất biến (Tamper-Evident Audit Log)

Để đảm bảo tính không thể phủ nhận (Non-repudiation) và bảo vệ bằng chứng lịch sử, nhật ký kiểm toán (Audit Logs) được thiết kế như sau:

1.  **Kiến trúc ghi Log:** Mỗi khi có thao tác ghi dữ liệu (Create, Update, Delete) hoặc truy cập dữ liệu bảo mật (Read CLS Cột lương), hệ thống sẽ gửi một Event bất đồng bộ đến Module Audit.
2.  **Lưu trữ bất biến:** Module Audit ghi nhận log và đồng bộ trực tiếp vào Amazon S3 với cấu hình **S3 Object Lock** ở chế độ **Compliance Mode**. Chế độ này ngăn chặn bất kỳ ai (kể cả tài khoản root của AWS) sửa đổi hoặc xóa các file log trong khoảng thời gian quy định (ví dụ: 5 năm).
3.  **Cấu trúc Log:**
    ```json
    {
      "id": "audit-log-uuid-v7",
      "tenantId": "tenant-uuid-xyz",
      "userId": "user-uuid-123",
      "action": "hrm.employee.update",
      "resourceId": "hrm.employee.employee-uuid-abc",
      "ipAddress": "1.2.3.4",
      "userAgent": "Mozilla/5.0 ...",
      "timestamp": "2026-07-01T13:16:44Z",
      "changes": {
        "base_salary": {
          "oldValue": "encrypted-hash-1",
          "newValue": "encrypted-hash-2"
        }
      },
      "signature": "hmac-sha256-signature-calculated-using-kms-key"
    }
    ```
    *Mỗi dòng log chứa một chữ ký HMAC sử dụng khóa bảo mật trong AWS KMS để phát hiện bất kỳ sự can thiệp trái phép nào vào dữ liệu nhật ký.*
