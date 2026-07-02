# Chương 4: Kiến trúc Phần mềm (Software Architecture)

## 1. Kiến trúc Đa tầng Logic (Logical Architecture - Clean Architecture)

Hệ thống áp dụng kiến trúc **Clean Architecture** kết hợp với **Hexagonal Architecture (Ports and Adapters)** trong từng Module để đảm bảo tính độc lập giữa logic nghiệp vụ cốt lõi và các tác nhân hạ tầng ngoại vi (Database, HTTP API, Message Queue).

```
+---------------------------------------------------------------------------------+
|                               Presentation Layer (REST/GraphQL)                 |
+---------------------------------------------------------------------------------+
|                               Application Layer (Use Cases / Commands / Queries)|
|   +-------------------------------------------------------------------------+   |
|   |                           Domain Layer (Entities, Value Objects,        |   |
|   |                            Domain Services, Repository Interfaces)      |   |
|   +-------------------------------------------------------------------------+   |
+---------------------------------------------------------------------------------+
|                               Infrastructure Layer (Prisma, Postgres, Redis, AWS)|
+---------------------------------------------------------------------------------+
```

1.  **Lớp Miền (Domain Layer - Cốt lõi):** Chứa các thực thể nghiệp vụ (Entities), Giá trị miền (Value Objects), Sự kiện (Domain Events), và Giao diện kho lưu trữ (Repository Interfaces). Lớp này hoàn toàn cô lập, không phụ thuộc vào bất kỳ thư viện hay framework nào khác (kể cả NestJS hay Prisma).
2.  **Lớp Ứng dụng (Application Layer):** Định nghĩa các luồng xử lý nghiệp vụ (Use Cases), CQRS Commands và Queries, các Service điều phối. Lớp này sử dụng các Interface định nghĩa ở lớp Domain và tương tác với bên ngoài qua các cổng (Ports).
3.  **Lớp Giao tiếp (Presentation/API Layer):** Xử lý các giao thức mạng (REST Controllers, GraphQL Resolvers, Request Validators, Serialization).
4.  **Lớp Hạ tầng (Infrastructure Layer):** Hiện thực hóa các Repository bằng Prisma Client, tích hợp Redis Caching, cấu hình gửi email qua AWS SES, và triển khai hàng đợi BullMQ.

---

## 2. Mô hình C4 (C4 Model)

Để mô tả kiến trúc ở các mức độ chi tiết khác nhau, chúng tôi sử dụng mô hình C4:

### 2.1. Cấp độ 1: Bối cảnh Hệ thống (System Context Diagram)
Mô tả cách người dùng và các hệ thống bên ngoài tương tác với Atlas Enterprise Platform.

```mermaid
graph LR
    classDef user fill:#2b6cb0,stroke:#1a365d,color:#fff;
    classDef system fill:#319795,stroke:#2c7a7b,color:#fff;
    classDef external fill:#d69e2e,stroke:#b7791f,color:#fff;

    Emp[Nhân viên doanh nghiệp]:::user
    Admin[Tenant Admin]:::user
    Atlas[Atlas Enterprise Platform]:::system
    Email[AWS SES / Mail Gateway]:::external
    IDP[Azure AD / Okta SSO]:::external

    Emp -->|Sử dụng chức năng hàng ngày| Atlas
    Admin -->|Cấu hình hệ thống & phân quyền| Atlas
    Atlas -->|Gửi email thông báo/mã OTP| Email
    Atlas -->|Xác thực SSO OIDC/SAML| IDP
```

### 2.2. Cấp độ 2: Container Diagram
Mô tả các thành phần thực thi độc lập (ứng dụng, cơ sở dữ liệu) tạo nên nền tảng.

```mermaid
graph TD
    classDef web fill:#2c7a7b,stroke:#234e52,color:#fff;
    classDef api fill:#3182ce,stroke:#2b6cb0,color:#fff;
    classDef db fill:#1a202c,stroke:#2d3748,color:#fff;
    classDef mq fill:#d69e2e,stroke:#b7791f,color:#fff;

    Browser[Next.js Web Portal - SPA]:::web
    Mobile[React Native/Mobile Web App]:::web
    Gateway[Kong / NestJS API Gateway]:::api
    Monolith[Modular Monolith Web API - NestJS]:::api
    Redis[Redis Cache & Rate Limiting]:::mq
    BullMQ[BullMQ Background Workers]:::mq
    Postgres[(PostgreSQL Primary - Write)]:::db
    PostgresReplica[(PostgreSQL Replica - Read)]:::db

    Browser -->|HTTPS / REST & GraphQL| Gateway
    Mobile -->|HTTPS / REST & GraphQL| Gateway
    Gateway -->|Forward requests| Monolith
    Monolith -->|Query / Cache Data| Redis
    Monolith -->|Enqueue Jobs| BullMQ
    BullMQ -->|Process background tasks| Monolith
    Monolith -->|Write Queries| Postgres
    Monolith -->|Read Queries| PostgresReplica
```

### 2.3. Cấp độ 3: Component Diagram (Của Module HRM điển hình)
Mô tả cấu trúc nội bộ của Module HRM tích hợp với Platform Core.

```mermaid
graph TD
    classDef controller fill:#3182ce,color:#fff;
    classDef usecase fill:#319795,color:#fff;
    classDef repo fill:#4a5568,color:#fff;
    classDef core fill:#e53e3e,color:#fff;

    Ctrl[LeaveRequest Controller]:::controller
    UC[ApplyLeave Use Case]:::usecase
    Val[Dynamic Leave Validator]:::usecase
    Repo[LeaveRequest Repository Prisma]:::repo
    WFE[Workflow Engine Core]:::core
    Auth[PBAC Engine Core]:::core

    Ctrl -->|Invoke Command| UC
    UC -->|Query limits & validate| Val
    UC -->|Enforce security policies| Auth
    UC -->|Save Draft state| Repo
    UC -->|Submit to Approval Flow| WFE
```

