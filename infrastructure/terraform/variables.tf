variable "environment" {
  type        = string
  default     = "production"
  description = "Môi trường triển khai (dev, staging, production)"
}

variable "project_name" {
  type        = string
  default     = "atlas-hrm"
  description = "Tên dự án"
}

variable "vpc_cidr" {
  type        = string
  default     = "10.0.0.0/16"
  description = "Dải IP CIDR cho VPC"
}

variable "public_subnet_cidr" {
  type        = string
  default     = "10.0.1.0/24"
  description = "Subnet cho Ingress Gateway & Public Load Balancer"
}

variable "private_app_subnet_cidr" {
  type        = string
  default     = "10.0.2.0/24"
  description = "Subnet cho Backend Apps & Worker Nodes"
}

variable "private_db_subnet_cidr" {
  type        = string
  default     = "10.0.3.0/24"
  description = "Subnet cho Database PostgreSQL & Redis (Cách ly hoàn toàn)"
}

variable "k8s_node_count" {
  type        = number
  default     = 3
  description = "Số lượng Worker Nodes cho K8s Cluster"
}
