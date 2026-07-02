# Chương 7: Nền tảng Phân quyền (Authorization Platform)

## 1. Các Thực thể Phân quyền Cốt lõi

Để hỗ trợ phân quyền từ mức thô (Coarse-grained) đến mức cực kỳ chi tiết (Fine-grained), hệ thống xây dựng mô hình phân quyền **PBAC (Policy-based Access Control)** kế thừa các ưu điểm của RBAC và ABAC.

```
+------------------+       +------------------+       +-------------------+
|    Identity      |------>|    Principal     |------>|   Subject Context |
|  - Email, Auth   |       |  - User, Client  |       |  - Roles, Dept    |
+------------------+       +------------------+       +-------------------+
                                                                |
                                                                v
+------------------+       +------------------+       +-------------------+
|      Action      |------>|     Resource     |------>|   Policy Engine   |
|  - CREATE, READ  |       |  - hrm.employee  |       |  - Evaluate Rules |
+------------------+       +------------------+       +-------------------+
```

*   **Identity (Định danh):** Thông tin đăng nhập vật lý của người dùng (tài khoản, mật khẩu, session).
*   **Principal (Chủ thể):** Đại diện cho một thực thể hoạt động trong hệ thống sau khi đã được xác thực thành công. Có 3 loại Principal chính:
    *   `User Principal`: Người dùng thực tế.
    *   `Client Principal`: Ứng dụng/Hệ thống bên ngoài tích hợp qua API Key.
    *   `Service Principal`: Tiến trình chạy ngầm nội bộ (Worker/Cron).
*   **Role (Vai trò):** Tập hợp các Permission được đặt tên (ví dụ: HR Lead, Team Leader). Một Principal có thể sở hữu nhiều Role cùng lúc.
*   **Action (Hành động):** Thao tác mà Principal muốn thực hiện trên Resource. Gồm 5 hành động tiêu chuẩn (`CREATE`, `READ`, `UPDATE`, `DELETE`, `EXECUTE`) và các hành động tùy biến (`APPROVE`, `REOPEN`, `EXPORT`).
*   **Resource (Tài nguyên):** Đối tượng đích cần bảo vệ (ví dụ: `hrm.employee`, `hrm.leave_request`). Mọi tài nguyên đều được định danh bằng mã định danh tài nguyên chuẩn hóa (Uniform Resource Name - URN): `urn:atlas:<tenant_id>:<module>:<resource_type>:<resource_id>`.
*   **Scope (Phạm vi):** Ranh giới truy cập dữ liệu (ví dụ: `self` - chính mình, `department` - cùng phòng ban, `global` - toàn hệ thống).
*   **Policy (Chính sách):** Luật quy định rõ AI được làm GÌ trên TÀI NGUYÊN NÀO dưới ĐIỀU KIỆN gì.

---

## 2. Kiến trúc Động cơ Quyết định (XACML Reference Model)

Hệ thống triển khai công cụ phân quyền theo mô hình tham chiếu tiêu chuẩn công nghiệp **XACML (eXtensible Access Control Markup Language)**:

```
                  +-----------------------------------+
                  |   PEP (Policy Enforcement Point)  | <--- Gửi API Yêu cầu Phân quyền
                  +-----------------------------------+
                                    |
                                    v (Yêu cầu đánh giá)
+-------------+   +-----------------------------------+
|  Policy DB  |-->|     PDP (Policy Decision Point)   |
+-------------+   +-----------------------------------+
                                    |
                                    v (Truy xuất thuộc tính động)
                  +-----------------------------------+
                  |   PIP (Policy Information Point)  | ---> Lấy dữ liệu Phòng ban/Hợp đồng
                  +-----------------------------------+
```

1.  **PEP (Policy Enforcement Point - Điểm Thực thi):** Nằm ở tầng Middleware / API Gateway. PEP đánh chặn request HTTP, đóng gói context thành một Authorization Request và gửi sang PDP để xin quyết định. PEP chịu trách nhiệm từ chối request nếu PDP trả về `DENY`.
2.  **PDP (Policy Decision Point - Điểm Quyết định):** Động cơ trung tâm (Policy Engine). PDP tải các Policy tương thích, thực hiện đánh giá các biểu thức logic và trả ra quyết định cuối cùng (`ALLOW` hoặc `DENY`), kèm theo các điều kiện lọc dòng (RLS Filter) và che cột (CLS Configuration).
3.  **PIP (Policy Information Point - Điểm Thông tin):** Cung cấp các thông tin/thuộc tính động cần thiết cho việc đánh giá mà không có sẵn trong Request. Ví dụ: Nếu Policy yêu cầu so sánh phòng ban của User với phòng ban của Nhân viên mục tiêu, PIP chịu trách nhiệm truy vấn database để lấy thông tin phòng ban hiện tại của cả hai.
4.  **PAP (Policy Administration Point - Điểm Quản trị):** Giao diện quản trị (Admin Console) nơi Tenant Admin (Bob) tạo, sửa đổi và xuất bản các Policy.

---

## 3. Đặc tả Cấu trúc Chính sách Phân quyền (PBAC Policy Schema)

Tất cả các chính sách phân quyền được cấu hình dưới dạng tài liệu JSON khai báo (Declarative JSON) để dễ lưu trữ, truyền tải và thay đổi trực tiếp mà không cần sửa code:

