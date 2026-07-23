# 🏗️ Infrastructure as Code (IaC) - Atlas Enterprise Platform

> **Bộ mã nguồn Tự động hóa Hạ tầng Vân tay (Provisioning) & Cấu hình Bảo mật Máy chủ (Configuration Management)**

![AWS 3-Tier Architecture](../docs/AWS-HRM.png)

---

## 📋 MỤC LỤC

- [Tổng Quan Kiến Trúc IaC](#-tổng-quan-kiến-trúc-iac)
- [Cấu Trúc Thư Mục](#-cấu-trúc-thư-mục)
- [Yêu Cầu Tiền Đề & Xác Thực (Prerequisites)](#-yêu-cầu-tiền-đề--xác-thực-prerequisites)
- [Hướng Dẫn Triển Khai (Execution Runbook)](#-hướng-dẫn-triển-khai-execution-runbook)
- [Chi Tiết Các Modules & Roles](#-chi-tiết-các-modules--roles)

---

## 🌐 TỔNG QUAN KIẾN TRÚC IaC

Hạ tầng IaC được phân tách thành 2 giai đoạn độc lập:

1. **Terraform (Provisioning)**: Tự động khởi tạo mạng AWS VPC 3 lớp (Public Subnet, Private App Subnet, Private DB Subnet), tạo Security Groups ma trận và dựng các con máy chủ EC2 (Master & Worker Nodes).
2. **Ansible (Configuration Management & Hardening)**: Tự động SSH vào các máy chủ EC2 để dọn dẹp OS (Tắt SWAP, tune kernel sysctl), siết chặt SSH Security (Khóa root, khóa password) và cài đặt Container Runtime (`containerd`).

---

## 📁 CẤU TRÚC THƯ MỤC

```text
infrastructure/
├── terraform/                             # [TERRAFORM PROVISIONING]
│   ├── main.tf                            # Root Module kết nối 3 Sub-Modules
│   ├── variables.tf                       # Biến tổng (VPC CIDR, Subnets, Node Count)
│   ├── outputs.tf                         # Đầu ra thông số tổng quan hạ tầng
│   └── modules/                           # Sub-modules tái sử dụng
│       ├── network/                       # Module VPC Mạng 3 Lớp
│       ├── security/                      # Module Ma Trận Firewall Security Groups
│       └── compute/                       # Module Nodes & Dynamic Inventory Generator
│
└── ansible/                               # [ANSIBLE CONFIGURATION]
    ├── inventory/
    │   └── hosts.ini                      # Tự động sinh ra từ Terraform
    ├── roles/                             # Ansible Roles tái sử dụng (CIS Benchmark)
    │   ├── os_hardening/                  # Tắt SWAP, Kernel Sysctl Tune, System Limits
    │   ├── ssh_hardening/                 # Tắt SSH Root Login, Tắt Password Auth
    │   └── containerd/                    # Cài đặt Containerd & Systemd Cgroup Driver
    └── playbooks/
        └── site.yml                       # Master Playbook thực thi toàn bộ Roles
```

---

## 🔑 YÊU CẦU TIỀN ĐỀ & XÁC THỰC (PREREQUISITES)

### 1. Cấp Quyền Tài Khoản AWS Cho Terraform

Trước khi chạy Terraform, bạn cần nạp Credentials tài khoản AWS (Access Key & Secret Key):

#### Cách 1: Nạp biến môi trường Terminal (Nhanh cho Dev Local)
```bash
export AWS_ACCESS_KEY_ID="AKIAXXXXXXXXXXXXXXXX"
export AWS_SECRET_ACCESS_KEY="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
export AWS_DEFAULT_REGION="ap-southeast-1"
```

#### Cách 2: Sử dụng AWS CLI Config File (`~/.aws/credentials`)
```bash
aws configure
```

#### Cách 3: Cấu hình trên CI/CD Pipeline (GitHub Actions / GitLab CI)
Lưu 2 chìa khóa vào **GitHub Repository Secrets**:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

Và nạp vào bước chạy Terraform trong file Workflow YAML:
```yaml
- name: Terraform Apply
  env:
    AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
    AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    AWS_DEFAULT_REGION: "ap-southeast-1"
  run: terraform apply -auto-approve
```

> ⚠️ **LƯU Ý BẢO MẬT:** Tuyệt đối **KHÔNG** hardcode Access Key/Secret Key vào bất kỳ file `.tf` nào để tránh bị lộ khi push code lên GitHub.

---

## 🚀 HƯỚNG DẪN TRIỂN KHAI (EXECUTION RUNBOOK)

### Bước 1: Khởi Tạo Hạ Tầng Mạng & EC2 Nodes Bằng Terraform

```bash
cd infrastructure/terraform

# 1. Khởi tạo các provider plugins
terraform init

# 2. Xem trước các tài nguyên sắp tạo (Dry-run)
terraform plan

# 3. Tiến hành tạo hạ tầng thực tế
terraform apply -auto-approve
```
*Sau khi chạy xong, Terraform sẽ tự động sinh file danh sách IP tại `infrastructure/ansible/inventory/hosts.ini`.*

---

### Bước 2: Bảo Mật & Lắp Đặt Thiết Bị EC2 Nodes Bằng Ansible

```bash
cd ../ansible

# Chạy Master Playbook cấu hình cho toàn bộ EC2 Nodes
ansible-playbook -i inventory/hosts.ini playbooks/site.yml
```

---

## 🛠️ CHI TIẾT CÁC MODULES & ROLES

### 🔹 Terraform Modules
* **`modules/network`**: Phân chia VPC dải `10.0.0.0/16` thành Public Subnet (`10.0.1.0/24`), Private App Subnet (`10.0.2.0/24`) và Private DB Subnet (`10.0.3.0/24`).
* **`modules/security`**: Mở chính xác các cổng K8s API (`6443`), Kubelet (`10250`), NodePort (`30000-32767`), và cách ly PostgreSQL (`5432`)/Redis (`6379`) chỉ cho phép kết nối từ App Subnet.
* **`modules/compute`**: Khởi tạo EC2 Instances và tự động sinh Ansible Inventory bằng template HCL.

### 🔹 Ansible Roles (CIS Hardening)
* **`os_hardening`**: Tắt Memory SWAP (`swapoff -a`), cấu hình `sysctl` (`net.ipv4.ip_forward = 1`, `net.bridge.bridge-nf-call-iptables = 1`) và nâng `pam_limits` (`nofile = 65535`).
* **`ssh_hardening`**: Thiết lập `PermitRootLogin no`, `PasswordAuthentication no` và `ClientAliveInterval 300`.
* **`containerd`**: Cài đặt `containerd` runtime với cấu hình `SystemdCgroup = true`.

---

## 📚 TÀI LIỆU KHAM THẢO CHUYÊN SÂU

* 📄 [Tài Liệu Chi Tiết Enterprise IaC Masterclass Guide](../docs/stage-2-enterprise-iac-guide.md)
* 📄 [Tài Liệu Nền Tảng & Bản Chất Terraform vs. Ansible](../docs/devops-fundamentals-terraform-ansible.md)
