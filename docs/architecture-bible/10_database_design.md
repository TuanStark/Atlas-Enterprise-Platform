# Chương 10: Thiết kế Cơ sở Dữ liệu (Database Design)

## 1. Lược đồ Thực thể & Mối quan hệ (Logical Database Schemas)

Hệ thống được thiết kế trên mô hình cơ sở dữ liệu quan hệ PostgreSQL. Dưới đây là lược đồ bảng logic cho phân hệ Core và Module HRM:

### 1.1. Bảng dữ liệu Phân hệ Core

#### Bảng `tenant`
*   `id` (UUID v7, PK)
*   `code` (VARCHAR(50), UNIQUE) - Mã định danh duy nhất của tenant.
*   `name` (VARCHAR(255))
*   `status` (VARCHAR(20)) - Trạng thái: ACTIVE, SUSPENDED, DELETED.
*   `created_at` (TIMESTAMP)
*   `updated_at` (TIMESTAMP)

#### Bảng `user_account`
*   `id` (UUID v7, PK)
*   `tenant_id` (UUID, FK -> tenant.id)
*   `email` (VARCHAR(150), UNIQUE)
*   `password_hash` (VARCHAR(255))
*   `is_mfa_enabled` (BOOLEAN)
*   `mfa_secret` (VARCHAR(128), Nullable)
*   `status` (VARCHAR(20)) - ACTIVE, INACTIVE, LOCKED.

#### Bảng `org_node`
*   `id` (UUID v7, PK)
*   `tenant_id` (UUID, FK -> tenant.id)
*   `node_type` (VARCHAR(50)) - COMPANY, BRANCH, DEPT, TEAM...
*   `code` (VARCHAR(50))
*   `name` (VARCHAR(255))
*   `valid_from` (TIMESTAMP)
*   `valid_to` (TIMESTAMP)

#### Bảng `org_relation`
*   `id` (UUID v7, PK)
*   `tenant_id` (UUID, FK -> tenant.id)
*   `parent_node_id` (UUID, FK -> org_node.id)
*   `child_node_id` (UUID, FK -> org_node.id)
*   `dimension` (VARCHAR(50)) - LINE, PROJECT, FUNCTIONAL.
*   `path` (VARCHAR(1000)) - Materialized Path (e.g. `/root/parent/child`).
*   `valid_from` (TIMESTAMP)
*   `valid_to` (TIMESTAMP)

### 1.2. Bảng dữ liệu Module HRM

#### Bảng `employee`
*   `id` (UUID v7, PK)
*   `tenant_id` (UUID, FK -> tenant.id)
*   `user_id` (UUID, FK -> user_account.id, Nullable) - Liên kết tài khoản đăng nhập.
*   `employee_code` (VARCHAR(50))
*   `first_name` (VARCHAR(100))
*   `last_name` (VARCHAR(100))
*   `national_id_encrypted` (VARCHAR(512)) - Số CMND/CCCD được mã hóa cấp ứng dụng (ALE).
*   `attributes` (JSONB) - Chứa các trường dữ liệu động cấu hình qua Metadata Platform.
*   `created_at` (TIMESTAMP)
*   `updated_at` (TIMESTAMP)
*   `deleted_at` (TIMESTAMP, Nullable)

#### Bảng `leave_request`
*   `id` (UUID v7, PK)
*   `tenant_id` (UUID, FK -> tenant.id)
*   `employee_id` (UUID, FK -> employee.id)
*   `leave_type` (VARCHAR(50)) - ANNUAL, SICK, UNPAID...
*   `start_date` (TIMESTAMP)
*   `end_date` (TIMESTAMP)
*   `duration_days` (DECIMAL(5, 2))
*   `status` (VARCHAR(30)) - DRAFT, PENDING, APPROVED, REJECTED.
*   `workflow_instance_id` (UUID, Nullable) - Liên kết với trạng thái Workflow.

---

## 2. Quy ước Đặt tên (Naming Conventions)

Để đảm bảo tính nhất quán giữa hàng trăm bảng dữ liệu trong tương lai:
1.  **Tên bảng & Cột:** Sử dụng chữ thường kết hợp dấu gạch dưới (`lower_snake_case`). Ví dụ: `user_account`, `employee_code`.
2.  **Số nhiều/Số ít:** Tên bảng dùng danh từ số ít (ví dụ: `employee`, không dùng `employees`).
3.  **Khóa chính (PK):** Luôn là trường `id` kiểu dữ liệu UUID (ưu tiên UUIDv7 để bảo toàn thứ tự sắp xếp theo thời gian ghi, giúp tăng hiệu năng đánh chỉ mục).
4.  **Khóa ngoại (FK):** Đặt tên bằng cách ghép tên bảng đích ở số ít và hậu tố `_id`. Ví dụ: `tenant_id` liên kết với bảng `tenant`.
5.  **Mốc thời gian:** Sử dụng hậu tố `_at` (ví dụ: `created_at`, `updated_at`, `deleted_at`). Dữ liệu thời hạn có hậu tố `_to`/`_from` (ví dụ: `valid_to`, `valid_from`).

---

## 3. Chiến lược Đánh Chỉ mục (Indexing Strategy)

