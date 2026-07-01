variable "project" {
  description = "Non-sensitive project identifier used for future resource naming and tags."
  type        = string
  default     = "flagforge"
}

variable "environment" {
  description = "Non-sensitive environment identifier for future live composition."
  type        = string
  default     = "dev"
}

variable "aws_region" {
  description = "Example AWS region convention for future account-backed workflows."
  type        = string
  default     = "us-east-1"
}

variable "mandatory_tags" {
  description = "Baseline non-sensitive tags expected on future AWS resources that support tags."
  type        = map(string)
  default = {
    project     = "flagforge"
    environment = "dev"
    managed-by  = "opentofu"
    owner       = "platform"
    cost-center = "learning"
  }
}
