terraform {
  backend "s3" {
    encrypt = true
    key     = "khatoon/terraform.tfstate"
  }
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
}
