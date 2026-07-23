# Module Security Groups Hạt Nhân Chuẩn CIS Benchmark
locals {
  name_prefix = "${var.project_name}-${var.environment}"
  
  # Ma trận phân quyền Firewall Security Rules
  control_plane_rules = [
    { port = 6443,  proto = "tcp", source = "10.0.0.0/16", desc = "Kubernetes API Server" },
    { port = 2379,  proto = "tcp", source = "10.0.0.0/16", desc = "etcd client API (2379-2380)" },
    { port = 10250, proto = "tcp", source = "10.0.0.0/16", desc = "Kubelet API" },
    { port = 10259, proto = "tcp", source = "10.0.0.0/16", desc = "kube-scheduler" },
    { port = 10257, proto = "tcp", source = "10.0.0.0/16", desc = "kube-controller-manager" }
  ]

  worker_node_rules = [
    { port = 10250, proto = "tcp", source = "10.0.0.0/16", desc = "Kubelet API" },
    { port = 30000, proto = "tcp", source = "0.0.0.0/0",     desc = "NodePort Services Range (30000-32767)" },
    { port = 8472,  proto = "udp", source = "10.0.0.0/16", desc = "Flannel VXLAN Overlay Network" },
    { port = 179,   proto = "tcp", source = "10.0.0.0/16", desc = "Calico BGP Peer Communication" }
  ]

  db_rules = [
    { port = 5432, proto = "tcp", source = "10.0.2.0/24", desc = "PostgreSQL Access (Chỉ cho phép App Subnet)" },
    { port = 6379, proto = "tcp", source = "10.0.2.0/24", desc = "Redis Access (Chỉ cho phép App Subnet)" }
  ]
}

resource "local_file" "security_matrix" {
  filename = "${path.module}/security_policy.json"
  content  = jsonencode({
    control_plane_sg = local.control_plane_rules
    worker_nodes_sg  = local.worker_node_rules
    database_sg      = local.db_rules
  })
}
