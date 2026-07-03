locals {
  subnet_group_name         = coalesce(var.db_subnet_group_name, "${var.identifier}-subnet-group")
  final_snapshot_identifier = var.skip_final_snapshot ? null : "${var.identifier}-final-snapshot"
}

resource "aws_db_subnet_group" "this" {
  name       = local.subnet_group_name
  subnet_ids = var.private_subnet_ids

  tags = merge(var.tags, {
    Name = local.subnet_group_name
  })
}

resource "aws_db_instance" "this" {
  identifier = var.identifier

  engine         = "postgres"
  engine_version = var.engine_version
  instance_class = var.instance_class

  allocated_storage     = var.allocated_storage_gib
  max_allocated_storage = var.max_allocated_storage_gib
  storage_type          = var.storage_type
  storage_encrypted     = var.storage_encrypted
  kms_key_id            = var.kms_key_id

  db_name  = var.database_name
  username = var.master_username
  port     = 5432

  manage_master_user_password   = true
  master_user_secret_kms_key_id = var.master_user_secret_kms_key_id

  db_subnet_group_name   = aws_db_subnet_group.this.name
  vpc_security_group_ids = var.vpc_security_group_ids
  publicly_accessible    = var.publicly_accessible

  backup_retention_period   = var.backup_retention_period_days
  backup_window             = var.backup_window
  maintenance_window        = var.maintenance_window
  copy_tags_to_snapshot     = true
  deletion_protection       = var.deletion_protection
  skip_final_snapshot       = var.skip_final_snapshot
  final_snapshot_identifier = local.final_snapshot_identifier

  auto_minor_version_upgrade      = var.auto_minor_version_upgrade
  enabled_cloudwatch_logs_exports = var.enabled_cloudwatch_logs_exports
  monitoring_interval             = var.monitoring_interval_seconds
  monitoring_role_arn             = var.monitoring_role_arn
  performance_insights_enabled    = var.performance_insights_enabled
  apply_immediately               = var.apply_immediately

  tags = var.tags
}
