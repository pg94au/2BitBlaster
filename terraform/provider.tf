provider "aws" {
  profile = "default"
  region  = var.region
}

provider "aws" {
  alias  = "us-east-1"
  region = "us-east-1"
}

terraform {
  backend "s3" {
    bucket = "2bitblaster-tfstate"
    key    = "terraform.tfstate"
    region = "ca-central-1"
  }
}
