output "master_ip" {
  value = "10.0.2.10"
}

output "worker_ips" {
  value = [for i in range(var.worker_count) : "10.0.2.1${i + 1}"]
}
