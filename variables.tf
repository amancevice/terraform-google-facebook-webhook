// Google Cloud
variable "bucket_name" {
  description = "Cloud Storage bucket for storing Cloud Function code archives."
}

variable "client_secret" {
  description = "Google Cloud client secret JSON."
}

variable "project" {
  description = "The ID of the project to apply any resources to."
  default     = ""
}

variable "pubsub_topic" {
  description = "Pub/Sub Topic Name."
}

// facebook
variable "verification_token" {
  description = "facebook verification token."
}

// Cloud Function
variable "description" {
  description = "Description of the function."
  default     = "facebook webhook handler"
}

variable "function_name" {
  description = "Cloud Function name."
  default     = "facebook-webhook"
}

variable "labels" {
  description = "A set of key/value label pairs to assign to the function."
  type        = "map"

  default {
    deployment-tool = "terraform"
  }
}

variable "memory" {
  description = "Memory for Cloud Function."
  default     = 256
}

variable "timeout" {
  description = "Timeout in seconds for Cloud Function."
  default     = 10
}
