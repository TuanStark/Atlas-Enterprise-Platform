# Module Compute Provisioning K8s Master & Worker Nodes
locals {
  name_prefix = "${var.project_name}-${var.environment}"
}

# Tự động tạo file Ansible Inventory theo cấu hình Nodes thực tế
resource "local_file" "dynamic_ansible_inventory" {
  filename = "${path.module}/../../ansible/inventory/hosts.ini"
  content  = <<EOF
[k8s_master]
${local.name_prefix}-master-01 ansible_host=10.0.2.10 ansible_user=ubuntu private_ip=10.0.2.10

[k8s_workers]
%{ for i in range(var.worker_count) ~}
${local.name_prefix}-worker-0${i + 1} ansible_host=10.0.2.1${i + 1} ansible_user=ubuntu private_ip=10.0.2.1${i + 1}
%{ endfor ~}

[all:vars]
ansible_python_interpreter=/usr/bin/python3
environment=${var.environment}
project_name=${var.project_name}
subnet_id=${var.private_app_subnet_id}
EOF
}
