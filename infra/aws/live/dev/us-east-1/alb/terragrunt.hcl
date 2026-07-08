include "root" {
  path = find_in_parent_folders("terragrunt.hcl")
}

locals {
  common = read_terragrunt_config(find_in_parent_folders("common.hcl"))

  # These are non-sensitive static validation placeholders only. They are not
  # real network outputs and are invalid for account-backed plan or apply.
  static_validation_only_network = {
    vpc_id = "vpc-static-validation-only"
    public_subnet_ids = [
      "subnet-static-validation-only-public-a",
      "subnet-static-validation-only-public-b",
    ]
    alb_security_group_ids = [
      "sg-static-validation-only-alb",
    ]
  }
}

terraform {
  source = "../../../../modules/alb"
}

inputs = {
  name = "flagforge-dev-alb"

  vpc_id             = local.static_validation_only_network.vpc_id
  subnet_ids         = local.static_validation_only_network.public_subnet_ids
  security_group_ids = local.static_validation_only_network.alb_security_group_ids

  exposure_mode     = "internet-facing"
  listener_port     = 80
  listener_protocol = "HTTP"

  target_group_port     = 3000
  target_group_protocol = "HTTP"
  target_type           = "ip"
  health_check_path     = "/readyz"

  ingress_class_name = "alb"
  controller_name    = "aws-load-balancer-controller"

  tags = merge(
    local.common.locals.mandatory_tags,
    {
      environment = "dev"
      component   = "alb"
    }
  )
}