*   **Chỉ mục Khóa chính & Khóa ngoại:** PostgreSQL tự động tạo index cho Khóa chính (PK). Chúng tôi bắt buộc phải tạo index thủ công cho tất cả các Khóa ngoại (FK) để tối ưu hóa hiệu năng của các câu lệnh kết hợp bảng (JOIN).
*   **Chỉ mục Tổ hợp (Composite Index) cho Cách ly Tenant:**
    Hầu hết các truy vấn trong hệ thống đa thuê đều lọc theo `tenant_id`. Do đó, các bảng lớn sẽ được đánh chỉ mục tổ hợp bắt đầu bằng cột `tenant_id`. Ví dụ:
    `CREATE INDEX idx_employee_tenant_code ON employee(tenant_id, employee_code);`
*   **Chỉ mục Một phần (Partial Index) cho Soft Delete:**
    Để bỏ qua các bản ghi đã xóa tạm thời khi tìm kiếm:
    `CREATE INDEX idx_employee_active ON employee(tenant_id) WHERE deleted_at IS NULL;`
*   **Chỉ mục Văn bản (Full-Text Search Index):**
    Sử dụng chỉ mục **GIN (Generalized Inverted Index)** kết hợp với `to_tsvector` của PostgreSQL để hỗ trợ tìm kiếm nhân sự nhanh theo tên không dấu hoặc có dấu:
    `CREATE INDEX idx_employee_search_name ON employee USING gin(to_tsvector('simple', first_name || ' ' || last_name));`

---

## 4. Chiến lược Phân vùng & Phân mảnh (Partitioning & Sharding Strategy)

### 4.1. Phân vùng Bảng (Table Partitioning)
Với các bảng lưu trữ dữ liệu khổng lồ tăng trưởng liên tục theo thời gian (ví dụ: bảng nhật ký `audit_log` hoặc bảng chấm công thô `timesheet_raw`), hệ thống áp dụng cơ chế **Declarative Partitioning** của PostgreSQL:

*   **Phương thức:** Phân vùng theo phạm vi thời gian (**Range Partitioning**).
*   **Thiết lập:** Chia bảng theo từng tháng hoặc từng năm.
    ```sql
    -- Tạo bảng mẹ
    CREATE TABLE audit_log (
        id UUID NOT NULL,
        tenant_id UUID NOT NULL,
        action VARCHAR(100) NOT NULL,
        created_at TIMESTAMP NOT NULL,
        PRIMARY KEY (id, created_at) -- Cột phân vùng bắt buộc phải nằm trong khóa chính
    ) PARTITION BY RANGE (created_at);

    -- Tạo bảng con cho tháng 7 năm 2026
    CREATE TABLE audit_log_y2026m07 PARTITION OF audit_log
        FOR VALUES FROM ('2026-07-01 00:00:00') TO ('2026-08-01 00:00:00');
    ```
*   **Lợi ích:** Khi truy vấn nhật ký của tháng hiện tại, PostgreSQL chỉ quét trên phân vùng tương ứng (Partition Pruning), giúp loại bỏ việc quét hàng tỷ dòng dữ liệu cũ, tăng tốc độ truy vấn lên hàng trăm lần.

### 4.2. Phân mảnh Cơ sở dữ liệu (Sharding)
Khi cơ sở dữ liệu vật lý vượt quá giới hạn phần cứng của một máy chủ duy nhất (ngưỡng 10TB+ dữ liệu):
*   **Chiến lược:** Sharding theo `tenant_id` sử dụng công cụ mở rộng **Citus Engine** cho PostgreSQL hoặc kiến trúc **Amazon Aurora Multi-Master**.
*   Dữ liệu của các Tenant có lượng bản ghi khổng lồ sẽ được chuyển sang các máy chủ vật lý riêng biệt (Shard Nodes), trong khi các Tenant nhỏ dùng chung tài nguyên trên máy chủ trung tâm.

---

## 5. Chiến lược Lưu trữ Lịch sử & Xóa tạm (Archiving & Soft Delete)

### 5.1. Xóa tạm (Soft Delete)
*   Hệ thống không bao giờ thực hiện câu lệnh `DELETE` vật lý đối với dữ liệu nghiệp vụ của khách hàng. Thay vào đó, thiết lập cột `deleted_at = current_timestamp`.
*   **Giải quyết xung đột Unique Constraint:**
    Khi nhân viên A nghỉ việc (xóa hồ sơ) và sau đó được tuyển dụng lại với cùng mã nhân viên `NV01`. Nếu dùng index unique thông thường trên `employee_code` sẽ bị lỗi trùng lặp.
    *   *Giải pháp:* Tạo chỉ mục duy nhất có điều kiện (Unique Partial Index):
        `CREATE UNIQUE INDEX uq_employee_code ON employee(tenant_id, employee_code) WHERE deleted_at IS NULL;`

### 5.2. Lưu trữ Lịch sử (Data Archiving)
Dữ liệu lịch sử kiểm toán hoặc chấm công thô quá 2 năm (Cold Data) ít khi được truy cập hàng ngày nhưng vẫn phải lưu giữ theo quy định pháp lý:

```
[PostgreSQL (Hot Data)]
       |
       v (Tiến trình ETL hàng tháng)
[Chuyển đổi thành định dạng nén Apache Parquet]
       |
       v
[Amazon S3 Glacier (Cold Data)] <--- Truy vấn qua AWS Athena khi cần kiểm toán
```

*   **Lợi ích:** Giải phóng dung lượng đĩa SSD đắt đỏ trên PostgreSQL, giảm dung lượng backup hệ thống, và tối ưu hóa chi phí hạ tầng (lưu trữ trên S3 rẻ hơn 90% so với database RDS).
