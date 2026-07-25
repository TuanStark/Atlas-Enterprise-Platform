{{/*
==============================================================================
ATLAS HRM HELM CHART — TEMPLATE HELPERS
Tuân thủ Kubernetes Recommended Labels (app.kubernetes.io/*)
==============================================================================
*/}}

{{/*
Chart name — truncate tới 63 chars (K8s DNS label limit)
*/}}
{{- define "atlas-hrm.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Fullname — Release name + Chart name, truncate tới 63 chars
Nếu release name đã chứa chart name thì không lặp
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
Chart label — dùng cho metadata
*/}}
{{- define "atlas-hrm.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common Labels — gán cho tất cả resources
Tuân thủ: https://kubernetes.io/docs/concepts/overview/working-with-objects/common-labels/
*/}}
{{- define "atlas-hrm.labels" -}}
helm.sh/chart: {{ include "atlas-hrm.chart" . }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/part-of: atlas-enterprise-platform
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/environment: {{ .Values.global.environment }}
{{- end }}

{{/*
Selector Labels cho một component cụ thể
Dùng: {{ include "atlas-hrm.selectorLabels" (dict "component" "backend" "root" .) }}
*/}}
{{- define "atlas-hrm.selectorLabels" -}}
app.kubernetes.io/name: {{ include "atlas-hrm.name" .root }}
app.kubernetes.io/instance: {{ .root.Release.Name }}
app.kubernetes.io/component: {{ .component }}
{{- end }}

{{/*
Component Labels — kết hợp common + selector cho 1 component
Dùng: {{ include "atlas-hrm.componentLabels" (dict "component" "backend" "root" .) }}
*/}}
{{- define "atlas-hrm.componentLabels" -}}
{{ include "atlas-hrm.labels" .root }}
{{ include "atlas-hrm.selectorLabels" (dict "component" .component "root" .root) }}
{{- end }}

{{/*
Namespace — lấy từ values hoặc fallback Release.Namespace
*/}}
{{- define "atlas-hrm.namespace" -}}
{{- default .Release.Namespace .Values.global.namespace }}
{{- end }}

{{/*
Image full path — ghép registry/repository:tag
Dùng: {{ include "atlas-hrm.image" .Values.backend.image }}
*/}}
{{- define "atlas-hrm.image" -}}
{{- if .registry }}
{{- printf "%s/%s:%s" .registry .repository .tag }}
{{- else }}
{{- printf "%s:%s" .repository .tag }}
{{- end }}
{{- end }}

{{/*
ServiceAccount name
*/}}
{{- define "atlas-hrm.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "atlas-hrm.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}
