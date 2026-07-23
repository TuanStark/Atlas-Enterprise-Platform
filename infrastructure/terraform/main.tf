# ==============================================================================
# ROOT TERRAFORM MODULE: ATLAS ENTERPRISE PLATFORM
# ==============================================================================
terraform {
  required_version = ">= 1.5.0"
  required_providers {
    local = {
      source  = "hashicorp/local"
      version = "~> 2.4"
    }
  }
}

# 1. Khai báo Module Mạng (Network & VPC)
module "network" {
  source                   = "./modules/network"
  project_name             = var.project_name
  environment              = var.environment
  vpc_cidr                 = var.vpc_cidr
  public_subnet_cidr       = var.public_subnet_cidr
  private_app_subnet_cidr  = var.private_app_subnet_cidr
  private_db_subnet_cidr   = var.private_db_subnet_cidr
}

# 2. Khai báo Module Bảo mật Firewall (Security Groups)
module "security" {
  source       = "./modules/security"
  project_name = var.project_name
  environment  = var.environment
  vpc_id       = module.network.vpc_id
}

# 3. Khai báo Module Compute Nodes (K8s Master & Workers)
module "compute" {
  source               = "./modules/compute"
  project_name         = var.project_name
  environment          = var.environment
  worker_count         = var.k8s_node_count
  public_subnet_id     = module.network.public_subnet_id
  private_app_subnet_id = module.network.private_app_subnet_id
  control_plane_sg_id  = module.security.control_plane_sg_id
  worker_sg_id         = module.security.worker_node_sg_id
}
