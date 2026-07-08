output "cluster_name" {
  description = "EKS cluster name for future deployment and GitOps composition."
  value       = aws_eks_cluster.this.name
}

output "cluster_arn" {
  description = "EKS cluster ARN reference."
  value       = aws_eks_cluster.this.arn
}

output "cluster_endpoint" {
  description = "EKS API endpoint reference. Do not commit kubeconfigs or tokens derived from it."
  value       = aws_eks_cluster.this.endpoint
}

output "cluster_certificate_authority_data" {
  description = "EKS certificate authority data reference for future deployment composition."
  value       = aws_eks_cluster.this.certificate_authority[0].data
  sensitive   = true
}

output "oidc_provider_reference" {
  description = "Non-secret OIDC issuer reference for future least-privilege workload identity configuration."
  value       = aws_eks_cluster.this.identity[0].oidc[0].issuer
}

output "namespace" {
  description = "Future FlagForge workload namespace assumption. The module does not create Kubernetes resources."
  value       = var.namespace
}

output "node_group_name" {
  description = "EKS managed node group name."
  value       = aws_eks_node_group.default.node_group_name
}

output "network_dependency_references" {
  description = "Non-secret references to externally supplied network dependencies."
  value = {
    private_subnet_ids         = var.private_subnet_ids
    cluster_security_group_ids = var.cluster_security_group_ids
  }
}

output "identity_dependency_references" {
  description = "References to externally supplied IAM and future controller identity dependencies."
  value = {
    cluster_role_arn               = var.cluster_role_arn
    node_role_arn                  = var.node_role_arn
    alb_controller_service_account = var.alb_controller_service_account
    alb_controller_role_arn        = var.alb_controller_role_arn
  }
}
