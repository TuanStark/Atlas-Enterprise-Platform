# Chương 14: Nhật ký Quyết định Kiến trúc (Architectural Decision Records - ADR)

Tài liệu này ghi lại các quyết định kỹ thuật cốt lõi trong quá trình thiết kế hệ thống, giải thích bối cảnh, các giải pháp thay thế đã được đánh giá, và lý do đưa ra lựa chọn cuối cùng.

---

## ADR-01: Lựa chọn Kiến trúc Modular Monolith cho Giai đoạn Khởi đầu

*   **Mã số:** ADR-01
*   **Trạng thái:** APPROVED
*   **Ngày quyết định:** 2026-07-01
*   **Tác giả:** Principal Software Architect

### Bối cảnh (Context)
Hệ thống Atlas cần được thiết kế có khả năng mở rộng tối đa và sẵn sàng chuyển đổi thành Microservices khi quy mô lớn. Tuy nhiên, việc xây dựng Microservices ngay từ ngày đầu tiên (Day 1) sẽ tiêu tốn tài nguyên phát triển lớn, gia tăng độ phức tạp trong kiểm thử, quản lý hạ tầng Kubernetes phức tạp, và đối mặt với các vấn đề về phân tán dữ liệu và giao tiếp qua mạng chậm.

### Quyết định (Decision)
Chúng tôi quyết định xây dựng hệ thống theo mô hình **Modular Monolith (Monolith phân rã mô-đun) trước**. Tất cả các module nghiệp vụ (như HRM) được viết độc lập trong cùng một repository (Monorepo), chạy chung trong một tiến trình NestJS duy nhất nhưng tuân thủ nghiêm ngặt các ranh giới:
*   Mỗi module sở hữu database schema riêng, cấm SQL JOIN chéo.
*   Giao tiếp chéo module thông qua interface dịch vụ và Event Hub bất đồng bộ.

### Hệ quả & Đánh giá Đánh đổi (Consequences)
*   **Ưu điểm (Pros):**
    *   Tốc độ phát triển cực nhanh (Developer Velocity), dễ dàng chạy thử và kiểm thử tự động.
    *   Chi phí hạ tầng vận hành ban đầu thấp (chỉ cần chạy một cụm Pod nhỏ thay vì hàng chục service).
    *   Refactor ranh giới bối cảnh (Bounded Context boundary) cực kỳ dễ dàng khi yêu cầu nghiệp vụ thay đổi.
*   **Nhược điểm (Cons):**
    *   Vẫn chạy chung một tiến trình, lỗi tràn bộ nhớ (Memory Leak) của một module tồi vẫn có thể làm sập toàn bộ hệ thống.
*   **Khả năng mở rộng tương lai (Future Scalability):** Việc tuân thủ ranh giới cơ sở dữ liệu và giao tiếp qua interface giúp việc bóc tách một module thành một Microservice độc lập trong tương lai (Strangler Fig Pattern) có thể thực hiện được trong vòng vài ngày mà không cần viết lại mã nguồn cốt lõi.

---

## ADR-02: Cách ly Dữ liệu Đa thuê bằng PostgreSQL Row-Level Security (RLS)

*   **Mã số:** ADR-02
*   **Trạng thái:** APPROVED
*   **Ngày quyết định:** 2026-07-01
*   **Tác giả:** Principal Software Architect

### Bối cảnh (Context)
Atlas là nền tảng SaaS đa thuê (Multi-tenant). Việc rò rỉ dữ liệu giữa Tenant A và Tenant B là một thảm họa bảo mật nghiêm trọng. Chúng ta cần một cơ chế cách ly dữ liệu tuyệt đối an toàn nhưng vẫn tối ưu hóa chi phí hạ tầng (không phải tạo hàng ngàn database RDS đắt đỏ cho các tenant nhỏ).

### Quyết định (Decision)
Chúng tôi quyết định áp dụng giải pháp **Shared Database, Logical Isolation sử dụng PostgreSQL Row-Level Security (RLS)** làm mặc định:
*   Mỗi truy vấn SQL được tự động áp bộ lọc dựa trên biến phiên làm việc `app.current_tenant_id` được thiết lập ở tầng Prisma Client Extension.
*   Hệ thống vẫn hỗ trợ cấu hình Dynamic Routing chuyển sang database riêng đối với các khách hàng Enterprise lớn có yêu cầu đặc biệt.

### Hệ quả & Đánh giá Đánh đổi (Consequences)
*   **Ưu điểm (Pros):**
    *   An toàn tuyệt đối: Quy tắc lọc được thực thi trực tiếp ở tầng nhân cơ sở dữ liệu PostgreSQL. Lập trình viên Backend không thể quên thêm điều kiện `WHERE tenant_id`.
    *   Tối ưu chi phí cực lớn: Tiết kiệm tài nguyên phần cứng vì hàng ngàn khách hàng dùng chung một cụm database RDS.
