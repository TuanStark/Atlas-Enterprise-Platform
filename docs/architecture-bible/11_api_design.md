# Chương 11: Thiết kế API (API Design)

## 1. Thiết kế REST API & GraphQL (Kiến trúc API Lai - Hybrid API)

Atlas sử dụng mô hình kết hợp (Hybrid): **REST API** làm giao thức chủ đạo cho các tác vụ CRUD, tích hợp hệ thống và cấu hình; **GraphQL** được áp dụng cho các giao diện quản trị phức tạp (Dynamic Dashboards) nơi cần gom nhiều dữ liệu quan hệ trong một roundtrip để tránh lỗi Over-fetching hoặc Under-fetching.

### 1.1. Chuẩn hóa REST API
*   **Cấu trúc URL:** Đặt tên tài nguyên ở số nhiều, phân tách rõ Module và Resource.
    `https://api.atlasplatform.com/api/v1/<module_name>/<resource_name>`
    *   Ví dụ đọc danh sách nhân viên: `GET /api/v1/hrm/employees`
    *   Ví dụ duyệt đơn nghỉ phép: `POST /api/v1/hrm/leave-requests/{id}/approve`
*   **Sử dụng Phương thức HTTP (HTTP Methods):**
    *   `GET`: Đọc tài nguyên (Stateless, Safe, Idempotent).
    *   `POST`: Tạo mới tài nguyên hoặc kích hoạt tác vụ nghiệp vụ.
    *   `PUT`: Cập nhật toàn bộ tài nguyên (Idempotent).
    *   `PATCH`: Cập nhật một phần thuộc tính tài nguyên.
    *   `DELETE`: Xóa tài nguyên (Soft delete).

### 1.2. Ứng dụng GraphQL
*   *Khi nào sử dụng:* Khi trang Frontend Dashboard cần hiển thị thông tin: *Ảnh đại diện nhân viên, Tên phòng ban hiện tại, Số ngày phép còn lại, và Danh sách 5 dự án đang tham gia*.
    *   Nếu dùng REST, client sẽ phải thực hiện ít nhất 3-4 cuộc gọi API tuần tự.
    *   Với GraphQL, client chỉ gửi 1 Query duy nhất xác định đúng các trường cần thiết, Backend phân giải tối ưu (sử dụng DataLoader để tránh lỗi N+1 Query).

---

## 2. Quản lý Phiên bản API (Versioning Strategy)

*   **Lựa chọn:** **URL Versioning** (Mã hóa phiên bản trong đường dẫn).
    *   *Ví dụ:* `/api/v1/hrm/employees` và `/api/v2/hrm/employees`
*   **Tại sao chọn:** Dễ định tuyến ở tầng API Gateway (như Kong hay AWS ALB), dễ cấu hình cache, rõ ràng cho các nhà phát triển tích hợp bên thứ ba (David).
*   **Quy tắc ngắt phiên bản (Breaking Changes):** Khi thay đổi cấu trúc dữ liệu bắt buộc (ví dụ: Xóa một cột bắt buộc, thay đổi kiểu dữ liệu trường trả về), bắt buộc phải nâng cấp phiên bản API lên `v2`. Các thay đổi không gây ngắt tương thích (Non-breaking) như thêm trường mới trả về sẽ giữ nguyên phiên bản hiện tại.

---

## 3. Phân trang, Bộ lọc & Sắp xếp (Pagination, Filtering & Sorting)

### 3.1. Phân trang dựa trên Con trỏ (Cursor-based Pagination)
Hệ thống loại bỏ phân trang kiểu Offset (`LIMIT 10 OFFSET 10000`) đối với các bảng dữ liệu lớn vì lý do hiệu năng PostgreSQL (phải quét qua tất cả các dòng trước đó). Thay vào đó, áp dụng **Cursor-based Pagination**:

*   **Tham số yêu cầu:** `limit` (số bản ghi), `starting_after` (con trỏ - thường là UUID v7 hoặc ID của bản ghi cuối cùng của trang trước).
*   **Cú pháp truy vấn SQL tương đương:**
    `SELECT * FROM employee WHERE id > 'last_seen_id_cursor' ORDER BY id ASC LIMIT 10;`
*   **Định dạng phản hồi (Response Schema):**
    ```json
    {
      "data": [...],
      "pagination": {
        "limit": 10,
        "hasMore": true,
        "nextCursor": "018f6719-8c7e-4468-bdae-3bac21fea472"
      }
    }
    ```

### 3.2. Bộ lọc & Sắp xếp động (Dynamic Filtering & Sorting)
Để phục vụ giao diện bảng dữ liệu động (Dynamic Table):
*   **Filtering:** Hỗ trợ cú pháp JSON mã hóa trong URL Parameter:
    `GET /api/v1/hrm/employees?filter={"department_id":{"eq":"dept-uuid"},"status":{"in":["ACTIVE","PROBATION"]}}`
*   **Sorting:** Định nghĩa trường và chiều sắp xếp:
    `GET /api/v1/hrm/employees?sort=-created_at,last_name` (Ký tự `-` đại diện cho sắp xếp giảm dần DESC).

---

## 4. Mô hình Lỗi Chuẩn hóa (RFC 7807 Problem Details)

Hệ thống trả về các phản hồi lỗi theo tiêu chuẩn **RFC 7807 (Problem Details for HTTP APIs)** để Client dễ dàng phân tích và hiển thị giao diện phù hợp:

```json
{
  "type": "https://atlasplatform.com/errors/validation-failed",
  "title": "Dữ liệu đầu vào không hợp lệ",
  "status": 400,
  "detail": "Số ngày xin nghỉ phép vượt quá số dư phép năm còn lại của bạn.",
  "instance": "/api/v1/hrm/leave-requests",
  "errorCode": "HRM_LEAVE_INSUFFICIENT_BALANCE",
  "invalidParams": [
    {
      "name": "duration_days",
      "reason": "Giá trị yêu cầu (5.0) lớn hơn số dư phép hiện tại (3.5)."
    }
  ]
}
```

---

## 5. Cơ chế Chống Trùng lặp (Idempotency Engine)

Để ngăn chặn lỗi người dùng nhấn nút "Gửi đơn" hai lần hoặc do sự cố mạng gửi lại request trùng lặp làm phát sinh 2 giao dịch giống nhau:

```
[Client] Gửi POST /api/v1/hrm/leave-requests kèm Header:
         X-Idempotency-Key: idemp-key-uuid-123
           |
           v
[Web Server] Kiểm tra Key "idemp-key-uuid-123" trong Redis
           |
           +---> (Có dữ liệu?)
           |       - CÓ: Trả ngay kết quả đã lưu trong Redis (Không xử lý lại)
           |       - KHÔNG:
           |           1. Lock Key trong Redis để tránh Request song song
           |           2. Thực thi nghiệp vụ ghi vào Database
           |           3. Lưu HTTP Status và Response Payload vào Redis (TTL: 24h)
           |           4. Trả kết quả về cho Client
```
*   *Lợi ích:* Đảm bảo tính an toàn cho các tác vụ thay đổi tài chính, bảng lương, hoặc duyệt phép dù mạng chập chờn.
