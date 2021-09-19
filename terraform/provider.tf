provider "aws" {
  profile = "default"
  region  = var.region
}

terraform {
  backend "s3" {
    bucket = "2bitblaster-tfstate"
    key    = "terraform.tfstate"
    region = "ca-central-1"
  }
}
