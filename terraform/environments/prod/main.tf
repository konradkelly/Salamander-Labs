terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "centroid-finder"
      Environment = var.environment
      Component   = "frontend"
      ManagedBy   = "terraform"
    }
  }
}

locals {
  name_prefix = "centroid-${var.environment}"
}

module "frontend" {
  source = "../../modules/frontend"

  name_prefix           = local.name_prefix
  api_origin_domain     = var.api_origin_domain
  api_origin_protocol   = var.api_origin_protocol
  api_origin_port       = var.api_origin_port
  aliases               = var.cloudfront_aliases
  acm_certificate_arn   = var.cloudfront_certificate_arn
}

module "github_oidc" {
  source = "../../modules/github-oidc-frontend"

  github_org                  = var.github_org
  github_repo                 = var.github_repo
  frontend_bucket_arn         = module.frontend.bucket_arn
  cloudfront_distribution_arn = module.frontend.distribution_arn
}
