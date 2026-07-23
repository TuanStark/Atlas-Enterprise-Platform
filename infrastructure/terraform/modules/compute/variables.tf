variable "environment" { type = string }
variable "project_name" { type = string }
variable "worker_count" { type = number }
variable "public_subnet_id" { type = string }
variable "private_app_subnet_id" { type = string }
variable "worker_sg_id" { type = string }
variable "control_plane_sg_id" { type = string }
