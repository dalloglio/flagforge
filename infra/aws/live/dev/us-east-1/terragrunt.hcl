include "root" {
  path = find_in_parent_folders("terragrunt.hcl")
}

locals {
  common = read_terragrunt_config(find_in_parent_folders("common.hcl"))
}

terraform {
  source = "../../../modules/foundation"
}

inputs = {
  project     = local.common.locals.project
  environment = "dev"
  aws_region  = "us-east-1"

  mandatory_tags = merge(
    local.common.locals.mandatory_tags,
    {
      environment = "dev"
    }
  )
}
