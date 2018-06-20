provider "archive" {
  version = "~> 1.0"
}

provider "template" {
  version = "~> 1.0"
}

locals {
  version = "0.2.0"
}

data "google_client_config" "cloud" {
}

data "template_file" "config" {
  template = "${file("${path.module}/src/config.tpl")}"

  vars {
    project            = "${coalesce("${var.project}", "${data.google_client_config.cloud.project}")}"
    pubsub_topic       = "${var.pubsub_topic}"
    verification_token = "${var.verification_token}"
  }
}

data "template_file" "package" {
  template = "${file("${path.module}/src/package.tpl")}"

  vars {
    version = "${local.version}"
  }
}

data "archive_file" "archive" {
  type        = "zip"
  output_path = "${path.module}/dist/${var.function_name}-${local.version}.zip"

  source {
    content  = "${var.client_secret}"
    filename = "client_secret.json"
  }

  source {
    content  = "${data.template_file.config.rendered}"
    filename = "config.json"
  }

  source {
    content  = "${file("${path.module}/src/index.js")}"
    filename = "index.js"
  }

  source {
    content  = "${data.template_file.package.rendered}"
    filename = "package.json"
  }
}

resource "google_storage_bucket_object" "archive" {
  bucket = "${var.bucket_name}"
  name   = "${var.function_name}-${local.version}.zip"
  source = "${data.archive_file.archive.output_path}"
}

resource "google_cloudfunctions_function" "function" {
  available_memory_mb   = "${var.memory}"
  description           = "${var.description}"
  entry_point           = "webhook"
  labels                = "${var.labels}"
  name                  = "${var.function_name}"
  source_archive_bucket = "${var.bucket_name}"
  source_archive_object = "${google_storage_bucket_object.archive.name}"
  timeout               = "${var.timeout}"
  trigger_http          = true
}

resource "google_pubsub_topic" "topic" {
  name  = "${var.pubsub_topic}"
}