*   **Nhược điểm (Cons):**
    *   Tạo thêm một chút overhead hiệu năng đối với các truy vấn lớn (khoảng 2-3% thời gian xử lý do PostgreSQL phải đánh giá policy).
    *   Khó khăn hơn khi viết các tác vụ thống kê báo cáo liên tenant phục vụ Platform Operator (phải tạm thời tắt RLS bằng quyền BYPASSRLS để chạy report).

---

## ADR-03: Sử dụng PostgreSQL JSONB làm Nền tảng Dữ liệu Đặc tả (Metadata)

*   **Mã số:** ADR-03
*   **Trạng thái:** APPROVED
*   **Ngày quyết định:** 2026-07-01
*   **Tác giả:** Principal Software Architect

### Bối cảnh (Context)
Nền tảng Metadata yêu cầu khả năng thêm bớt thuộc tính động cho các đối tượng (như Hồ sơ nhân viên) mà không chạy các câu lệnh SQL DDL (`ALTER TABLE`). Chúng ta cần một giải pháp lưu trữ linh hoạt.

### Giải pháp thay thế đã đánh giá
1.  *EAV (Entity-Attribute-Value):* Thiết kế bảng dạng dọc (mỗi thuộc tính là một dòng). Rejected vì truy vấn join lấy toàn bộ thông tin một thực thể cực kỳ phức tạp và chậm.
2.  *NoSQL (MongoDB):* Cực kỳ linh hoạt cho schema động. Rejected vì hệ thống Core của Atlas mang tính quan hệ rất cao (Org Chart, Auth, Workflow), sử dụng NoSQL sẽ làm mất tính toàn vẹn giao dịch (ACID).

### Quyết định (Decision)
Chọn giải pháp **PostgreSQL JSONB** kết hợp bảng Metadata khai báo.
Mỗi bảng thực thể vật lý chứa một cột `attributes JSONB`. Cấu trúc của trường JSONB này được định nghĩa và kiểm định dựa trên bảng cấu hình `attribute_metadata`.

### Hệ quả & Đánh giá Đánh đổi (Consequences)
*   **Ưu điểm (Pros):**
    *   Đảm bảo tính ACID giao dịch của cơ sở dữ liệu quan hệ PostgreSQL trên toàn hệ thống.
    *   Hiệu năng tìm kiếm cao nhờ chỉ mục GIN trên cột JSONB.
*   **Nhược điểm (Cons):**
    *   Dung lượng lưu trữ của JSONB lớn hơn một chút so với các cột kiểu dữ liệu nguyên bản (do phải lưu cả khóa dữ liệu - key).

---

## ADR-04: Sử dụng Redis & BullMQ làm Hàng đợi Tác vụ Nền thay vì Kafka

*   **Mã số:** ADR-04
*   **Trạng thái:** APPROVED
*   **Ngày quyết định:** 2026-07-01
*   **Tác giả:** Principal Software Architect

### Bối cảnh (Context)
Hệ thống cần một giải pháp để xử lý các công việc bất đồng bộ, lập lịch tác vụ nhắc nhở (Workflow Reminder), và xử lý hàng đợi tính lương.

### Giải pháp thay thế đã đánh giá
*   *Apache Kafka / RabbitMQ:* Các hệ thống message broker chuyên nghiệp. Rejected cho giai đoạn đầu vì việc vận hành cụm Kafka tốn quá nhiều tài nguyên hạ tầng và công sức cấu hình của đội ngũ DevOps.

### Quyết định (Decision)
Sử dụng **Redis làm Backend lưu trữ và BullMQ làm thư viện quản lý Hàng đợi tác vụ nền**.

### Hệ quả & Đánh giá Đánh đổi (Consequences)
*   **Ưu điểm (Pros):**
    *   Tái sử dụng cụm hạ tầng Redis sẵn có (đang dùng để cache), không tốn thêm chi phí và công sức cấu hình hạ tầng mới.
    *   BullMQ hỗ trợ tính năng **Delayed Jobs** cực kỳ mạnh mẽ và dễ sử dụng, giải quyết hoàn hảo bài toán nhắc nhở duyệt đơn sau X giờ.
*   **Nhược điểm (Cons):**
    *   Redis lưu hàng đợi hoàn toàn trên RAM. Nếu RAM bị tràn hoặc cụm Redis bị sập đột ngột mà không cấu hình AOF (Append-Only File) chuẩn xác, có nguy cơ bị mất một số Job chưa xử lý.
    *   *Giải pháp khắc phục:* Cấu hình persistence (AOF) cho Redis Cluster của BullMQ với tần suất ghi đĩa cao (`appendfsync everysec`).
