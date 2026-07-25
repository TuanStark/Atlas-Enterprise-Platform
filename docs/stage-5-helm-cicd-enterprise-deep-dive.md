# 📖 Stage 5: Helm + ArgoCD GitOps + CI/CD Enterprise Deep Dive

> **Tài liệu Masterclass giải thích CHI TIẾT TỪNG DÒNG CODE** trong hệ thống Deploy K8s & CI/CD chuẩn Enterprise của Atlas HRM Platform.

---

## 📋 MỤC LỤC

- [Phần 1: Tại Sao Phải Restructure?](#-phần-1-tại-sao-phải-restructure)
- [Phần 2: Helm Chart Deep Dive — `_helpers.tpl`](#-phần-2-helm-chart-deep-dive--_helperstpl)
- [Phần 3: Cơ Chế Labels — Tại Sao Quan Trọng?](#-phần-3-cơ-chế-labels--tại-sao-quan-trọng)
- [Phần 4: ConfigMap & SealedSecret — Tách Biệt Và Bảo Mật](#-phần-4-configmap--sealedsecret--tách-biệt-và-bảo-mật)
- [Phần 5: Backend Deployment — Giải Mã Từng Dòng](#-phần-5-backend-deployment--giải-mã-từng-dòng)
- [Phần 6: NetworkPolicy — Zero-Trust Micro-Segmentation](#-phần-6-networkpolicy--zero-trust-micro-segmentation)
- [Phần 7: HPA v2 — Scale Behavior Thông Minh](#-phần-7-hpa-v2--scale-behavior-thông-minh)
- [Phần 8: PodDisruptionBudget — Vì Sao Cần?](#-phần-8-poddisruptionbudget--vì-sao-cần)
- [Phần 9: Values Strategy — Base + Override Pattern](#-phần-9-values-strategy--base--override-pattern)
- [Phần 10: ArgoCD GitOps — App-of-Apps Pattern](#-phần-10-argocd-gitops--app-of-apps-pattern)
- [Phần 11: CI/CD Pipeline — Giải Mã Từng Job](#-phần-11-cicd-pipeline--giải-mã-từng-job)
- [Phần 12: Luồng Deploy End-to-End](#-phần-12-luồng-deploy-end-to-end)

---

## 🔍 PHẦN 1: TẠI SAO PHẢI RESTRUCTURE?

### Vấn đề của Raw YAML (`k8s/` cũ)

```yaml
# Ví dụ file k8s/01-secret.yaml CŨ — plaintext password commit vào Git
apiVersion: v1
kind: Secret
metadata:
  name: hrm-secret
stringData:
  POSTGRES_PASSWORD: "postgres_password_secure_123"  # ← NGUY HIỂM!
  JWT_SECRET: "super_secret_jwt_key_atlas_hrm_2026"  # ← NGUY HIỂM!
```

**Vấn đề 1: Secret Plaintext** — Bất kỳ ai clone repo đều thấy password. Trong enterprise, đây là vi phạm nghiêm trọng nhất (CIS Benchmark, SOC2, ISO 27001 đều cấm).

**Vấn đề 2: Không thể tái sử dụng** — Muốn deploy lên môi trường Staging phải copy toàn bộ 10 file YAML, sửa tay từng giá trị. Đây chính là lý do Helm ra đời.

**Vấn đề 3: Drift Detection** — Nếu ai đó SSH vào cluster và `kubectl edit` sửa tay, không ai biết. Đây là lý do ArgoCD ra đời (selfHeal = tự phát hiện và revert).

**Vấn đề 4: Không có CI/CD** — Mỗi lần deploy phải SSH, pull code, build Docker, push, kubectl apply. Tốn 30-60 phút mỗi lần. Với CI/CD, toàn bộ quá trình này mất 5-8 phút, tự động hoàn toàn.

### Giải pháp Enterprise

```
Raw YAML (Hardcode)     → Helm Chart (Template + Values)
Manual kubectl apply     → ArgoCD GitOps (Auto-sync)
Manual Docker build/push → GitHub Actions CI (Automated)
Plaintext Secrets        → SealedSecrets (Encrypted)
Không có Network Policy  → Zero-Trust Micro-Segmentation
```

---

## 🧩 PHẦN 2: HELM CHART DEEP DIVE — `_helpers.tpl`

File `_helpers.tpl` là **"bộ não"** của Helm chart — chứa tất cả hàm helper mà các template khác gọi lại. Tại sao cần file này?

### 2.1 Vấn đề: Lặp lại tên resource

Nếu không có helpers, mỗi template phải hardcode tên:

```yaml
# ❌ KHÔNG CÓ helpers — hardcode ở mọi nơi
metadata:
  name: atlas-hrm-backend           # Phải gõ lại ở mọi file
  namespace: hrm-system              # Phải gõ lại ở mọi file
  labels:
    app.kubernetes.io/name: atlas-hrm    # Copy-paste 20 lần
    app.kubernetes.io/version: "1.0.0"   # Quên update 1 chỗ → inconsistent
```

### 2.2 Giải pháp: Helper functions

```go
{{/*
  FUNCTION: atlas-hrm.name
  Mục đích: Trả về tên chart, giới hạn 63 ký tự (quy định của Kubernetes DNS Label)
  
  Tại sao 63 chars?
  → Kubernetes dùng DNS để pods nói chuyện với nhau. DNS Label theo RFC 1123
    chỉ cho phép tối đa 63 ký tự. Nếu tên dài hơn → K8s reject.
  
  Cú pháp:
  - default .Chart.Name .Values.nameOverride
    → Nếu user set nameOverride trong values.yaml, dùng giá trị đó.
    → Nếu không, dùng Chart.Name (= "atlas-hrm" từ Chart.yaml)
  - trunc 63 → cắt bỏ nếu quá 63 chars
  - trimSuffix "-" → xóa dấu "-" cuối nếu trunc cắt ngang
*/}}
{{- define "atlas-hrm.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}
```

```go
{{/*
  FUNCTION: atlas-hrm.fullname
  Mục đích: Tạo tên đầy đủ cho resources. Tên này sẽ được dùng làm prefix
  cho TẤT CẢ resources (Deployment, Service, ConfigMap, Secret...)
  
  Ví dụ: Nếu helm install my-release charts/atlas-hrm/
  → Release.Name = "my-release"
  → Chart.Name = "atlas-hrm"
  → fullname = "my-release-atlas-hrm"
  
  Nhưng nếu release name = "atlas-hrm" (trùng chart name):
  → fullname = "atlas-hrm" (KHÔNG lặp thành "atlas-hrm-atlas-hrm")
  
  Logic chi tiết:
  1. Nếu user set fullnameOverride → dùng luôn giá trị đó
  2. Nếu không → ghép Release.Name + Chart.Name
  3. Nếu Release.Name đã chứa Chart.Name → chỉ dùng Release.Name
*/}}
{{- define "atlas-hrm.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}
```

```go
{{/*
  FUNCTION: atlas-hrm.image
  Mục đích: Ghép đường dẫn image đầy đủ từ 3 thành phần: registry/repository:tag
  
  Ví dụ:
  - Có registry: ghcr.io/tuanstark/atlas-erp-backend:v1.0.0
  - Không registry: erp-backend:dev-latest (cho dev local, image build tại chỗ)
  
  Tại sao tách riêng registry?
  → Dev local dùng image build tại chỗ (không cần registry)
  → Staging/Prod dùng ghcr.io hoặc ECR (cần registry URL)
*/}}
{{- define "atlas-hrm.image" -}}
{{- if .registry }}
{{- printf "%s/%s:%s" .registry .repository .tag }}
{{- else }}
{{- printf "%s:%s" .repository .tag }}
{{- end }}
{{- end }}
```

### 2.3 Cách gọi helper từ template khác

```yaml
# Trong backend-deployment.yaml:
metadata:
  name: {{ include "atlas-hrm.fullname" . }}-backend
  #     ↑ gọi hàm fullname                   ↑ thêm suffix "-backend"
  # Kết quả: "atlas-hrm-backend" (nếu release name = "atlas-hrm")
```

**Dấu chấm `.`** (dot) là context object chứa tất cả data của Helm:
- `.Chart` → thông tin Chart.yaml (Name, Version, AppVersion)
- `.Release` → thông tin lúc install (Release.Name, Release.Namespace)
- `.Values` → toàn bộ values.yaml (merge với values-dev/staging/prod)

---

## 🏷️ PHẦN 3: CƠ CHẾ LABELS — TẠI SAO QUAN TRỌNG?

### 3.1 Labels là gì?

Labels là cặp key-value gắn vào K8s resources để **phân loại, tìm kiếm, và liên kết** resources.

```yaml
# Ví dụ thực tế: Khi HPA muốn scale backend
# HPA cần TÌM đúng Deployment backend, không lẫn với frontend hay postgres.
# → HPA dùng selector labels để "trỏ" tới đúng Deployment.
```

### 3.2 Hai loại labels trong chart

**Common Labels** — gán cho TẤT CẢ resources, mục đích quản lý & truy vấn:

```yaml
# Mọi resource đều có labels này:
helm.sh/chart: atlas-hrm-1.1.0              # Chart nào tạo ra resource này?
app.kubernetes.io/managed-by: Helm           # Ai quản lý? (Helm, không phải kubectl)
app.kubernetes.io/part-of: atlas-enterprise  # Thuộc hệ thống nào?
app.kubernetes.io/version: "1.0.0"           # Version ứng dụng?
app.kubernetes.io/environment: production    # Môi trường nào?
```

Lợi ích: Có thể query tất cả resources của 1 chart:
```bash
kubectl get all -l helm.sh/chart=atlas-hrm-1.1.0 -n hrm-system
```

**Selector Labels** — dùng để **liên kết** Service → Deployment → Pod:

```yaml
# Chỉ dùng cho 1 component cụ thể:
app.kubernetes.io/name: atlas-hrm       # Tên ứng dụng
app.kubernetes.io/instance: my-release  # Instance cụ thể (nếu cài nhiều lần)
app.kubernetes.io/component: backend    # Component nào? (backend/frontend/postgres)
```

### 3.3 Tại sao tách riêng Common vs Selector?

```
Selector Labels KHÔNG ĐƯỢC thay đổi sau khi Deployment đã tạo!
(K8s cấm thay đổi spec.selector.matchLabels — sẽ bị reject)

Nhưng Common Labels CÓ THỂ thay đổi (ví dụ version, environment).

→ Tách riêng để Selector Labels ổn định, Common Labels linh hoạt.
```

### 3.4 Cách chúng liên kết

```
┌──────────────────────────┐
│    Service (backend)     │
│    selector:             │
│      component: backend  │──── tìm Pods có label component=backend
│      name: atlas-hrm     │
└──────────────────────────┘
           │ match
           ▼
┌──────────────────────────┐
│    Deployment (backend)  │
│    spec.selector:        │
│      component: backend  │──── quản lý Pods có label component=backend
│      name: atlas-hrm     │
│    template.labels:      │
│      component: backend  │──── gán label cho Pods được tạo
│      name: atlas-hrm     │
└──────────────────────────┘
           │ creates
           ▼
┌──────────────────────────┐
│    Pod (backend-abc123)  │
│    labels:               │
│      component: backend  │ ← Service tìm thấy Pod này
│      name: atlas-hrm     │
└──────────────────────────┘
```

---

## 🔐 PHẦN 4: CONFIGMAP & SEALEDSECRET — TÁCH BIỆT VÀ BẢO MẬT

### 4.1 Tại sao tách ConfigMap và Secret?

Trước đây file `configmap-secret.yaml` cũ chứa CẢ HAI trong 1 file. Đây là anti-pattern vì:

1. **Nguyên tắc Least Privilege**: ConfigMap ai cũng đọc được, Secret cần quyền riêng
2. **Lifecycle khác nhau**: Config thay đổi thường xuyên (PORT, HOST), Secret hiếm khi đổi
3. **Audit**: RBAC có thể cấm đọc Secret nhưng cho phép đọc ConfigMap

### 4.2 SealedSecret hoạt động thế nào?

```
┌────────────────────────────────────────────────────────────────┐
│                    SealedSecrets Workflow                       │
│                                                                │
│   Developer                SealedSecret              K8s       │
│   ┌────────┐              Controller              Cluster      │
│   │        │                                                   │
│   │ 1. Tạo │   kubectl create secret --dry-run                 │
│   │ Secret │──────────────────────────────────────┐             │
│   │ thường │                                      │             │
│   │        │   2. kubeseal encrypt                 │             │
│   │        │──────────────┐                       │             │
│   │        │              │                       │             │
│   │        │    ┌─────────▼──────────┐            │             │
│   │        │    │  SealedSecret YAML │  3. Commit │             │
│   │        │    │  (encrypted data)  │───to Git───│             │
│   │        │    │  AgBy8hF2jK9x...   │            │             │
│   │        │    └─────────┬──────────┘            │             │
│   └────────┘              │                       │             │
│                           │  4. ArgoCD sync       │             │
│                           │  to K8s cluster       │             │
│                           ▼                       │             │
│                 ┌─────────────────────┐           │             │
│                 │ SealedSecret        │  5. Controller          │
│                 │ Controller decrypt  │──decrypt──▶ K8s Secret  │
│                 │ (chỉ chạy trên K8s) │           │  (plaintext)│
│                 └─────────────────────┘           │             │
│                                                                │
│   ✅ Git chỉ chứa encrypted data → an toàn                     │
│   ✅ Chỉ controller trên cluster mới decrypt được               │
│   ✅ Mất repo → hacker không đọc được secret                   │
└────────────────────────────────────────────────────────────────┘
```

### 4.3 Code giải thích

```yaml
# Trong sealed-secret.yaml:
{{- if .Values.secrets.useSealedSecrets }}
# ── Staging/Production: Dùng SealedSecret ──
apiVersion: bitnami.com/v1alpha1    # ← API của SealedSecret CRD
kind: SealedSecret
spec:
  encryptedData:
    {{- toYaml .Values.secrets.sealedData | nindent 4 }}
    # ↑ Data đã được mã hóa bằng kubeseal CLI
    # Ví dụ: POSTGRES_PASSWORD: "AgBy8hF2jK9x..."
    # SealedSecret Controller trên K8s sẽ decrypt thành K8s Secret thường

{{- else }}
# ── Development: Dùng K8s Secret thường ──
apiVersion: v1
kind: Secret
type: Opaque
stringData:                          # ← stringData tự động base64 encode
  POSTGRES_PASSWORD: {{ .Values.secrets.postgresPassword | quote }}
  # Dev OK vì không commit values-dev.yaml chứa password thật lên public repo
{{- end }}
```

**`{{- if ... }}` / `{{- else }}` / `{{- end }}`** — Đây là **conditional rendering** của Helm. Template engine Go sẽ render ra YAML khác nhau tuỳ giá trị `useSealedSecrets`:
- Dev (`values-dev.yaml`): `useSealedSecrets: false` → render K8s Secret thường
- Prod (`values-prod.yaml`): `useSealedSecrets: true` → render SealedSecret

---

## 🛡️ PHẦN 5: BACKEND DEPLOYMENT — GIẢI MÃ TỪNG DÒNG

### 5.1 Rolling Update Strategy

```yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxSurge: 1         # Tối đa thêm 1 Pod mới cùng lúc
    maxUnavailable: 0   # KHÔNG được giảm số Pod đang chạy
```

**Tại sao `maxUnavailable: 0`?** → **Zero-Downtime Deployment**

```
Giả sử hiện tại có 2 Pods (v1.0). Deploy v1.1:

Bước 1: Tạo thêm 1 Pod v1.1 (maxSurge=1)
  [v1.0] [v1.0] [v1.1 - starting]  ← 3 pods tạm thời

Bước 2: v1.1 pass readinessProbe → K8s thêm vào Service
  [v1.0] [v1.0] [v1.1 ✅]         ← v1.1 bắt đầu nhận traffic

Bước 3: Xoá 1 Pod v1.0
  [v1.0] [v1.1 ✅]                 ← vẫn có 2 pods serving

Bước 4: Tạo thêm 1 Pod v1.1
  [v1.0] [v1.1 ✅] [v1.1 - starting]

Bước 5: v1.1 mới pass probe, xoá v1.0 cuối
  [v1.1 ✅] [v1.1 ✅]              ← Hoàn thành, 0 downtime!
```

### 5.2 Config Checksum Annotations

```yaml
annotations:
  checksum/config: {{ include (print $.Template.BasePath "/configmap.yaml") . | sha256sum }}
  checksum/secret: {{ include (print $.Template.BasePath "/sealed-secret.yaml") . | sha256sum }}
```

**Vấn đề**: Khi bạn chỉ thay đổi ConfigMap (ví dụ đổi `NODE_ENV`), Deployment YAML không thay đổi → K8s KHÔNG restart Pods → Pods vẫn dùng config CŨ!

**Giải pháp**: Tính SHA256 hash của ConfigMap content và gán vào annotation. Khi ConfigMap thay đổi → hash thay đổi → annotation thay đổi → K8s detect Pod template changed → trigger rolling restart.

### 5.3 Security Context — Chi tiết từng dòng

```yaml
# Pod-level Security Context
securityContext:
  runAsNonRoot: true    # BẮT BUỘC: Container không được chạy bằng root (UID 0)
  runAsUser: 1001       # Chạy bằng user "nestjs" (UID 1001, tạo trong Dockerfile)
  runAsGroup: 1001      # Group "nodejs" (GID 1001)
  fsGroup: 1001         # Tất cả volume mounts sẽ có group 1001 (để nestjs đọc/ghi được)
  seccompProfile:
    type: RuntimeDefault  # Bật Seccomp filter — chặn ~300 syscalls nguy hiểm
                          # (ví dụ: mount, reboot, kexec_load...)
```

```yaml
# Container-level Security Context
securityContext:
  allowPrivilegeEscalation: false  # Cấm container tự nâng quyền (setuid, sudo)
  readOnlyRootFilesystem: false    # false vì NestJS cần ghi vào /tmp và /app/uploads
  capabilities:
    drop:
      - ALL     # Xoá TẤT CẢ Linux capabilities (NET_RAW, SYS_ADMIN, etc.)
                # → Container chỉ có quyền tối thiểu nhất có thể
```

**Tại sao quan trọng?** Nếu hacker exploit được ứng dụng NestJS, họ sẽ:
- Không thể `sudo` hoặc chạy lệnh root
- Không thể mount ổ đĩa, reboot node, hoặc load kernel module
- Bị giới hạn trong sandbox container

### 5.4 Tam Giác Health Check Probes

```
┌─────────────────────────────────────────────────────────────────┐
│                  3 LOẠI HEALTH CHECK PROBE                      │
│                                                                 │
│  startupProbe ──▶ readinessProbe ──▶ livenessProbe             │
│  (Chỉ chạy lúc   (Liên tục kiểm    (Liên tục kiểm            │
│   khởi động)      tra "sẵn sàng     tra "còn sống             │
│                    nhận traffic?")   không?")                   │
│                                                                 │
│  ┌───────────┐   ┌───────────┐    ┌───────────┐               │
│  │ startup   │   │ readiness │    │ liveness  │               │
│  │           │   │           │    │           │               │
│  │ Fail:     │   │ Fail:     │    │ Fail:     │               │
│  │ Retry     │   │ Remove    │    │ Kill      │               │
│  │ (lặp tới  │   │ from      │    │ and       │               │
│  │ 12 lần)   │   │ Service   │    │ restart   │               │
│  │           │   │ (ngưng    │    │ container │               │
│  │ Final     │   │  traffic) │    │           │               │
│  │ Fail:     │   │           │    │           │               │
│  │ Kill Pod  │   │ Pass:     │    │           │               │
│  └───────────┘   │ Add back  │    │           │               │
│                  │ to Service│    │           │               │
│                  └───────────┘    └───────────┘               │
└─────────────────────────────────────────────────────────────────┘
```

```yaml
startupProbe:
  httpGet:
    path: /health
    port: http
  initialDelaySeconds: 5     # Chờ 5s sau khi container start
  periodSeconds: 5           # Kiểm tra mỗi 5s
  failureThreshold: 12       # Cho phép fail 12 lần (12 × 5s = 60s timeout tối đa)
  # → NestJS có thể mất tới 60s để khởi động (connect DB, generate Prisma...)
  # Nếu quá 60s vẫn chưa ready → K8s kill Pod
```

```yaml
readinessProbe:
  # Chỉ bắt đầu SAU KHI startupProbe pass
  periodSeconds: 10          # Kiểm tra mỗi 10s
  failureThreshold: 3        # Fail 3 lần → loại khỏi Service (ngưng nhận traffic)
  # NHƯNG KHÔNG KILL Pod! → Pod vẫn sống, chỉ "nghỉ ngơi"
  # Khi recover → tự động thêm lại vào Service
```

```yaml
livenessProbe:
  periodSeconds: 15          # Kiểm tra mỗi 15s
  failureThreshold: 3        # Fail 3 lần → KILL Pod → K8s tạo Pod mới
  # Dùng cho trường hợp app bị "treo" (deadlock, memory leak vô hạn)
```

### 5.5 Volume Mounts

```yaml
volumeMounts:
  - name: uploads-storage
    mountPath: /app/uploads    # PVC — persistent data (file upload của user)
  - name: tmp
    mountPath: /tmp            # emptyDir — ephemeral (bị xóa khi Pod restart)

volumes:
  - name: uploads-storage
    persistentVolumeClaim:
      claimName: {{ include "atlas-hrm.fullname" . }}-uploads-pvc
      # ↑ PVC giữ data ngay cả khi Pod bị xóa/restart
  - name: tmp
    emptyDir: {}
    # ↑ emptyDir: K8s tạo thư mục tạm trên node
    # Tại sao cần? → NestJS (và nhiều lib) ghi file tạm vào /tmp
    # Nếu dùng readOnlyRootFilesystem: true → phải mount /tmp riêng
```

---

## 🔒 PHẦN 6: NETWORKPOLICY — ZERO-TRUST MICRO-SEGMENTATION

### 6.1 Mô hình Zero-Trust

```
🔴 MẶC ĐỊNH: CHẶN TẤT CẢ TRAFFIC
   ↓
🟢 Chỉ mở ĐÚNG traffic cần thiết
```

### 6.2 Giải thích từng policy

```yaml
# POLICY 1: Default Deny All — CHẶN TẤT CẢ INGRESS
spec:
  podSelector: {}       # {} = áp dụng cho TẤT CẢ pods trong namespace
  policyTypes:
    - Ingress           # Chặn tất cả traffic ĐẾN (incoming)
                        # Không có "ingress:" rule → DENY ALL
```

Tại sao cần? Mặc định K8s cho phép TẤT CẢ pods nói chuyện với nhau. Nghĩa là nếu hacker chiếm được frontend Pod, họ có thể trực tiếp kết nối PostgreSQL mà không qua backend!

```yaml
# POLICY 2: Backend — chỉ nhận traffic từ 2 nguồn:
ingress:
  # Nguồn 1: Ingress Controller (traffic từ Internet → Ingress → Backend)
  - from:
      - namespaceSelector:
          matchLabels:
            kubernetes.io/metadata.name: ingress-nginx
            # ↑ Chỉ cho phép traffic từ namespace "ingress-nginx"
            # (nơi Nginx Ingress Controller chạy)
    ports:
      - port: 3000       # Chỉ port 3000 (NestJS)
  
  # Nguồn 2: Traffic nội bộ trong namespace (frontend gọi API backend)
  - from:
      - podSelector: {}  # Tất cả pods TRONG CÙNG namespace
    ports:
      - port: 3000
```

```yaml
# POLICY 3: PostgreSQL — CHỈ backend và migration job được kết nối
ingress:
  - from:
      - podSelector:
          matchLabels:
            app.kubernetes.io/component: backend     # Backend pods
      - podSelector:
          matchLabels:
            app.kubernetes.io/component: migration   # Migration Job pods
    ports:
      - port: 5432
    # → Frontend KHÔNG thể kết nối trực tiếp PostgreSQL
    # → Nếu hacker chiếm frontend, họ KHÔNG tới được database
```

### 6.3 Luồng traffic sau khi áp dụng

```
Internet ──▶ Ingress Controller ──▶ Backend (port 3000) ──▶ PostgreSQL (port 5432)
     │              │                     │                       ▲
     │              │                     │                       │ ✅ Allowed
     │              │                     └── Redis (port 6379)   │
     │              │                              ▲              │
     │              │                              │ ✅            │
     │              │                              │              │
     │              └──▶ Frontend (port 8080)      │              │
     │                          │                  │              │
     │                          ├──── ❌ → Redis   │              │
     │                          └──── ❌ → PostgreSQL ────────────┘
     │                                    (BLOCKED!)
     │
     └──── ❌ Direct to Backend (BLOCKED — phải qua Ingress)
```

---

## 📈 PHẦN 7: HPA v2 — SCALE BEHAVIOR THÔNG MINH

### 7.1 Tại sao cần Scale Behavior?

HPA cũ (v1) có vấn đề **"Flapping"** (giật tung):

```
Traffic tăng  → Scale 2 → 10 pods (quá nhanh)
Traffic giảm  → Scale 10 → 2 pods (quá nhanh, request bị drop)
Traffic tăng  → Scale 2 → 10 pods (lặp lại...)
→ Pods liên tục bị tạo/xóa, gây downtime
```

### 7.2 Giải pháp: Scale Behavior

```yaml
behavior:
  scaleDown:
    stabilizationWindowSeconds: 300   # Chờ 5 phút ổn định trước khi scale DOWN
    policies:
      - type: Percent
        value: 25                     # Mỗi lần giảm TỐI ĐA 25% pods
        periodSeconds: 60             # Mỗi 60 giây mới được giảm 1 lần
    # → Từ 10 pods → 8 → 6 → 5 → 4 (mất ~4 phút thay vì 0 giây)
    
  scaleUp:
    stabilizationWindowSeconds: 30    # Chỉ chờ 30 giây trước khi scale UP
    policies:
      - type: Percent
        value: 50                     # Tăng tới 50% pods mỗi lần
        periodSeconds: 60
      - type: Pods
        value: 2                      # Hoặc tăng ít nhất 2 pods
        periodSeconds: 60
    selectPolicy: Max                 # Chọn policy nào cho NHIỀU pods hơn
    # → Scale UP nhanh (handle traffic spike), scale DOWN chậm (tránh flapping)
```

---

## 🛑 PHẦN 8: PODDISRUPTIONBUDGET — VÌ SAO CẦN?

### 8.1 Tình huống thực tế

Bạn cần upgrade K8s nodes (drain node để patch security):

```bash
kubectl drain node-1 --ignore-daemonsets --delete-emptydir-data
```

**Không có PDB**: K8s có thể xóa TẤT CẢ backend pods trên node-1 cùng lúc → **DOWNTIME!**

**Có PDB**: K8s kiểm tra PDB trước khi xóa pods. Nếu xóa pod này sẽ vi phạm `minAvailable: 1` → K8s **CHỜ** cho tới khi pod mới được tạo trên node khác, sau đó mới xóa.

```yaml
spec:
  minAvailable: 1    # Luôn phải có ÍT NHẤT 1 pod backend chạy
  # → Khi drain node, K8s đảm bảo 1 pod vẫn serve traffic
  # Production: minAvailable: 2 (luôn có ít nhất 2 pods)
```

---

## 🔧 PHẦN 9: VALUES STRATEGY — BASE + OVERRIDE PATTERN

### 9.1 Cách Helm merge values

```
values.yaml (base)          ← Giá trị mặc định cho tất cả
    ↓ merge/override
values-dev.yaml             ← Chỉ ghi đè những gì KHÁC dev
    hoặc
values-staging.yaml         ← Chỉ ghi đè những gì KHÁC staging
    hoặc
values-prod.yaml            ← Chỉ ghi đè những gì KHÁC prod
```

### 9.2 Ví dụ cụ thể

```yaml
# values.yaml (BASE)              # values-dev.yaml (OVERRIDE)
backend:                           backend:
  replicaCount: 2                    replicaCount: 1        # Dev chỉ cần 1
  image:                             image:
    registry: ghcr.io                  registry: ""          # Dev dùng local
    repository: tuanstark/...          repository: erp-backend
    tag: latest                        tag: dev-latest
  resources:                         resources:
    requests:                          requests:
      cpu: 250m                          cpu: 100m           # Dev cần ít hơn
      memory: 256Mi                      memory: 128Mi
```

Khi chạy `helm install -f values-dev.yaml`:
```yaml
# KẾT QUẢ SAU KHI MERGE:
backend:
  replicaCount: 1           # ← từ values-dev (override)
  image:
    registry: ""             # ← từ values-dev (override)
    repository: erp-backend  # ← từ values-dev (override)
    tag: dev-latest          # ← từ values-dev (override)
    pullPolicy: IfNotPresent # ← từ values.yaml (base, không bị override)
  resources:
    requests:
      cpu: 100m              # ← từ values-dev (override)
      memory: 128Mi          # ← từ values-dev (override)
    limits:
      cpu: 500m              # ← từ values.yaml (base)
      memory: 512Mi          # ← từ values.yaml (base)
```

### 9.3 So sánh 3 environments

| Tham số | Dev | Staging | Production |
|:---|:---|:---|:---|
| Replicas Backend | 1 | 2 | 3 |
| Image Registry | (local) | ghcr.io | ghcr.io |
| Image Tag | dev-latest | staging-latest | v1.0.0 (semver) |
| HPA | ❌ Tắt | ✅ max 5 | ✅ max 15 |
| NetworkPolicy | ❌ Tắt | ✅ Bật | ✅ Bật |
| PDB | ❌ Tắt | ✅ min 1 | ✅ min 2 |
| Secrets | Plaintext | SealedSecret | SealedSecret |
| TLS | ❌ Tắt | ✅ staging issuer | ✅ prod issuer |
| Storage (PG) | 2Gi | 5Gi | 50Gi |

---

## 🔄 PHẦN 10: ARGOCD GITOPS — APP-OF-APPS PATTERN

### 10.1 ArgoCD là gì?

ArgoCD là **GitOps Controller** — nó liên tục so sánh trạng thái trên Git với trạng thái trên K8s cluster:

```
Git Repo (Desired State)  ──compare──  K8s Cluster (Actual State)
        │                                       │
        │          Có khác biệt?                │
        │              │                        │
        │              ▼                        │
        │         ArgoCD Sync                   │
        │         (apply changes               │
        │          to cluster)                  │
        ▼                                       ▼
    "Nếu ai sửa tay trên K8s → ArgoCD tự revert về Git"
    → Đây gọi là "selfHeal"
```

### 10.2 App-of-Apps Pattern

```
┌──────────────────────────────────────────────────┐
│         atlas-enterprise-root                    │
│         (App-of-Apps)                            │
│                                                  │
│  Quản lý thư mục: gitops/argocd-apps/           │
│  Mọi file .yaml trong đó = 1 Application        │
│                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │ dev.yaml │ │staging   │ │ production.yaml  │ │
│  │          │ │.yaml     │ │                  │ │
│  │ auto-    │ │ auto-    │ │ manual sync      │ │
│  │ sync     │ │ sync     │ │ (cần approval)   │ │
│  │ develop  │ │ main     │ │ main branch      │ │
│  │ branch   │ │ branch   │ │                  │ │
│  └──────────┘ └──────────┘ └──────────────────┘ │
└──────────────────────────────────────────────────┘
```

**Lợi ích**: Thêm environment mới (ví dụ UAT) = chỉ cần thêm 1 file `uat.yaml` vào `argocd-apps/`. ArgoCD root app tự phát hiện và tạo Application mới.

### 10.3 AppProject — Isolation

```yaml
apiVersion: argoproj.io/v1alpha1
kind: AppProject
metadata:
  name: atlas-enterprise
spec:
  sourceRepos:
    - "https://github.com/TuanStark/Atlas-Enterprise-Platform.git"
    # ↑ CHỈ cho phép deploy từ repo này
    # → Hacker không thể tạo Application trỏ tới repo độc hại
  
  destinations:
    - namespace: hrm-dev
    - namespace: hrm-staging
    - namespace: hrm-system
    # ↑ CHỈ cho phép deploy vào 3 namespace này
    # → Không thể deploy vào kube-system hoặc namespace khác
```

### 10.4 Production: Tại sao Manual Sync?

```yaml
# production.yaml:
syncPolicy:
  # ⚠️ KHÔNG CÓ "automated:" block → Manual Sync
  # Tại sao?
  # 1. Production cần human review trước khi deploy
  # 2. CI/CD update values-prod.yaml → ArgoCD hiển thị "OutOfSync"
  # 3. DevOps vào ArgoCD UI, review diff, click "Sync"
  # 4. Nếu có vấn đề → "Rollback" 1 click về version trước

ignoreDifferences:
  - group: apps
    kind: Deployment
    jsonPointers:
      - /spec/replicas
  # ↑ Tại sao ignore replicas?
  # → HPA tự động thay đổi replicas (ví dụ từ 3 → 8 khi traffic cao)
  # → ArgoCD thấy Git ghi replicas: 3 nhưng K8s đang 8 → "OutOfSync"!
  # → ignore /spec/replicas để ArgoCD không coi đây là "khác biệt"
```

---

## 🔁 PHẦN 11: CI/CD PIPELINE — GIẢI MÃ TỪNG JOB

### 11.1 Tổng quan 3 pipelines

```
ci-backend.yml   ─── Trigger: push code backend
ci-frontend.yml  ─── Trigger: push code frontend
cd-deploy.yml    ─── Trigger: push tag v1.0.0 (production release)
```

### 11.2 CI Backend — 3 Jobs

#### Job 1: Test

```yaml
on:
  push:
    branches: [main, develop]
    paths:
      - "erp_platform_be/**"    # CHỈ trigger khi code backend thay đổi
      # → Sửa frontend không trigger CI backend (tiết kiệm tài nguyên)
```

```yaml
concurrency:
  group: ci-backend-${{ github.ref }}
  cancel-in-progress: true
  # ↑ Nếu đang chạy CI cho branch "develop" và có push mới vào "develop"
  # → Cancel pipeline CŨ, chạy pipeline MỚI
  # → Tránh tốn resource chạy 2 pipeline cùng lúc cho code cũ
```

```yaml
steps:
  - uses: actions/setup-node@v4
    with:
      cache: "npm"
      cache-dependency-path: erp_platform_be/package-lock.json
      # ↑ Cache npm dependencies giữa các lần chạy
      # Lần đầu: npm ci mất ~30s (download từ Internet)
      # Lần sau: npm ci mất ~5s (lấy từ cache)
```

#### Job 2: Build & Push Docker

```yaml
needs: test    # Chỉ chạy SAU KHI Job "test" pass
if: github.event_name == 'push'
# ↑ KHÔNG chạy trên Pull Request (PR chỉ cần test, không cần build image)
# → PR: Test only
# → Merge vào main/develop: Test → Build → Push
```

```yaml
# Docker Metadata — tự động generate tags thông minh:
tags: |
  # Push vào main → tag "latest"
  type=raw,value=latest,enable=${{ github.ref == 'refs/heads/main' }}
  
  # Push vào develop → tag "dev-latest"
  type=raw,value=dev-latest,enable=${{ github.ref == 'refs/heads/develop' }}
  
  # Mọi push → tag SHA (immutable, dùng cho GitOps)
  type=sha,prefix=,format=short
  # Ví dụ commit abc1234 → tag "sha-abc1234"
  # Tag này KHÔNG BAO GIỜ bị ghi đè (mỗi commit có tag riêng)
  
  # Push tag v1.0.0 → tag "1.0.0" và "1.0"
  type=semver,pattern={{version}}      # v1.0.0 → "1.0.0"
  type=semver,pattern={{major}}.{{minor}} # v1.0.0 → "1.0"
```

```yaml
# Docker Build với cache:
cache-from: type=gha     # Lấy Docker layer cache từ GitHub Actions Cache
cache-to: type=gha,mode=max  # Lưu TẤT CẢ layers vào cache
# → Lần build đầu: 3-5 phút
# → Lần build sau (chỉ đổi code, không đổi package.json): 30-60 giây!
# → Tiết kiệm 80% thời gian build

provenance: true   # Thêm SLSA provenance attestation (chứng nhận nguồn gốc image)
sbom: true         # Tạo Software Bill of Materials (danh sách dependencies)
# → Yêu cầu bảo mật supply chain của enterprise (SOC2, FedRAMP)
```

```yaml
# Trivy Vulnerability Scan:
- uses: aquasecurity/trivy-action@master
  with:
    severity: "CRITICAL,HIGH"   # Chỉ báo cáo lỗ hổng CRITICAL và HIGH
    exit-code: "0"              # 0 = KHÔNG fail pipeline nếu có CVE
    # Tại sao "0"?
    # → Giai đoạn đầu, nhiều CVE từ base image (node:22-alpine)
    # → Set "1" sẽ block toàn bộ CI/CD
    # → Khi team mature hơn, đổi thành "1" để enforce zero CVE
    format: "sarif"             # Output dạng SARIF (GitHub Security Tab hiểu)

- uses: github/codeql-action/upload-sarif@v3
  # ↑ Upload kết quả scan lên GitHub Security tab
  # → Xem CVE trực tiếp trong GitHub UI → Settings → Security → Code scanning
```

#### Job 3: GitOps Update

```yaml
# Đây là "cầu nối" giữa CI và ArgoCD:
- name: Update Image Tag in Helm Values
  run: |
    SHORT_SHA=$(echo "${{ github.sha }}" | cut -c1-7)
    # ↑ Lấy 7 ký tự đầu của Git commit SHA
    # Ví dụ: commit full SHA = "abc1234def5678..."
    # → SHORT_SHA = "abc1234"
    
    if [[ "${{ github.ref }}" == "refs/heads/main" ]]; then
      sed -i "s|tag: staging-latest|tag: sha-${SHORT_SHA}|g" \
        charts/atlas-hrm/values-staging.yaml
      # ↑ Thay đổi image tag trong values-staging.yaml
      # → ArgoCD phát hiện Git thay đổi → auto-sync staging
    fi
```

```yaml
- name: Commit & Push
  run: |
    git commit -m "ci(backend): update image tag to sha-abc1234 [skip ci]"
    #                                                           ↑
    # [skip ci] = Nói GitHub Actions KHÔNG trigger pipeline cho commit này
    # → Tránh vòng lặp vô hạn:
    #   Push code → CI build → CI commit values → CI trigger lại → build lại → ...
```

---

## 🌊 PHẦN 12: LUỒNG DEPLOY END-TO-END

### 12.1 Developer push code (hàng ngày)

```
Developer push code tới branch "develop"
    │
    ▼
GitHub Actions CI trigger (path filtering: erp_platform_be/**)
    │
    ├── Job 1: Lint → TypeCheck → Test (3 phút)
    │     │
    │     ▼ Pass?
    │
    ├── Job 2: Docker Build → Trivy Scan → Push ghcr.io (2 phút)
    │     │
    │     ▼ Tag: sha-abc1234
    │
    └── Job 3: Update values-dev.yaml → tag: sha-abc1234 → git push [skip ci]
          │
          ▼
    ArgoCD Dev Application detect Git changed
          │
          ▼
    ArgoCD auto-sync → helm upgrade --install -f values-dev.yaml
          │
          ▼
    K8s namespace hrm-dev updated → new pods rolling out
          │
          ▼
    ✅ Dev environment đang chạy commit abc1234 (tổng ~5-8 phút)
```

### 12.2 Merge PR vào main (staging deploy)

```
PR approved & merged to main
    │
    ▼
GitHub Actions CI trigger
    │
    ├── Test → Build → Push ghcr.io (tag: sha-def5678)
    │
    └── Update values-staging.yaml → tag: sha-def5678
          │
          ▼
    ArgoCD Staging auto-sync
          │
          ▼
    ✅ Staging environment updated (QA team kiểm tra)
```

### 12.3 Production Release (theo lịch)

```
DevOps tạo Git tag:
    git tag v1.0.0 && git push origin v1.0.0
          │
          ▼
    CD Pipeline trigger (on: push tags: v*.*.*)
          │
          ├── Build Backend image → tag: v1.0.0, 1.0, latest
          │
          ├── Build Frontend image → tag: v1.0.0, 1.0, latest
          │
          ├── Update values-prod.yaml → tag: v1.0.0
          │
          └── Create GitHub Release (changelog tự động)
                │
                ▼
    ArgoCD Production detect: "OutOfSync"
    (hiển thị trên ArgoCD UI)
                │
                ▼
    DevOps review diff trên ArgoCD UI
    Click "Sync" (hoặc CLI: argocd app sync atlas-hrm-production)
                │
                ▼
    K8s production rolling update (zero downtime)
                │
                ▼
    ✅ Production v1.0.0 live!
    
    Nếu có bug → 1 click "Rollback" về v0.9.0 trên ArgoCD UI
```

---

## 📚 TÓM TẮT CÁC KHÁI NIỆM ENTERPRISE

| Khái niệm | Giải thích 1 câu | File liên quan |
|:---|:---|:---|
| **Helm Chart** | Package manager cho K8s — template hóa YAML, override theo env | `charts/atlas-hrm/` |
| **`_helpers.tpl`** | Thư viện hàm dùng chung (naming, labels) — tránh lặp code | `templates/_helpers.tpl` |
| **SealedSecrets** | Mã hóa secrets để commit an toàn vào Git | `templates/sealed-secret.yaml` |
| **NetworkPolicy** | Firewall cho pods — zero-trust, default deny | `templates/networkpolicy.yaml` |
| **PDB** | Đảm bảo min pods chạy khi drain/upgrade node | `templates/pdb.yaml` |
| **HPA v2 Behavior** | Scale up nhanh, scale down chậm — tránh flapping | `templates/hpa.yaml` |
| **Config Checksum** | Auto-restart pods khi config/secret thay đổi | `templates/backend-deployment.yaml` |
| **Rolling Update** | Zero-downtime deploy: maxSurge=1, maxUnavailable=0 | `templates/backend-deployment.yaml` |
| **ArgoCD App-of-Apps** | 1 root app quản lý tất cả environments | `gitops/app-of-apps.yaml` |
| **AppProject** | Isolation: giới hạn repo & namespace cho ArgoCD | `gitops/argocd-apps/project.yaml` |
| **Path Filtering** | CI chỉ chạy khi code thay đổi trong đúng thư mục | `.github/workflows/ci-*.yml` |
| **Docker Layer Cache** | Tái sử dụng layers giữa các build → nhanh 80% | `.github/workflows/ci-*.yml` |
| **Trivy Scan** | Quét CVE trong Docker image | `.github/workflows/ci-*.yml` |
| **`[skip ci]`** | Ngăn commit GitOps trigger CI vòng lặp | `.github/workflows/ci-*.yml` |
| **Semver Tags** | v1.0.0 → immutable tag cho production releases | `.github/workflows/cd-deploy.yml` |
| **ignoreDifferences** | ArgoCD bỏ qua HPA-managed replicas | `gitops/argocd-apps/production.yaml` |

---

> 📝 **Ghi chú**: Tài liệu này là companion guide cho code đã implement. Mỗi phần trỏ tới file source code tương ứng để bạn đọc song song: code + giải thích.
