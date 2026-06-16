output "frontend_bucket_name" {
  value = module.frontend.bucket_name
}

output "cloudfront_distribution_id" {
  value = module.frontend.distribution_id
}

output "cloudfront_domain_name" {
  value = module.frontend.cloudfront_domain_name
}

output "cloudfront_url" {
  value = module.frontend.cloudfront_url
}

output "github_deploy_role_arn" {
  value = module.github_oidc.role_arn
}
