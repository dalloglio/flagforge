output "load_balancer_arn" {
  description = "ALB ARN reference for future deployment composition."
  value       = aws_lb.this.arn
}

output "load_balancer_dns_name" {
  description = "ALB DNS name reference. Route 53 and TLS ownership are future work."
  value       = aws_lb.this.dns_name
}

output "load_balancer_zone_id" {
  description = "ALB zone ID reference for future DNS work."
  value       = aws_lb.this.zone_id
}

output "listener_arn" {
  description = "Listener ARN reference for future routing work."
  value       = aws_lb_listener.http.arn
}

output "target_group_arn" {
  description = "Target group ARN reference for future EKS service or TargetGroupBinding work."
  value       = aws_lb_target_group.flagforge.arn
}

output "ingress_handoff" {
  description = "Non-secret ingress references for future Helm or Argo CD work."
  value = {
    ingress_class_name = var.ingress_class_name
    controller_name    = var.controller_name
    exposure_mode      = var.exposure_mode
    listener_port      = var.listener_port
    listener_protocol  = var.listener_protocol
    health_check_path  = var.health_check_path
  }
}

output "network_dependency_references" {
  description = "Non-secret references to externally supplied network dependencies."
  value = {
    vpc_id             = var.vpc_id
    subnet_ids         = var.subnet_ids
    security_group_ids = var.security_group_ids
  }
}
