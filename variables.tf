// Google Cloud
variable "bucket_name" {
  description = "Cloud Storage bucket for storing Cloud Function code archives."
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
  default     = 512
}

variable "timeout" {
  description = "Timeout in seconds for Cloud Function."
  default     = 10
}
