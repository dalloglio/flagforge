output "foundation_metadata" {
  description = "Non-sensitive metadata proving the foundation module validates without managed AWS resources."
  value = {
    project     = var.project
    environment = var.environment
    aws_region  = var.aws_region
    tag_keys    = sort(keys(var.mandatory_tags))
  }
}
