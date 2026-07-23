output "control_plane_sg_id" {
  value = "${var.project_name}-${var.environment}-control-plane-sg"
}

output "worker_node_sg_id" {
  value = "${var.project_name}-${var.environment}-worker-node-sg"
}

output "database_sg_id" {
  value = "${var.project_name}-${var.environment}-database-sg"
}
