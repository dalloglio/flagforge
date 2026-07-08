variable "cluster_name" {
  description = "Non-sensitive EKS cluster name."
  type        = string
}

variable "kubernetes_version" {
  description = "Kubernetes version for the EKS control plane."
  type        = string
  default     = "1.34"
}

variable "cluster_role_arn" {
  description = "EKS cluster IAM role ARN supplied by a future reviewed IAM workflow."
  type        = string
}

variable "node_role_arn" {
  description = "EKS managed node group IAM role ARN supplied by a future reviewed IAM workflow."
  type        = string
}

variable "private_subnet_ids" {
  description = "Private subnet IDs supplied by future networking outputs. This module does not create subnets."
  type        = list(string)
}

variable "cluster_security_group_ids" {
  description = "Additional EKS cluster security group IDs supplied by future networking outputs. This module does not create security groups."
  type        = list(string)
}

variable "endpoint_public_access" {
  description = "Whether the EKS endpoint is publicly reachable. The dev static contract uses true for learning access assumptions only."
  type        = bool
  default     = true
}

variable "endpoint_private_access" {
  description = "Whether the EKS endpoint is privately reachable inside the VPC."
  type        = bool
  default     = true
}

variable "public_access_cidrs" {
  description = "CIDR ranges allowed to reach the public EKS endpoint when enabled. Keep broad values out of production-like targets."
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "enabled_cluster_log_types" {
  description = "EKS control plane log types to export to CloudWatch Logs."
  type        = list(string)
  default     = ["api", "audit", "authenticator"]
}

variable "node_group_name" {
  description = "Non-sensitive managed node group name."
  type        = string
  default     = "default"
}

variable "node_instance_types" {
  description = "Development-sized EKS managed node group instance types."
  type        = list(string)
  default     = ["t3.small"]
}

variable "node_capacity_type" {
  description = "EKS managed node group capacity type. Defaults to ON_DEMAND for predictable learning behavior."
  type        = string
  default     = "ON_DEMAND"
}

variable "node_desired_size" {
  description = "Desired node count for the development-sized managed node group."
  type        = number
  default     = 2
}

variable "node_min_size" {
  description = "Minimum node count for the development-sized managed node group."
  type        = number
  default     = 1
}

variable "node_max_size" {
  description = "Maximum node count for the development-sized managed node group."
  type        = number
  default     = 3
}

variable "addon_versions" {
  description = "Optional explicit EKS add-on versions. Null lets AWS select the default compatible version."
  type = object({
    vpc_cni    = optional(string)
    coredns    = optional(string)
    kube_proxy = optional(string)
    ebs_csi    = optional(string)
  })
  default = {}
}

variable "namespace" {
  description = "Future FlagForge workload namespace assumption. This module does not create Kubernetes resources."
  type        = string
  default     = "flagforge"
}

variable "alb_controller_service_account" {
  description = "Future AWS Load Balancer Controller service account name assumption. This module does not install the controller."
  type        = string
  default     = "aws-load-balancer-controller"
}

variable "alb_controller_role_arn" {
  description = "Optional future ALB controller IAM role ARN reference. Null keeps IAM/OIDC automation out of this static contract."
  type        = string
  default     = null
}

variable "tags" {
  description = "Non-sensitive tags applied to supported EKS resources."
  type        = map(string)
}