```json
{
  "id": "policy-hrm-dept-mgr-read-employee",
  "name": "Trưởng phòng xem hồ sơ nhân viên trực thuộc",
  "description": "Cho phép Trưởng phòng đọc thông tin hồ sơ của nhân viên cùng phòng ban, ngoại trừ thông tin nhạy cảm như lương.",
  "effect": "ALLOW",
  "principals": {
    "roles": ["Department_Manager"]
  },
  "resources": ["hrm.employee"],
  "actions": ["READ"],
  "conditions": {
    "and": [
      {
        "operator": "EQUALS",
        "subject.tenant_id": "resource.tenant_id"
      },
      {
        "operator": "EQUALS",
        "subject.department_id": "resource.department_id"
      }
    ]
  },
  "columnSecurity": {
    "exclude": ["base_salary", "bank_account_number"]
  }
}
```

*   **`effect`:** Xác định hành vi khi khớp luật (`ALLOW` hoặc `DENY`). Quy tắc ưu tiên: **Deny Overrides** (chỉ cần khớp một luật DENY thì toàn bộ yêu cầu bị bác bỏ).
*   **`conditions`:** Chứa các toán tử logic động (`and`, `or`, `not`) và so sánh giá trị thuộc tính (`EQUALS`, `IN`, `CONTAINS`, `GREATER_THAN`).
*   **`columnSecurity`:** Định nghĩa chính sách che thông tin (Column-Level Security). Ở ví dụ trên, Trưởng phòng được xem hồ sơ nhưng các trường lương (`base_salary`) và số tài khoản ngân hàng (`bank_account_number`) sẽ bị tự động xóa bỏ khỏi kết quả trả về.

---

## 4. Cơ chế Kế thừa, Ủy quyền & Phân quyền Tạm thời

### 4.1. Kế thừa Phân quyền (Permission Inheritance)
*   **Kế thừa theo Vai trò (Role Hierarchy):** Một Role cấp cao tự động kế thừa tất cả các Permission của Role cấp thấp hơn. Ví dụ: `HR_Director` tự động kế thừa toàn bộ quyền của `HR_Staff`.
*   **Kế thừa theo Cây Tổ chức (Org Tree Hierarchy):** Khi quản lý phòng IT có quyền phê duyệt trên Node phòng IT, quyền phê duyệt này tự động có hiệu lực đối với các Node con trực thuộc (ví dụ: Team Web Dev, Team Mobile Dev) trừ khi có một Policy phủ quyết ở cấp độ con.

### 4.2. Ủy quyền & Quyền hạn Tạm thời (Delegation & Temporary Permission)
Để giải quyết bài toán nghiệp vụ khi quản lý đi vắng hoặc ủy thác quyền duyệt dự án:

*   **Ủy quyền Phê duyệt (Approval Delegation):**
    *   Người dùng A (Delegator) có thể tạo một bản ghi ủy quyền cho Người dùng B (Delegatee) duyệt các tài nguyên thuộc loại `hrm.leave_request`.
    *   Bản ghi ủy quyền bắt buộc phải cấu hình khoảng thời gian có hiệu lực (`start_time` và `end_time`).
    *   Trong khoảng thời gian này, khi hệ thống gửi Approval Task cho A, hệ thống sẽ tự động nhân bản hoặc chuyển tiếp Task đó cho B.
*   **Ủy quyền Phân vai trò Tạm thời (Temporary Role Assignment):**
    *   Cho phép gắn một Role cho một Principal kèm theo thời gian hết hạn (TTL).
    *   Hệ thống tự động chạy một tiến trình quét định kỳ (Cron Worker) hoặc kiểm tra thời gian thực ở tầng AuthZ để tự động thu hồi Role khi hết hiệu lực.

---

## 5. Tối ưu hóa Bộ nhớ Đệm Phân quyền (Permission Cache Strategy)

Việc đánh giá hàng chục Policy phức tạp trên mỗi API Request sẽ tạo ra độ trễ lớn nếu liên tục truy vấn database. Atlas áp dụng chiến lược caching hai tầng tối ưu:

```
[API Request]
      |
      v (Kiểm tra Cache bộ nhớ cục bộ - Local L1 Cache)
[Có dữ liệu?] -- Có (Thừa nhận trong <1 giây) --> Trả kết quả
      | Không
      v (Kiểm tra Redis Cluster - Distributed L2 Cache)
[Có dữ liệu?] -- Có (Hạn dùng: 30 Phút) --------> Lưu L1 & Trả kết quả
      | Không
      v (Đánh giá PDP thực tế & Truy vấn DB)
[Lưu kết quả vào L2 và L1]
```

*   **Cấu trúc Key trên Redis:** Lưu trữ quyền đã phân giải của User dưới dạng Hash Map:
    `tenant:{tenantId}:user:{userId}:permissions`
*   **Cơ chế Hủy Cache Tức thời (Cache Invalidation Event-driven):**
    Không bao giờ đợi cache tự hết hạn (TTL) khi có thay đổi bảo mật. Hệ thống lắng nghe các Domain Event:
    *   Khi Tenant Admin sửa đổi Policy hoặc thu hồi vai trò của User: Hệ thống phát sự kiện `PolicyChangedEvent` hoặc `UserRoleUpdatedEvent`.
    *   Các Web Server bắt được sự kiện này sẽ ngay lập tức xóa cache tương ứng trên Redis và L1 Cache của mình. Lần yêu cầu API tiếp theo của User bắt buộc phải đánh giá lại từ PDP.
