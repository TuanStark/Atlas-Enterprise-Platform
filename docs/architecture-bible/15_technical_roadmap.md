# Chương 15: Lộ trình Triển khai Kỹ thuật (Technical Roadmap)

Để hiện thực hóa kiến trúc của **Atlas Enterprise Platform** từ bản thiết kế giấy sang một hệ thống chạy thực tế, lộ trình phát triển được phân chia thành 4 giai đoạn chiến lược trong vòng **6 tháng**:

```
+---------------------------------------------------------------------------------+
| Tháng 1 - 2: Giai đoạn 1 (Nền tảng Lõi - Platform Core)                         |
|   - Setup Monorepo, DB Schema Base, OAuth2, Tenant Onboarding, RLS Extension    |
+---------------------------------------------------------------------------------+
                                      |
                                      v
+---------------------------------------------------------------------------------+
| Tháng 3: Giai đoạn 2 (Động cơ Nền tảng - Platform Engines)                      |
|   - PBAC Policy Engine, Workflow Engine State Machine, Metadata dynamic schemas |
+---------------------------------------------------------------------------------+
                                      |
                                      v
+---------------------------------------------------------------------------------+
| Tháng 4 - 5: Giai đoạn 3 (Module HRM Nghiệp vụ)                                 |
|   - Employee Profiles, Leave, Time & Attendance, Payroll Core                   |
+---------------------------------------------------------------------------------+
                                      |
                                      v
+---------------------------------------------------------------------------------+
| Tháng 6: Giai đoạn 4 (Vận hành & Phát hành - Production Ready)                  |
|   - CI/CD, Terraform AWS, Monitoring Prometheus/Loki, Audit Log S3 Lock         |
+---------------------------------------------------------------------------------+
```

---

## Giai đoạn 1: Thiết lập Nền tảng Lõi (Tháng 1 - Tháng 2)

*   **Mục tiêu:** Xây dựng khung xương (boilerplate) của Modular Monolith và thiết lập các tính năng định danh, cách ly đa thuê cơ bản.
*   **Các tác vụ cốt lõi:**
    *   Setup Monorepo dự án (NestJS Backend + Next.js Frontend).
    *   Thiết kế Prisma schema cơ sở và cấu hình kết nối PostgreSQL.
    *   Hiện thực hóa **Prisma Extension for RLS** để chèn tự động `app.current_tenant_id` trước mỗi truy vấn.
    *   Xây dựng module IAM: Xác thực JWT, Refresh Token, Đăng ký/Đăng nhập, MFA.
    *   Viết API tự động khởi tạo Tenant mới (Tenant Onboarding).
*   **Mốc hoàn thành (Milestone):** Tạo thành công 2 Tenant khác nhau, chứng minh dữ liệu được lưu trên cùng 1 bảng nhưng được cách ly hoàn toàn qua RLS ở tầng database.

---

## Giai đoạn 2: Phát triển Các Động cơ dùng chung (Tháng 3)

*   **Mục tiêu:** Xây dựng xong bộ ba động cơ cốt lõi (AuthZ Engine, Workflow Engine, Metadata Platform).
*   **Các tác vụ cốt lõi:**
    *   **PBAC Engine:** Xây dựng module đánh giá Policy JSON động. Tích hợp Redis Caching cho quyền hạn của User.
    *   **Workflow Engine:** Viết bộ quản lý máy trạng thái (State Machine). Cấu hình lưu trữ Workflow Schema và thực thể Workflow Instance.
    *   **Metadata Platform:** Thiết kế cơ chế lưu trữ Dynamic Attributes trong JSONB. Viết Dynamic Renderer ở Next.js để đọc UI Schema và tự động render form nhập liệu.
*   **Mốc hoàn thành (Milestone):** Đơn xin nghỉ phép dạng thô (Resource) có thể được đính kèm vào luồng duyệt của Workflow Engine, quyền duyệt được kiểm tra bằng PBAC.

---

## Giai đoạn 3: Triển khai Module HRM Nghiệp vụ (Tháng 4 - Tháng 5)

*   **Mục tiêu:** Phát triển toàn bộ nghiệp vụ Quản lý nhân sự sử dụng hạ tầng của Core.
*   **Các tác vụ cốt lõi:**
    *   **Hồ sơ nhân sự:** Quản lý thông tin cá nhân, mã hóa dữ liệu nhạy cảm bằng AES-256-GCM.
    *   **Nghỉ phép:** Xây dựng module tính toán số dư ngày phép, tích hợp luồng xin nghỉ phép đi qua Workflow Engine.
    *   **Chấm công:** Tích hợp API GPS/Wi-Fi để check-in/out. Viết công cụ đối soát bảng công (Timesheet).
    *   **Tính lương:** Phát triển công cụ biên dịch công thức tính lương động (Salary Formula Engine) và chạy phiên lương hàng tháng.
*   **Mốc hoàn thành (Milestone):** Nhân viên thực hiện chấm công trên giao diện di động, hệ thống tính công, tính lương tự động ra Payslip và gửi duyệt bảng lương thành công.

---

## Giai đoạn 4: Vận hành, Giám sát & Phát hành (Tháng 6)

*   **Mục tiêu:** Đóng gói, viết code hạ tầng và tối ưu hóa hệ thống để sẵn sàng đưa lên môi trường Production.
*   **Các tác vụ cốt lõi:**
    *   Viết Dockerfile Multi-stage và thiết lập GitHub Actions CI/CD tự động build/push ECR.
    *   Viết mã nguồn **Terraform** khởi tạo cụm VPC, EKS, RDS, ElastiCache trên AWS.
    *   Thiết lập cụm giám sát **Prometheus + Grafana + Loki** trên EKS để thu gom Log và Metrics.
    *   Tích hợp OpenTelemetry để Trace vết hiệu năng từ API Gateway đến database.
    *   Cấu hình Amazon S3 Object Lock để lưu trữ Audit Logs bất biến chống giả mạo.
    *   Chạy các bài kiểm thử tải (Load Testing sử dụng k6) để xác định điểm nghẽn và tinh chỉnh cấu hình Autoscaling.
*   **Mốc hoàn thành (Milestone):** Hệ thống đạt chứng chỉ bảo mật kiểm toán nội bộ, vượt qua bài test tải 5,000 RPS mà không tăng độ trễ p99 vượt quá 200ms.
