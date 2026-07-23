output "vpc_id" {
  value       = "${var.project_name}-${var.environment}-vpc-id-001"
  description = "VPC ID vừa được tạo"
}

output "public_subnet_id" {
  value       = "${var.project_name}-${var.environment}-public-subnet-001"
  description = "Public Subnet ID"
}

output "private_app_subnet_id" {
  value       = "${var.project_name}-${var.environment}-private-app-subnet-001"
  description = "Private App Subnet ID"
}

output "private_db_subnet_id" {
  value       = "${var.project_name}-${var.environment}-private-db-subnet-001"
  description = "Private DB Subnet ID"
}
