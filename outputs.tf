output "version" {
  description = "Module version."
  value       = "${local.version}"
}

output "webhook_url" {
  description = "Webhook URL."
  value       = "${google_cloudfunctions_function.function.https_trigger_url}"
}
