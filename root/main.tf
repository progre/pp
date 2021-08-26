terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "3.79.0"
    }
  }
}

variable "env_root_domain" {}
variable "env_insecure_domain" {}
variable "env_email_address" {}
variable "env_password" {}
variable "google_credential_file_name" {}
variable "google_project" {}
variable "google_cloud_dns_zone_name" {}

provider "google" {
  credentials = file(var.google_credential_file_name)
  region      = "us-west1"
  project     = var.google_project
}

resource "google_compute_network" "tf_network" {
  name = "terraform-network"
}

resource "google_compute_firewall" "tf_firewall" {
  name        = "tf-firewall"
  network     = google_compute_network.tf_network.name
  target_tags = ["tf-firewall"]
  allow {
    protocol = "tcp"
    ports    = ["22", "80", "443", "7144"]
  }
}

resource "google_compute_address" "tf_address" {
  name = "ipv4-address"
}

resource "google_dns_record_set" "resource_recordset" {
  managed_zone = var.google_cloud_dns_zone_name
  name         = "${var.env_root_domain}."
  type         = "A"
  rrdatas      = [google_compute_address.tf_address.address]
  ttl          = 86400
}

resource "google_dns_record_set" "resource_recordset2" {
  managed_zone = var.google_cloud_dns_zone_name
  name         = "${var.env_insecure_domain}."
  type         = "A"
  rrdatas      = [google_compute_address.tf_address.address]
  ttl          = 86400
}

resource "google_compute_instance" "tf-cloud-01" {
  name                      = "tf-cloud-01"
  machine_type              = "e2-micro"
  zone                      = "us-west1-a"
  tags                      = [google_compute_firewall.tf_firewall.name]
  allow_stopping_for_update = true
  boot_disk {
    initialize_params {
      image = "projects/cos-cloud/global/images/cos-stable-89-16108-403-15"
    }
  }
  metadata = {
    gce-container-declaration = "spec:\n  containers:\n    - image: 'docker.io/progre/pp:latest'\n      stdin: false\n      tty: true\n      env:\n        - name: \"ROOT_DOMAIN\"\n          value: \"${var.env_root_domain}\"\n        - name: \"INSECURE_DOMAIN\"\n          value: \"${var.env_insecure_domain}\"\n        - name: \"EMAIL_ADDRESS\"\n          value: \"${var.env_email_address}\"\n        - name: \"PASSWORD\"\n          value: \"${var.env_password}\"\n      volumeMounts:\n        - name: dockersock\n          mountPath: /var/run/docker.sock\n  volumes:\n    - name: dockersock\n      hostPath:\n        path: /var/run/docker.sock\n  restartPolicy: Never\n"
  }
  network_interface {
    network = google_compute_network.tf_network.name
    access_config {
      nat_ip = google_compute_address.tf_address.address
    }
  }
}

resource "google_logging_project_bucket_config" "pp_production" {
  project        = var.google_project
  location       = "global"
  retention_days = 30
  bucket_id      = "pp-production"
}

resource "google_logging_project_sink" "tf_sink" {
  name                   = "tf-pp-sink"
  destination            = "logging.googleapis.com/${google_logging_project_bucket_config.pp_production.id}"
  filter                 = "logName = ${google_logging_project_bucket_config.pp_production.id}"
  unique_writer_identity = true
}
