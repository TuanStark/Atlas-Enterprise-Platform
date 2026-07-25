# ☸️ Kubernetes Raw Manifests — Atlas HRM Platform

> ⚠️ **DEPRECATED — CHỈ DÙNG LÀM TÀI LIỆU THAM KHẢO**
>
> Thư mục này chứa các raw YAML manifests gốc, được giữ lại **CHỈ cho mục đích học tập và tham khảo**.
>
> **Toàn bộ deployment production hiện tại sử dụng Helm + ArgoCD GitOps.**
> Xem: [`charts/atlas-hrm/`](../charts/atlas-hrm/) và [`gitops/`](../gitops/)

---

## 📋 MỤC LỤC MANIFESTS (Reference Only)

| STT | Manifest File | Mô tả chức năng |
| :---: | :--- | :--- |
| 1 | `00-namespace.yaml` | Tạo Namespace cách ly `hrm-system` |
| 2 | `01-configmap.yaml` | Cấu hình biến môi trường tĩnh (Host, Port, DB Name) |
| 3 | `01-secret.yaml` | Lưu trữ bí mật mã hóa (Postgres Password, JWT Secret) |
| 4 | `02-storage.yaml` | Đăng ký PVCs cho PostgreSQL (10GB), Redis (2GB) & Uploads (5GB) |
| 5 | `03-postgres-redis.yaml` | Deploy PostgreSQL 17 & Redis 8 kèm theo ClusterIP Services |
| 6 | `04-db-migration-job.yaml` | K8s Job tự động chạy `npx prisma migrate deploy` |
| 7 | `05-backend-deployment.yaml` | Deploy NestJS Backend (2 Replicas, Non-root 1001, Probes, Service) |
| 8 | `06-frontend-deployment.yaml` | Deploy React Vite Frontend (2 Replicas, Nginx Non-root 8080) |
| 9 | `07-ingress.yaml` | Nginx Ingress Rules routing domain `hrm.local` (`/` & `/api`) |
| 10 | `08-hpa.yaml` | Horizontal Pod Autoscaler tự động scale Pods theo CPU 70% |

---

## 🔀 MIGRATION GUIDE: Raw YAML → Helm + ArgoCD

### Phương pháp deploy chuẩn enterprise hiện tại:

```bash
# 1. Dev Environment (local)
helm upgrade --install atlas-hrm charts/atlas-hrm/ \
  -f charts/atlas-hrm/values-dev.yaml \
  --namespace hrm-dev --create-namespace

# 2. Staging Environment
helm upgrade --install atlas-hrm charts/atlas-hrm/ \
  -f charts/atlas-hrm/values-staging.yaml \
  --namespace hrm-staging --create-namespace

# 3. Production Environment (qua ArgoCD — KHÔNG deploy thủ công)
# ArgoCD auto-sync từ gitops/argocd-apps/production.yaml
kubectl apply -f gitops/app-of-apps.yaml
```

### Tại sao chuyển sang Helm + ArgoCD?

| Raw YAML | Helm + ArgoCD |
|:---|:---|
| Hardcode giá trị, khó thay đổi theo env | Template + values-{env}.yaml linh hoạt |
| Secret plaintext commit vào Git | SealedSecrets encrypted, an toàn |
| Deploy thủ công `kubectl apply` | GitOps auto-sync khi push code |
| Không rollback dễ dàng | `helm rollback` hoặc ArgoCD history |
| Không có CI/CD | GitHub Actions tự động build, test, deploy |

---

## 🔍 KIỂM TRA TRẠNG THÁI HỆ THỐNG

```bash
# Kiểm tra toàn bộ Pods, Services & PVCs trong Namespace hrm-system
kubectl get all,pvc,ingress -n hrm-system

# Xem log thực thi của Backend
kubectl logs -n hrm-system -l app.kubernetes.io/component=backend -f

# Xem trạng thái HPA Auto-scaling
kubectl get hpa -n hrm-system
```
