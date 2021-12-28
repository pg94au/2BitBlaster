variable "region" {
  default     = "ca-central-1"
  description = "AWS region"
}


variable "bucket_map" {
  description = "The bucket containing static site"
  type = map
  default = {
    test       = "2bittesting"
    production = "2bitblaster"
  }
}

variable "domain_map" {
  description = "The domain at which the site is hosted"
  type = map
  default = {
    test        = "2bittesting.blinkenlights.org"
    production  = "2bitblaster.blinkenlights.org"
  }
}

locals {
  bucket = lookup(var.bucket_map, terraform.workspace, var.bucket_map["test"])
#  bucket = var.bucket_map[terraform.workspace]
  domain = lookup(var.domain_map, terraform.workspace, var.domain_map["test"])
#  domain = var.domain_map[terraform.workspace]
}
