output "infrastructure_summary" {
  value = {
    project            = var.project_name
    environment        = var.environment
    vpc_id             = module.network.vpc_id
    public_subnet      = module.network.public_subnet_id
    private_app_subnet = module.network.private_app_subnet_id
    private_db_subnet  = module.network.private_db_subnet_id
    k8s_master_ip      = module.compute.master_ip
    k8s_worker_ips     = module.compute.worker_ips
  }
  description = "Chi tiết hạ tầng Enterprise đã được Provision thành công"
}
