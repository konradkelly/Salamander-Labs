variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "environment" {
  type    = string
  default = "prod"
}

variable "github_org" {
  type        = string
  description = "GitHub organization or user for OIDC trust"
}

variable "github_repo" {
  type        = string
  description = "This frontend repository name"
}

variable "api_origin_domain" {
  type        = string
  description = "Backend ALB DNS name from centroid-finder terraform output alb_dns_name"
}

variable "api_origin_protocol" {
  type        = string
  default     = "http-only"
  description = "http-only until the backend ALB has an ACM certificate; then use https-only with api_origin_port 443"
}

variable "api_origin_port" {
  type    = number
  default = 80
}

variable "cloudfront_aliases" {
  type        = list(string)
  default     = []
  description = "Optional custom domain, e.g. [\"app.example.com\"]"
}

variable "cloudfront_certificate_arn" {
  type        = string
  default     = ""
  description = "ACM cert in us-east-1 when using cloudfront_aliases"
}
