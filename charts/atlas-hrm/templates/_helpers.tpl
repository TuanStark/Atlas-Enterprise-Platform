{{/* ==========================================================================
# THƯ VIỆN HÀM (HELM HELPERS) — BỘ NÃO TÁI SỬ DỤNG
==============================================================================
# [BẢN CHẤT - Nguyên tắc tối thượng DRY (Don't Repeat Yourself)]
# Xin lưu ý: Đây KHÔNG PHẢI là file sinh ra YAML cho Kubernetes. Ký tự `_` (gạch dưới) ở đầu tên file báo cho Helm biết: "Hãy lờ file này đi".
# Nó là nơi chứa các "Hàm" (Function) viết bằng Go Template. Các file YAML khác (Deployment, Service) sẽ GỌI các hàm này ra xài.
# 🟩 Senior Review: Nếu một ngày đẹp trời Giám đốc yêu cầu đổi tên toàn bộ dự án từ `atlas-hrm` sang `atlas-erp`.
# Anh KHÔNG CẦN phải hì hục mở 15 file YAML ra Find & Replace (rất dễ dính lỗi syntax làm sập K8s).
# Anh chỉ cần sửa duy nhất 1 biến, Thư viện `_helpers.tpl` này sẽ tự động thay máu cho toàn bộ 15 file kia!
========================================================================== */}}

{{/*
1. Tính toán Tên đầy đủ của Chart (Fullname)
# 🚩 Lỗi Junior: Bỏ qua luật của Hệ điều hành. Kubernetes DNS cấm tên quá 63 ký tự. Nếu anh đặt tên Deployment quá dài, K8s sẽ thẳng tay Reject.
# 🟩 Senior Review: Luôn chặn hậu bằng hàm `trunc 63` (cưa ngắn đúng 63 ký tự) và `trimSuffix "-"` (gọt bỏ dấu gạch ngang vô duyên ở đuôi).
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

{{/*
2. Lấy tên Namespace Động
Ưu tiên: `--namespace` từ lệnh Terminal -> `global.namespace` trong values.yaml -> Mặc định là `default`.
*/}}
{{- define "atlas-hrm.namespace" -}}
{{- if .Release.Namespace }}
{{- if eq .Release.Namespace "default" }}
{{- .Values.global.namespace | default "default" }}
{{- else }}
{{- .Release.Namespace }}
{{- end }}
{{- else }}
{{- .Values.global.namespace | default "default" }}
{{- end }}
{{- end }}

{{/*
3. Nối chuỗi tên Docker Image
*/}}
{{- define "atlas-hrm.image" -}}
{{- printf "%s:%s" .repository (default "latest" .tag) }}
{{- end }}

{{/*
4. Chart label — dùng cho metadata K8s nhận diện version Helm
*/}}
{{- define "atlas-hrm.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
5. Common Labels — Nhãn Dán Tiêu Chuẩn Phân Loại Enterprise
# 🟩 Senior Review: Khi cụm K8s có 100 ứng dụng, nhãn dán là cách duy nhất để anh tìm kiếm. 
# Giúp Ops dễ dàng gõ lệnh `kubectl get pods -l environment=production` để gom toàn bộ Pod chạy ở Prod.
*/}}
{{- define "atlas-hrm.labels" -}}
helm.sh/chart: {{ include "atlas-hrm.chart" . }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/part-of: atlas-enterprise-platform
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/environment: {{ .Values.global.environment }}
{{- end }}

{{/*
6. Selector Labels — Sợi Dây Trói Buộc Cố Định
# 🚩 Lỗi Junior: Tánh ngứa tay, đang chạy Production vào file YAML sửa cái Selector Label. -> K8s BÁO LỖI VÀ TỪ CHỐI APPLY.
# 🟩 Senior Review: Selector Labels là định danh BẤT DI BẤT DỊCH, dùng để Service tìm đúng Pod, Deployment tìm đúng ReplicaSet. Cấm sửa đổi sau khi tạo.
*/}}
{{- define "atlas-hrm.selectorLabels" -}}
app.kubernetes.io/name: {{ include "atlas-hrm.fullname" .root }}
app.kubernetes.io/instance: {{ .root.Release.Name }}
app.kubernetes.io/component: {{ .component }}
{{- end }}

{{/*
7. Component Labels — Trộn chung 2 thằng trên làm 1
*/}}
{{- define "atlas-hrm.componentLabels" -}}
{{ include "atlas-hrm.selectorLabels" . }}
{{ include "atlas-hrm.labels" .root }}
{{- end }}

{{/*
8. Lấy tên ServiceAccount
*/}}
{{- define "atlas-hrm.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "atlas-hrm.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}