---

## 3. Kiến trúc Vật lý & Triển khai (Deployment Architecture)

Hệ thống được triển khai theo mô hình Cloud-Native trên nền tảng Amazon Web Services (AWS) sử dụng Amazon Elastic Kubernetes Service (EKS) để quản lý container.

```mermaid
graph TD
    classDef vpc fill:#f7fafc,stroke:#cbd5e0,stroke-width:2px;
    classDef net fill:#e2e8f0,stroke:#a0aec0;
    classDef compute fill:#ebf8ff,stroke:#bee3f8;
    classDef data fill:#edf2f7,stroke:#e2e8f0;

    subgraph AWS_Cloud [AWS Cloud Environment]
        subgraph VPC [Amazon VPC]
            subgraph Public_Subnet [Public Subnets - Multi-AZ]
                ALB[AWS Application Load Balancer]
                WAF[AWS WAF]
            end

            subgraph Private_App_Subnet [Private App Subnets - Multi-AZ]
                EKS[Amazon EKS Cluster]
                subgraph EKS_Nodes [EKS Worker Nodes]
                    POD_API[API Pods - Stateless Monolith]
                    POD_WORKER[Worker Pods - BullMQ Queue]
                end
            end

            subgraph Private_Data_Subnet [Private Data Subnets - Multi-AZ]
                RDS_Primary[(Amazon RDS PostgreSQL Master)]
                RDS_Replica[(Amazon RDS PostgreSQL Replica)]
                ElastiCache[(Amazon ElastiCache Redis Cluster)]
            end
        end
        Route53[Amazon Route 53 DNS]
        S3[Amazon S3 Object Storage]
        KMS[Amazon KMS Key Vault]
    end

    Route53 --> ALB
    WAF --> ALB
    ALB --> EKS
    EKS_Nodes --> RDS_Primary
    EKS_Nodes --> RDS_Replica
    EKS_Nodes --> ElastiCache
    EKS_Nodes --> S3
    EKS_Nodes --> KMS
```

---

## 4. Luồng Thực thi Nghiệp vụ (Sequence Diagrams)

### 4.1. Quy trình Tuyển dụng và Khởi tạo Tài khoản (Onboarding & Identity Provisioning)
Mô tả luồng tương tác khi một nhân viên mới được tạo và hệ thống tự động thiết lập bảo mật.

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Tenant Admin
    participant Gateway as API Gateway
    participant EMP as Employee Module
    participant EventBus as Event Hub (In-Memory/Redis)
    participant IAM as IAM Core Module
    participant SES as AWS SES Mailer

    Admin->>Gateway: Gửi thông tin nhân viên mới (CCCD, Họ tên, Email, Phòng ban)
    Gateway->>EMP: Gọi lệnh CreateEmployeeCommand
    EMP->>EMP: Lưu hồ sơ nhân sự vào DB (Mã hóa CCCD)
    EMP->>EventBus: Phát sự kiện EmployeeCreatedEvent
    EMP-->>Gateway: Trả về HTTP 201 (Employee Created)
    Gateway-->>Admin: Hiển thị thông báo tạo thành công

    Note over EventBus, IAM: Xử lý bất đồng bộ (Asynchronous Background Task)
    EventBus->>IAM: Tiêu thụ sự kiện EmployeeCreatedEvent
    IAM->>IAM: Khởi tạo thực thể Identity mới
    IAM->>IAM: Tạo mã kích hoạt tài khoản OTP (Token hết hạn trong 24h)
    IAM->>SES: Yêu cầu gửi email kích hoạt tài khoản
    SES->>Admin: Gửi email chào mừng kèm link thiết lập mật khẩu & kích hoạt MFA
```

---

## 5. Các Mẫu Giao tiếp (Communication Patterns)

Hệ thống áp dụng ba mô hình giao tiếp để tối ưu hóa hiệu năng và khả năng mở rộng:

1.  **Giao tiếp Đồng bộ nội bộ (Synchronous Internal Calls):**
    *   *Cách thực hiện:* Sử dụng cơ chế Dependency Injection của NestJS. Module A tiêm (Inject) Interface Service của Module B.
    *   *Ràng buộc:* Module A không bao giờ được phép trực tiếp thay đổi cơ sở dữ liệu của Module B. Mọi hành động ghi hoặc đọc chéo phải thông qua Service Interface.
2.  **Giao tiếp Bất đồng bộ dựa trên Sự kiện (Asynchronous Event-Driven):**
    *   *Cách thực hiện:* Sử dụng một Event Hub dùng chung. Khi một thay đổi trạng thái quan trọng xảy ra, module sở hữu sẽ phát đi một Event (ví dụ: `LeaveRequestApprovedEvent`). Các module khác đăng ký lắng nghe (Subscribe) sự kiện này để tự động cập nhật dữ liệu của mình.
    *   *Lợi ích:* Giảm thiểu tối đa sự phụ thuộc trực tiếp (decoupling), tăng tốc thời gian phản hồi API của luồng chính.
3.  **Hàng đợi Công việc nền (Distributed Task Queue):**
    *   *Cách thực hiện:* Sử dụng BullMQ kết hợp Redis.
    *   *Ứng dụng:* Các công việc tiêu tốn nhiều tài nguyên hoặc thời gian (ví dụ: Tính toán bảng lương cho 10,000 nhân viên, xuất file báo cáo PDF lớn, gửi email hàng loạt) sẽ được đẩy vào hàng đợi dưới dạng các Job và được xử lý tuần tự/song song bởi các Worker Pods riêng biệt.
