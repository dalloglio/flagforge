variable "name" {
  description = "Non-sensitive ALB name."
  type        = string
}

variable "vpc_id" {
  description = "VPC ID supplied by future networking outputs. This module does not create VPCs."
  type        = string
}

variable "subnet_ids" {
  description = "Subnet IDs supplied by future networking outputs. Internet-facing ALBs require public subnets; internal ALBs require private subnets."
  type        = list(string)
}

variable "security_group_ids" {
  description = "ALB security group IDs supplied by future networking outputs. This module does not create security groups."
  type        = list(string)
}

variable "exposure_mode" {
  description = "ALB exposure mode. Use internet-facing for the dev learning target or internal for a future private environment."
  type        = string
  default     = "internet-facing"

  validation {
    condition     = contains(["internet-facing", "internal"], var.exposure_mode)
    error_message = "exposure_mode must be either internet-facing or internal."
  }
}

variable "listener_port" {
  description = "HTTP listener port for the first ALB contract."
  type        = number
  default     = 80
}

variable "listener_protocol" {
  description = "Listener protocol for the first ALB contract. TLS and certificates are future work."
  type        = string
  default     = "HTTP"
}

variable "target_group_port" {
  description = "Future workload target port expected by the ALB target group."
  type        = number
  default     = 3000
}

variable "target_group_protocol" {
  description = "Future workload target protocol expected by the ALB target group."
  type        = string
  default     = "HTTP"
}

variable "target_type" {
  description = "Target type for future EKS pod or node registration."
  type        = string
  default     = "ip"
}

variable "health_check_path" {
  description = "Future workload health check path."
  type        = string
  default     = "/readyz"
}

variable "ingress_class_name" {
  description = "Future Kubernetes ingress class assumption for AWS Load Balancer Controller."
  type        = string
  default     = "alb"
}

variable "controller_name" {
  description = "Future ingress controller path assumption."
  type        = string
  default     = "aws-load-balancer-controller"
}

variable "tags" {
  description = "Non-sensitive tags applied to supported ALB resources."
  type        = map(string)
}
