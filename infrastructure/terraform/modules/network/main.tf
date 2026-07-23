locals {
  name_prefix = "${var.project_name}-${var.environment}"
}

resource "local_file" "vpc_manifest" {
  filename = "${path.module}/vpc_config.json"
  content  = jsonencode({
    vpc_name             = "${local.name_prefix}-vpc"
    cidr_block           = var.vpc_cidr
    enable_dns_hostnames = true
    enable_dns_support   = true
    subnets = {
      public      = var.public_subnet_cidr
      private_app = var.private_app_subnet_cidr
      private_db  = var.private_db_subnet_cidr
    }
  })
}
