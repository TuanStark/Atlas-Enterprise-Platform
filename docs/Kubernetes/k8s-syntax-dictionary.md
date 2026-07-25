# 📖 BỘ TỪ ĐIỂN CÚ PHÁP KUBERNETES MANIFESTS (K8S SYNTAX DICTIONARY)
### *Giải Thích Chi Tiết Ý Nghĩa Từng Dòng Code Trong Thư Mục `k8s/`*

---

## 🏛️ 1. CẤU TRÚC 4 THÁP CĂN BẢN CỦA MỌI FILE K8S YAML

Mọi file K8s YAML dù ngắn hay dài đều bắt buộc phải có 4 trường cấp cao nhất này:

```yaml
apiVersion: apps/v1      # 1. Nhóm API quản lý đối tượng
kind: Deployment         # 2. Loại đối tượng muốn tạo (Deployment, Service, Job...)
metadata:                # 3. Định danh (Tên, Namespace, Labels)
  name: backend
spec:                    # 4. Specification - Cấu hình chi tiết mong muốn
  replicas: 2
```

---

## 🔍 2. BẢO MẬT & QUẢN LÝ POD (`k8s/05-backend-deployment.yaml`)

### A. Khai báo Cấu hình Cấp cao (Metadata & Specs)

| Cú pháp (Syntax) | Ý nghĩa kỹ thuật & Lý do sử dụng |
| :--- | :--- |
| **`apiVersion: apps/v1`** | Nhóm API quản lý các khối chạy Pods như `Deployment`, `StatefulSet`, `DaemonSet`. |
| **`kind: Deployment`** | Khai báo loại đối tượng: Quản lý vòng đời và số lượng bản sao của Stateless Pods. |
| **`metadata.name: backend`** | Tên định danh duy nhất của Deployment này trong Cluster. |
| **`metadata.namespace: hrm-system`** | Đặt Deployment vào phân vùng đĩa cách ly `hrm-system`. |
| **`metadata.labels.app: backend`** | Nhãn dán phân loại để tìm kiếm nhanh (`kubectl get -l app=backend`). |
| **`spec.replicas: 2`** | Số bản sao Pod chạy song song. K8s đảm bảo luôn giữ đủ 2 Pods sống. |
| **`spec.selector.matchLabels`** | **Cực kỳ quan trọng!** Sợi dây liên kết giúp Deployment biết Pod nào thuộc quyền quản lý của nó (`app: backend`). |
| **`spec.template`** | "Khuôn mẫu" để K8s đúc ra các Pod mới. |
| **`template.metadata.labels`** | Nhãn dán lên từng Pod được đúc ra (Bắt buộc phải khớp với `matchLabels`). |

---

### B. Bảo Mật Pod SecurityContext (Siết Chặt Security)

```yaml
securityContext:
  runAsNonRoot: true   # [1] Cấm chạy bằng User Root
  runAsUser: 1001      # [2] Ép chạy bằng UID 1001 (User nestjs)
  runAsGroup: 1001     # [3] Gán Group ID 1001
  fsGroup: 1001        # [4] Đổi quyền sở hữu đĩa Mount PVC sang GID 1001
```

* **`runAsNonRoot: true`**: Nếu container cố tình chạy bằng tài khoản Root (UID 0), K8s sẽ chặn và từ chối bật Pod.
* **`fsGroup: 1001`**: (File System Group) Tự động đổi quyền sở hữu tất cả các ổ đĩa Mount (PVC) thành GID `1001` để User `1001` có quyền ghi/đọc file vào thư mục `/app/uploads` mà không bị lỗi `EACCES: permission denied`.

---

### C. Khai Báo Container & Image Pull Policy

| Cú pháp (Syntax) | Ý nghĩa kỹ thuật |
| :--- | :--- |
| **`containers.name: backend`** | Tên đại diện của container bên trong Pod. |
| **`containers.image: erp-backend:latest`** | Tên Docker Image được sử dụng để chạy container. |
| **`imagePullPolicy: IfNotPresent`** | **Chính sách tải Image:** <br>• `Always`: Luôn kéo Image mới từ Registry về mỗi khi start Pod.<br>• `IfNotPresent`: Chỉ tải nếu ở máy local chưa có (Tiết kiệm băng thông).<br>• `Never`: Chỉ dùng Image local có sẵn. |
| **`ports.containerPort: 3000`** | Cổng mà ứng dụng NestJS bên trong container đang mở lắng nghe. |

