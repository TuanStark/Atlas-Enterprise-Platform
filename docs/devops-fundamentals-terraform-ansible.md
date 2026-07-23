# 📘 Căn Bản & Bản Chất Infrastructure as Code: Terraform vs. Ansible
### *DevOps Mindset Zero-to-Hero (Tối Ưu Copy Vào Notion)*

---

## 🏢 1. ẨN DỤ THỰC TẾ: BÀI TOÁN XÂY DỰNG VĂN PHÒNG CHUẨN

Hãy tưởng tượng công ty của bạn muốn xây dựng một **Văn phòng làm việc thông minh 100 nhân viên (Ứng dụng HRM + Database)**:

```text
       ┌─────────────────────────────────────────────────────────┐
       │   BÀI TOÁN XÂY DỰNG HỆ THỐNG VĂN PHÒNG (HẠ TẦNG IT)    │
       └────────────────────────────┬────────────────────────────┘
                                    │
           ┌────────────────────────┴────────────────────────┐
           ▼                                                 ▼
┌──────────────────────────────┐          ┌──────────────────────────────┐
│  1. ĐỘI XÂY DỰNG KHUNG NHÀ   │          │ 2. ĐỘI THI CÔNG NỘI THẤT     │
│        (TERRAFORM)           │          │          (ANSIBLE)           │
├──────────────────────────────┤          ├──────────────────────────────┤
│ • Mua khu đất (VPC Network)  │          │ • Đi vào từng phòng qua SSH  │
│ • Xây tường cách ly (Subnets)│          │ • Dọn vệ sinh, tắt SWAP      │
│ • Gắn cửa bảo vệ (Firewall)  │          │ • Lắp điện nước (Sysctl tune)│
│ • Dựng các phòng trống (VMs) │          │ • Cài máy điều hòa (Docker)  │
└──────────────────────────────┘          └──────────────────────────────┘
```

1. **TERRAFORM (Đội Xây Dựng Khung Nhà - Provisioning)**:
   - **Nhiệm vụ:** Tạo ra các **tài nguyên thô** (Đất, Tường, Phòng trống, Cổng bảo vệ).
   - **Xong việc:** Đội Terraform thu dọn máy móc và rời đi. Kết quả trả về là những **căn phòng máy chủ trống rỗng nhưng đã có dải mạng và cửa bảo vệ**.

2. **ANSIBLE (Đội Thi Công Nội Thất & Thiết Bị - Configuration Management)**:
   - **Nhiệm vụ:** Đi vào các căn phòng trống mà Terraform vừa xây xong để **lắp đặt thiết bị bên trong**.
   - Ansible mở cửa (SSH), đi từng máy: dọn dẹp hệ thống, chỉnh sửa file cấu hình Linux, cài đặt Docker, containerd, bật tường lửa...
   - **Xong việc:** Căn phòng máy chủ sẵn sàng cho nhân viên (**Kubernetes & App NestJS/React**) vào làm việc!

---

## 🧱 2. BẢN CHẤT CỦA TERRAFORM (TẠO HẠ TẦNG)

### ❌ Cách làm thủ công truyền thống (Hand-clicking)
Ngày trước, để tạo 1 con Server trên Cloud (AWS, Google Cloud, DigitalOcean):
1. Bạn mở trình duyệt, đăng nhập vào Web Console.
2. Bấm nút "Create VPC" ➔ Điền IP `10.0.0.0/16`.
3. Bấm "Create Subnet" ➔ Điền IP `10.0.1.0/24`.
4. Bấm "Create Server" ➔ Chọn Ubuntu, chọn RAM/CPU...
5. **Rủi ro:** Bạn tốn 2 tiếng bấm tay. Nếu sếp bảo *"Tạo thêm 1 môi trường Staging giống hệt thế này"*, bạn lại phải ngồi bấm lại 50 bước ➔ Rất dễ bấm nhầm 1 ô tick box gây sự cố bảo mật!

### 🟢 Cách làm với TERRAFORM (Infrastructure as Code)
Thay vì bấm tay trên Web, bạn viết tất cả mong muốn vào 1 file văn bản (`main.tf`):

```hcl
# "Tôi muốn 1 mạng VPC dải 10.0.0.0/16 và 3 con máy chủ Ubuntu"
resource "aws_vpc" "my_vpc" {
  cidr_block = "10.0.0.0/16"
}
```

- Bạn gõ lệnh `terraform apply`.
- **Terraform tự đóng vai trò người đại diện:** Nó gọi API lên AWS/GCP để tự bấm tạo đúng 100% những gì bạn viết trong file chỉ trong **2 phút**!
- **Muốn tạo môi trường Staging thứ 2?** Bạn chỉ cần đổi tên biến `env = "staging"`, gõ `terraform apply` ➔ 2 phút sau có ngay hạ tầng mới tinh giống hệt!

---

### 🔑 4 Khái niệm cốt lõi của Terraform:

1. **Provider (Con dấu kết nối)**:
   - Terraform không tự tạo ra máy chủ, nó cần "Provider" để kết nối với bên khác.
   - Có `aws provider` để nói chuyện với AWS, `docker provider` để nói chuyện với Docker, `local provider` để tạo file trên máy bạn.
