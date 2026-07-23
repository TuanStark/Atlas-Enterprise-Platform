# 🏛️ CHUYÊN SÂU HẠ TẦNG ENTERPRISE IaC (STAGE 2 MASTERCLASS)
### *Dự Án: Atlas Enterprise Platform (HRM System)*

Tài liệu hướng dẫn chuyên sâu về Kiến trúc Hạ tầng IaC Chuẩn Enterprise, mô hình phân tách 3 lớp VPC AWS, Security Groups Ma trận, và Quy trình Hardening Server bằng Ansible Roles.

---

## 🌐 1. SƠ ĐỒ KIẾN TRÚC HẠ TẦNG CHUẨN AWS (AWS 3-TIER VPC ARCHITECTURE)

![AWS 3-Tier VPC Architecture Blueprint](file:///home/stark/Documents/Middle+/Atlas-Enterprise-Platform/docs/AWS-HRM.png)

---

## 📂 2. TỔNG QUAN CẤU TRÚC MÃ NGUỒN IaC (`infrastructure/`)

```text
infrastructure/
├── terraform/
│   ├── main.tf                            # [ROOT] Module chính kết nối 3 Sub-Modules
│   ├── variables.tf                       # [ROOT] Biến tổng (VPC CIDR, Subnets, Node Count)
│   ├── outputs.tf                         # [ROOT] Xuất thông số tổng quan hạ tầng
│   └── modules/                           # [MODULES ARCHITECTURE]
│       ├── network/                       # 1. Module Mạng VPC 3 Lớp Cách Ly
│       │   ├── main.tf
│       │   ├── variables.tf
│       │   └── outputs.tf
│       ├── security/                      # 2. Module Bảo Mật Ma Trận Security Groups (CIS)
│       │   ├── main.tf
│       │   ├── variables.tf
│       │   └── outputs.tf
│       └── compute/                       # 3. Module Khởi Tạo Server Nodes & Auto-Inventory
│           ├── main.tf
│           ├── variables.tf
│           └── outputs.tf
└── ansible/
    ├── inventory/
    │   └── hosts.ini                      # [AUTO-GENERATED] Dynamic Inventory từ Terraform
    ├── roles/                             # [ROLES REUSABLE ARCHITECTURE]
    │   ├── os_hardening/                  # Role 1: Tắt SWAP, Sysctl Tune, System Limits
    │   │   └── tasks/main.yml
    │   ├── ssh_hardening/                 # Role 2: SSH Security (No Password, No Root Login)
    │   │   └── tasks/main.yml
    │   └── containerd/                    # Role 3: Container Runtime & Systemd Cgroup
    │       └── tasks/main.yml
    └── playbooks/
        └── site.yml                       # [MASTER PLAYBOOK] Chạy toàn bộ Roles
```

---

## 🛡️ 3. PHÂN TÍCH CHUYÊN SÂU TERRAFORM MODULAR DESIGN

### 3.1. Module 1: Network - Mô hình Phòng thủ 3 Lớp (`modules/network`)
Không giống như các hạ tầng đơn giản đặt chung một dải Subnet, mô hình Enterprise bắt buộc phân tách dải IP thành **3 Subnet Độc lập**:

* **Public Subnet (`10.0.1.0/24`)**: Chứa Ingress Gateway và Public Load Balancers. Đây là nơi duy nhất mở cổng đón lượng truy cập từ Internet.
* **Private App Subnet (`10.0.2.0/24`)**: Chứa các Worker Nodes chạy ứng dụng NestJS/React. Các máy trong dải này **không có Public IP**, không thể bị scan trực tiếp từ Internet.
* **Private DB Subnet (`10.0.3.0/24`)**: Chứa Database PostgreSQL & Redis. Dải này hoàn toàn bị cô lập: **Chỉ có Private App Subnet mới được phép gửi traffic tới**.

---

### 3.2. Module 2: Security - Ma Trận Firewall Hạt Nhân (`modules/security`)
Thay vì mở cổng bừa bãi, Security Groups được quy hoạch theo từng phân vùng chức năng:

| Phân vùng SG | Cổng được mở | Mục đích kỹ thuật | Nguồn truy cập (CIDR) |
| :--- | :--- | :--- | :--- |
| **Control Plane SG** | `6443` | K8s API Server | Nội bộ VPC (`10.0.0.0/16`) |
| | `2379-2380` | etcd Key-Value Store Cluster | Nội bộ Master Nodes |
| | `10257/10259` | Controller Manager & Scheduler | Nội bộ Master Nodes |
| **Worker Nodes SG** | `10250` | Kubelet API Metrics | Nội bộ VPC (`10.0.0.0/16`) |
| | `8472` (UDP) | Flannel VXLAN Overlay Network | Nội bộ Worker Nodes |
| | `179` (TCP) | Calico BGP Peer Routing | Nội bộ Worker Nodes |
| | `30000-32767` | NodePort Services | Allowed Ingress |
| **Database SG** | `5432` / `6379` | PostgreSQL & Redis DB | **Chỉ từ App Subnet (`10.0.2.0/24`)** |

---

### 3.3. Module 3: Compute - Liên Kết Tự Động Với Ansible (`modules/compute`)
Một điểm mấu chốt của Senior DevOps là **Tự động hóa hoàn toàn luồng dữ liệu giữa các công cụ (Tooling Interoperability)**.

Trong `modules/compute/main.tf`, tài nguyên `local_file.dynamic_ansible_inventory` sử dụng cú pháp **Terraform Template Syntax (`%{ for ... }`)** để tự động đọc số lượng Worker Nodes được cấu hình, sau đó tự sinh ra file `infrastructure/ansible/inventory/hosts.ini` mà không cần con người phải gõ tay địa chỉ IP!

---

## 🔧 4. PHÂN TÍCH CHUYÊN SÂU ANSIBLE ROLES & HARDENING (CIS BENCHMARK)

Ansible được tái cấu trúc thành các **Roles độc lập**. Mỗi Role chịu trách nhiệm cho một tiêu chuẩn bảo mật Linux chuẩn CIS (Center for Internet Security):

### 4.1. Role `os_hardening` (`roles/os_hardening/tasks/main.yml`)
* **Tắt Memory SWAP (`swapoff -a` & `fstab`)**: Bắt buộc 100%. Nếu không tắt SWAP, Kubelet sẽ không thể tính toán chính xác Resource Limits (`requests` / `limits` RAM của Pod), dẫn tới tình trạng Pod tràn bộ nhớ gây treo Node.
* **Cấu hình Kernel Sysctl (`sysctl.conf`)**:
  * `net.bridge.bridge-nf-call-iptables = 1`: Ép gói tin mạng đi qua Virtual Bridge phải được lọc qua IPTables rules (cần thiết cho K8s Service Proxy & Network Policy).
  * `net.ipv4.ip_forward = 1`: Cho phép Linux Node làm Router chuyển tiếp các gói tin IP giữa các Pod.
  * `vm.max_map_count = 262144`: Mở rộng giới hạn bộ nhớ ảo cho các cơ sở dữ liệu như Elasticsearch/PostgreSQL.
* **System Resource Limits (`pam_limits`)**: Nâng giới hạn file descriptors (`nofile = 65535`) và process count (`nproc = 65535`) để tránh lỗi `Too many open files` khi ứng dụng có hàng nghìn kết nối đồng thời.

---

### 4.2. Role `ssh_hardening` (`roles/ssh_hardening/tasks/main.yml`)
* `PermitRootLogin no`: Cấm tuyệt đối đăng nhập SSH trực tiếp bằng tài khoản `root`.
* `PasswordAuthentication no`: Cấm đăng nhập bằng mật khẩu thường (chống tấn công Brute-force). Bắt buộc 100% SSH Authentication phải dùng **SSH Key Pair (Ed25519 / RSA 4096-bit)**.
* `ClientAliveInterval 300`: Tự động ngắt kết nối SSH nếu Admin không thao tác sau 5 phút (ngăn chặn rò rỉ session khi bỏ máy ra ngoài).

---

### 4.3. Role `containerd` (`roles/containerd/tasks/main.yml`)
* Cấu hình **`SystemdCgroup = true`**:
  * Mặc định `containerd` dùng `cgroupfs` driver. Tuy nhiên OS Ubuntu/Debian hiện đại dùng `systemd` làm init system.
  * Việc đồng bộ cả `containerd` và `kubelet` cùng sử dụng `systemd` cgroup driver giúp ngăn chặn hiện tượng Node bị ngắt kết nối khi hệ thống thiếu tài nguyên bộ nhớ (OOM State).

---

## ⚡ 5. QUẢN LÝ DRIFT & CI/CD IaC PIPELINE

### 5.1. Khái niệm Configuration Drift (Trôi dạt Cấu hình)
Configuration Drift xảy ra khi ai đó tự ý truy cập vào AWS Console hoặc gõ lệnh trực tiếp trên Server để đổi cấu hình (ví dụ: mở thêm port 8080) **mà không sửa trong code Terraform/Ansible**.

### 5.2. Cách Senior DevOps Xử Lý Drift:
1. **Chạy Drift Detection tự động hàng ngày trong CI/CD (GitHub Actions / GitLab CI):**
   ```bash
   terraform plan -detailed-exitcode
   ```
   * Trả về Exit Code `0`: Cấu hình trên Cloud và Code hoàn toàn trùng khớp.
   * Trả về Exit Code `2`: **Phát hiện Drift!** Có ai đó đã sửa tay trên Cloud. CI/CD sẽ gửi cảnh báo lên Telegram/Slack Bot lập tức.

2. **Chạy `terraform apply` để ghi đè (Revert) hạ tầng về đúng trạng thái khai báo trong Code (Single Source of Truth).**

---

## 🚀 6. QUY TRÌNH THỰC THI THỰC TẾ (OPS RUNBOOK)

Khi triển khai toàn bộ hạ tầng này, bạn chỉ cần thực hiện 2 lệnh:

```bash
# 1. Provisioning Mạng & Nodes bằng Terraform Modular
cd infrastructure/terraform
terraform init
terraform apply -auto-approve

# 2. Hardening Security & Containerd bằng Master Ansible Playbook
cd ../ansible
ansible-playbook -i inventory/hosts.ini playbooks/site.yml
```
