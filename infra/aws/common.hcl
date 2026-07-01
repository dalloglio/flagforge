locals {
  project     = "flagforge"
  managed_by  = "opentofu"
  owner       = "platform"
  cost_center = "learning"

  mandatory_tags = {
    project     = local.project
    managed-by  = local.managed_by
    owner       = local.owner
    cost-center = local.cost_center
  }
}
