output "endpoint" {
  description = "RDS endpoint in host:port form for future deployment composition."
  value       = aws_db_instance.this.endpoint
}

output "address" {
  description = "RDS hostname for future deployment composition."
  value       = aws_db_instance.this.address
}

output "port" {
  description = "RDS PostgreSQL port."
  value       = aws_db_instance.this.port
}

output "database_name" {
  description = "Initial database name compatible with the FlagForge migration path."
  value       = aws_db_instance.this.db_name
}

output "master_username_reference" {
  description = "Non-secret master username reference. The password is managed by RDS."
  value       = aws_db_instance.this.username
}

output "managed_master_user_secret_arn" {
  description = "Sensitive RDS-managed master password secret ARN for future deployment work."
  value       = try(aws_db_instance.this.master_user_secret[0].secret_arn, null)
  sensitive   = true
}

output "network_dependency_references" {
  description = "Non-secret references to externally supplied network dependencies."
  value = {
    db_subnet_group_name   = aws_db_subnet_group.this.name
    private_subnet_ids     = var.private_subnet_ids
    vpc_security_group_ids = var.vpc_security_group_ids
  }
}
