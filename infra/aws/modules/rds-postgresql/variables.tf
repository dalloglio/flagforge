variable "identifier" {
  description = "Non-sensitive RDS instance identifier."
  type        = string
}

variable "database_name" {
  description = "Initial PostgreSQL database name for the FlagForge schema."
  type        = string
  default     = "flagforge"
}

variable "master_username" {
  description = "Non-secret master username reference. The password is RDS-managed and is not accepted as input."
  type        = string
  default     = "flagforge_admin"
}

variable "engine_version" {
  description = "PostgreSQL engine version for the first AWS target."
  type        = string
  default     = "17"
}

variable "instance_class" {
  description = "Development-sized RDS instance class for the first learning target."
  type        = string
  default     = "db.t4g.micro"
}

variable "allocated_storage_gib" {
  description = "Initial allocated storage in GiB."
  type        = number
  default     = 20
}

variable "max_allocated_storage_gib" {
  description = "Maximum autoscaled storage in GiB."
  type        = number
  default     = 100
}

variable "storage_type" {
  description = "RDS storage type."
  type        = string
  default     = "gp3"
}

variable "storage_encrypted" {
  description = "Whether RDS storage encryption is enabled."
  type        = bool
  default     = true
}

variable "kms_key_id" {
  description = "Optional KMS key ID or ARN for storage encryption. Null uses the AWS-managed default."
  type        = string
  default     = null
}

variable "master_user_secret_kms_key_id" {
  description = "Optional KMS key ID or ARN for the RDS-managed master user secret. Null uses the AWS-managed default."
  type        = string
  default     = null
}

variable "private_subnet_ids" {
  description = "Private subnet IDs supplied by future networking outputs. This module does not create subnets."
  type        = list(string)
}

variable "vpc_security_group_ids" {
  description = "Database security group IDs supplied by future networking outputs. This module does not create security groups."
  type        = list(string)
}

variable "db_subnet_group_name" {
  description = "Optional DB subnet group name. Null derives a non-sensitive name from the identifier."
  type        = string
  default     = null
}

variable "publicly_accessible" {
  description = "Whether the database receives public network exposure. Defaults to false."
  type        = bool
  default     = false
}

variable "backup_retention_period_days" {
  description = "Backup retention period in days for the development target."
  type        = number
  default     = 7
}

variable "backup_window" {
  description = "Preferred backup window in UTC."
  type        = string
  default     = "03:00-04:00"
}

variable "maintenance_window" {
  description = "Preferred maintenance window in UTC."
  type        = string
  default     = "sun:04:00-sun:05:00"
}

variable "auto_minor_version_upgrade" {
  description = "Whether AWS may apply minor PostgreSQL upgrades during the maintenance window."
  type        = bool
  default     = true
}

variable "deletion_protection" {
  description = "Whether deletion protection is enabled. Defaults to false for the non-production learning target."
  type        = bool
  default     = false
}

variable "skip_final_snapshot" {
  description = "Whether to skip a final snapshot on deletion. Defaults to false to preserve data by default."
  type        = bool
  default     = false
}

variable "enabled_cloudwatch_logs_exports" {
  description = "PostgreSQL log types exported to CloudWatch Logs."
  type        = list(string)
  default     = ["postgresql", "upgrade"]
}

variable "monitoring_interval_seconds" {
  description = "Enhanced monitoring interval in seconds. Zero disables enhanced monitoring."
  type        = number
  default     = 0
}

variable "monitoring_role_arn" {
  description = "Optional IAM role ARN for enhanced monitoring. Null is valid when monitoring interval is zero."
  type        = string
  default     = null
}

variable "performance_insights_enabled" {
  description = "Whether Performance Insights is enabled."
  type        = bool
  default     = false
}

variable "apply_immediately" {
  description = "Whether RDS changes apply immediately instead of during the maintenance window."
  type        = bool
  default     = false
}

variable "tags" {
  description = "Non-sensitive tags applied to supported RDS resources."
  type        = map(string)
}
