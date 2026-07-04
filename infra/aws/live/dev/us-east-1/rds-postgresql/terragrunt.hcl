include "root" {
  path = find_in_parent_folders("terragrunt.hcl")
}

locals {
  common = read_terragrunt_config(find_in_parent_folders("common.hcl"))

  # These are non-sensitive static validation placeholders only. They are not
  # real network outputs and are invalid for account-backed plan or apply.
  static_validation_only_network = {
    private_subnet_ids = [
      "subnet-static-validation-only-a",
      "subnet-static-validation-only-b",
    ]
    vpc_security_group_ids = [
      "sg-static-validation-only",
    ]
  }
}

terraform {
  source = "../../../../modules/rds-postgresql"
}

inputs = {
  identifier      = "flagforge-dev-postgres"
  database_name   = "flagforge"
  master_username = "flagforge_admin"

  engine_version            = "17"
  instance_class            = "db.t4g.micro"
  allocated_storage_gib     = 20
  max_allocated_storage_gib = 100
  storage_encrypted         = true
  publicly_accessible       = false

  private_subnet_ids     = local.static_validation_only_network.private_subnet_ids
  vpc_security_group_ids = local.static_validation_only_network.vpc_security_group_ids

  backup_retention_period_days = 7
  backup_window                = "03:00-04:00"
  maintenance_window           = "sun:04:00-sun:05:00"
  deletion_protection          = false
  skip_final_snapshot          = false

  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]
  monitoring_interval_seconds     = 0
  performance_insights_enabled    = false

  tags = merge(
    local.common.locals.mandatory_tags,
    {
      environment = "dev"
      component   = "postgresql"
    }
  )
}