2. **Resource (Tài nguyên muốn tạo)**:
   - Cú pháp: `resource "loại_tài_nguyên" "tên_đặt_cho_dễ_gọi"`
   - Ví dụ: `resource "aws_vpc" "hrm_vpc"` nghĩa là *"Hãy tạo cho tôi 1 VPC đặt tên là hrm_vpc"*.
3. **State File (`terraform.tfstate` - Cuốn sổ nhật ký)**:
   - Sau khi tạo xong, Terraform ghi lại vào 1 cuốn sổ tên là `terraform.tfstate`: *"Hôm nay tôi đã tạo VPC ID 123, Server IP 10.0.2.10"*.
   - Nhờ cuốn sổ này, lần sau bạn gõ `terraform apply`, nó biết tài nguyên nào **đã có rồi** nên sẽ không tạo trùng lặp.
4. **Plan (Báo cáo trước khi làm)**:
   - Khi bạn gõ `terraform plan`, Terraform sẽ so sánh Code của bạn với Cuốn sổ Nhật ký và báo cho bạn biết:  
     `+ Create 3 resources` (Sẽ tạo mới 3 cái), `~ Update 1` (Sửa 1 cái), `- Destroy 0` (Xóa 0 cái).

---

## 🔧 3. BẢN CHẤT CỦA ANSIBLE (CẤU HÌNH SERVER)

### ❌ Cách làm thủ công truyền thống
Giả sử bạn vừa dùng Terraform tạo xong **10 con máy chủ Linux trống**.
- Bạn phải tự mở terminal, gõ SSH vào từng máy:  
  `ssh ubuntu@10.0.2.11` ➔ gõ `apt update` ➔ gõ `apt install docker` ➔ gõ `swapoff -a`...
- Làm xong máy 1, lại SSH sang máy 2... làm 10 lần. Mất cả ngày và rất dễ gõ thiếu lệnh ở máy số 7!

### 🟢 Cách làm với ANSIBLE (Agentless Configuration Management)
Ansible **không cần cài bất kỳ phần mềm gì lên các máy chủ đích**! Nó chỉ cần tài khoản SSH.

Bạn chỉ đưa cho Ansible đúng **2 file**:
1. **Inventory (`hosts.ini` - Danh sách địa chỉ nhà)**:
   ```ini
   [web_servers]
   10.0.2.11
   10.0.2.12
   10.0.2.13
   ```
2. **Playbook (`site.yml` - Danh sách việc cần làm)**:
   ```yaml
   - name: Việc 1 - Tắt SWAP bộ nhớ
     shell: swapoff -a

   - name: Việc 2 - Cài đặt phần mềm Docker
     apt:
       name: docker.io
       state: present
   ```

- Bạn gõ lệnh `ansible-playbook -i hosts.ini site.yml`.
- Ansible sẽ **tự động SSH vào cả 10 con máy cùng một lúc** và chạy lần lượt các việc trong danh sách chỉ trong **30 giây**!

---

### 🔑 Tính năng "Thần thánh" của Ansible: IDEMPOTENCY (Tính bất biến)

Giả sử bạn chạy lệnh Ansible lần thứ nhất:
- Máy 1 chưa có Docker ➔ Ansible tiến hành cài Docker ➔ Báo trạng thái: **`changed`** (Đã thay đổi).

Bạn lỡ tay gõ lại lệnh Ansible lần thứ hai:
- Ansible SSH vào Máy 1, kiểm tra thấy Docker **đã được cài từ trước rồi** ➔ Ansible thông báo: **`ok`** (Đã chuẩn rồi, không làm lại nữa để tránh hỏng máy).

> 💡 **Tóm lại:** Ansible cực kỳ an toàn. Bạn có thể chạy đi chạy lại Playbook hàng trăm lần mà không sợ làm sập hay rối loạn server!

---

## 🤝 4. HAI CÔNG CỤ NÀY PHỐI HỢP TRONG DỰ ÁN ATLAS HRM CỦA BẠN

Trong thư mục `infrastructure/` mà chúng ta vừa thiết kế:

```text
BƯỚC 1: Bạn gõ `terraform apply`
  └─► Terraform tạo VPC, Subnet, mở Firewall Port
  └─► Terraform tự động ghi danh sách IP của máy vừa tạo vào file `ansible/inventory/hosts.ini`

BƯỚC 2: Bạn gõ `ansible-playbook -i hosts.ini site.yml`
  └─► Ansible đọc file `hosts.ini` vừa được Terraform tạo ra
  └─► Ansible SSH vào từng máy để tắt SWAP, cài containerd, chuẩn bị máy sẵn sàng cho Kubernetes!
```

---

## 📊 5. BẢNG SO SÁNH NHANH (QUICK REFERENCE TABLE)

| Tiêu chí | **Terraform** | **Ansible** | **Kubernetes (K8s)** |
| :--- | :--- | :--- | :--- |
| **Nhiệm vụ chính** | **Tạo khung nhà** (VPC, Subnet, VMs). | **Lắp điện nước, điều hòa** (Cài Docker, Tắt SWAP). | **Quản lý nhân viên làm việc** (Chạy Pods, Auto-scale App). |
| **Giao thức** | Cloud API (AWS, GCP, Azure). | SSH / WinRM. | K8s API Server (`kubectl`). |
| **Mô hình** | Declarative (Khai báo). | Declarative + Imperative. | Declarative. |
| **File cấu hình** | HCL (`.tf`). | YAML (`.yml`) + INI (`hosts.ini`). | YAML (`.yaml`). |