---

### D. Tách Cấu Hình (ConfigMap & Secret Injection)

```yaml
envFrom:
  - configMapRef:
      name: hrm-config   # Nạp toàn bộ biến tĩnh từ ConfigMap hrm-config
  - secretRef:
      name: hrm-secret      # Nạp toàn bộ chìa khóa mã hóa từ Secret hrm-secret
```
* Tự động biến tất cả cặp Key-Value trong ConfigMap/Secret thành các biến môi trường `process.env.VARIABLE_NAME` trong Node.js.

---

### E. Quản Lý Tài Nguyên (Resource Allocation: Requests vs Limits)

```yaml
resources:
  requests:
    cpu: 250m        # [1] Cam kết tối thiểu 0.25 CPU Core
    memory: 256Mi    # [2] Cam kết tối thiểu 256MB RAM
  limits:
    cpu: 500m        # [3] Giới hạn trần tối đa 0.5 CPU Core
    memory: 512Mi    # [4] Giới hạn trần tối đa 512MB RAM
```

* **`requests` (Giữ chỗ):** K8s dựa vào con số này để Scheduler tìm Node có đủ tài nguyên rảnh rỗi đưa Pod vào.
* **`limits.cpu`:** Nếu Pod vượt quá 500m CPU, K8s sẽ bóp chậm tiến trình lại (CPU Throttling).
* **`limits.memory`:** Nếu Pod dùng vượt quá 512MB RAM, K8s sẽ ra lệnh diệt Pod ngay lập tức (**OOMKilled**).

---

### F. Tam Giác Health Checks (Probes)

```yaml
startupProbe:
  httpGet: { path: /health, port: 3000 }
  initialDelaySeconds: 5   # Chờ 5s sau khi bật container mới check
  periodSeconds: 5         # Cứ 5s hỏi 1 lần
  failureThreshold: 10     # Cho phép thất bại tối đa 10 lần (50s)

readinessProbe:
  httpGet: { path: /health, port: 3000 }
  initialDelaySeconds: 5
  periodSeconds: 10        # Cứ 10s kiểm tra xem sẵn sàng nhận traffic chưa

livenessProbe:
  httpGet: { path: /health, port: 3000 }
  initialDelaySeconds: 10
  periodSeconds: 15        # Cứ 15s kiểm tra app có bị đơ/deadlock không
```

---

## 🔌 3. CỦ PHÁP KUBERNETES SERVICE (`k8s/05-backend-deployment.yaml` - Phần Service)

```yaml
apiVersion: v1
kind: Service
metadata:
  name: backend-service     # Tên Service đại diện
  namespace: hrm-system
spec:
  type: ClusterIP           # Chỉ tạo IP nội bộ trong K8s Cluster
  ports:
    - port: 3000            # Cổng các Pod khác gọi tới (http://backend-service:3000)
      targetPort: 3000      # Cổng thực tế bên trong Pod (containerPort)
  selector:
    app: backend            # MA THUẬT: Tự động chia traffic cho các Pods có nhãn app=backend
```

---

## 🌐 4. CÚ PHÁP INGRESS ROUTING (`k8s/07-ingress.yaml`)

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: hrm-ingress
  annotations:
    kubernetes.io/ingress.class: "nginx"
    nginx.ingress.kubernetes.io/proxy-body-size: "50m" # Cho phép upload file 50MB
spec:
  rules:
    - host: hrm.local                                  # Tên miền đón nhận Traffic
      http:
        paths:
          - path: /api                                 # Nếu URL bắt đầu bằng /api
            pathType: Prefix                           # Khớp tiền tố (/api, /api/v1/users)
            backend:
              service:
                name: backend-service                  # Chuyển traffic về Backend Service
                port:
                  number: 3000
```

---

## ⚙️ 5. CÚ PHÁP K8S JOB (`k8s/04-db-migration-job.yaml`)

```yaml
apiVersion: batch/v1
kind: Job                               # Chạy nhiệm vụ 1 lần rồi tự ngắt
metadata:
  name: prisma-db-migration
spec:
  backoffLimit: 3                       # Nếu lỗi, thử lại tối đa 3 lần
  template:
    spec:
      restartPolicy: Never              # Nếu lỗi, đúc Pod mới thay vì dùng lại Pod cũ
      containers:
        - name: prisma-migrate
          image: erp-backend:latest
          command: ["npx", "prisma", "migrate", "deploy"] # Chạy lệnh migration DB
```
