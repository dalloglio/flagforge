include "root" {
  path = find_in_parent_folders("terragrunt.hcl")
}

locals {
  common = read_terragrunt_config(find_in_parent_folders("common.hcl"))

  # These are non-sensitive static validation placeholders only. They are not
  # real network or IAM outputs and are invalid for account-backed plan or apply.
  static_validation_only_dependencies = {
    private_subnet_ids = [
      "subnet-static-validation-only-a",
      "subnet-static-validation-only-b",
    ]
    cluster_security_group_ids = [
      "sg-static-validation-only-eks",
    ]
    cluster_role_arn        = "arn:aws:iam::000000000000:role/static-validation-only-eks-cluster"
    node_role_arn           = "arn:aws:iam::000000000000:role/static-validation-only-eks-node"
    alb_controller_role_arn = "arn:aws:iam::000000000000:role/static-validation-only-alb-controller"
  }
}

terraform {
  source = "../../../../modules/eks"
}

inputs = {
  cluster_name       = "flagforge-dev"
  kubernetes_version = "1.34"

  cluster_role_arn = local.static_validation_only_dependencies.cluster_role_arn
  node_role_arn    = local.static_validation_only_dependencies.node_role_arn

  private_subnet_ids         = local.static_validation_only_dependencies.private_subnet_ids
  cluster_security_group_ids = local.static_validation_only_dependencies.cluster_security_group_ids

  endpoint_public_access  = true
  endpoint_private_access = true
  public_access_cidrs     = ["0.0.0.0/0"]

  node_group_name     = "flagforge-dev-default"
  node_instance_types = ["t3.small"]
  node_capacity_type  = "ON_DEMAND"
  node_desired_size   = 2
  node_min_size       = 1
  node_max_size       = 3

  namespace                      = "flagforge"
  alb_controller_service_account = "aws-load-balancer-controller"
  alb_controller_role_arn        = local.static_validation_only_dependencies.alb_controller_role_arn

  tags = merge(
    local.common.locals.mandatory_tags,
    {
      environment = "dev"
      component   = "eks"
    }
  )
}
