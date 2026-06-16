variable "name_prefix" {
  type        = string
  description = "Resource name prefix, e.g. centroid-prod"
}

variable "api_origin_domain" {
  type        = string
  description = "Backend ALB DNS name (from backend terraform output alb_dns_name)"
}

variable "api_origin_protocol" {
  type        = string
  default     = "http-only"
  description = "CloudFront origin protocol policy for the API origin: http-only or https-only"

  validation {
    condition     = contains(["http-only", "https-only"], var.api_origin_protocol)
    error_message = "api_origin_protocol must be http-only or https-only."
  }
}

variable "api_origin_port" {
  type        = number
  default     = 80
  description = "Port on the ALB origin (80 for HTTP-only ALB, 443 for HTTPS ALB)"
}

variable "price_class" {
  type        = string
  default     = "PriceClass_100"
  description = "CloudFront price class"
}

variable "aliases" {
  type        = list(string)
  default     = []
  description = "Optional custom domain names for the CloudFront distribution"
}

variable "acm_certificate_arn" {
  type        = string
  default     = ""
  description = "ACM certificate ARN in us-east-1 for custom CloudFront domain. Required when aliases is non-empty."
}
