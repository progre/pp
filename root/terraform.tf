terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "3.79.0"
    }
  }
}

variable "env_insecure_domain" {}
variable "env_email_address" {}
variable "env_password" {}
variable "env_root_crt_file_name" {}
variable "env_root_domain" {}
variable "env_root_key_file_name" {}
variable "google_cloud_dns_zone_name" {}
variable "google_credential_file_name" {}
variable "google_environment_target" {}
variable "google_power" {}
variable "google_project" {}

provider "google" {
  credentials = file(var.google_credential_file_name)
  region      = "us-west1"
  project     = var.google_project
}

resource "google_compute_network" "tf_network" {
  name = "tf-network"
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
  count = var.google_power ? 1 : 0

  name = "tf-${var.google_environment_target}-ipv4-address"
}

resource "google_dns_record_set" "resource_recordset" {
  count = var.google_power && var.google_environment_target == "production" ? 1 : 0

  managed_zone = var.google_cloud_dns_zone_name
  name         = "${var.env_root_domain}."
  type         = "A"
  rrdatas      = [google_compute_address.tf_address[0].address]
  ttl          = 300
}

resource "google_dns_record_set" "resource_recordset2" {
  count = var.google_power && var.google_environment_target == "production" ? 1 : 0

  managed_zone = var.google_cloud_dns_zone_name
  name         = "${var.env_insecure_domain}."
  type         = "A"
  rrdatas      = [google_compute_address.tf_address[0].address]
  ttl          = 300
}

resource "google_compute_instance" "tf_cloud_01" {
  count = var.google_power ? 1 : 0

  name                      = "tf-${var.google_environment_target}"
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
    gce-container-declaration = <<-EOT
    spec:
      containers:
        - image: 'docker.io/progre/pp:latest'
          stdin: false
          tty: true
          env:
            - name: ROOT_DOMAIN
              value: "${var.env_root_domain}"
            - name: INSECURE_DOMAIN
              value: "${var.env_insecure_domain}"
            - name: EMAIL_ADDRESS
              value: "${var.env_email_address}"
            - name: PASSWORD
              value: "${var.env_password}"
            - name: ROOT_CRT
              value: "${replace(file(var.env_root_crt_file_name), "\n", "\\n")}"
            - name: ROOT_KEY
              value: "${replace(file(var.env_root_key_file_name), "\n", "\\n")}"
          volumeMounts:
            - name: dockersock
              mountPath: /var/run/docker.sock
      volumes:
        - name: dockersock
          hostPath:
            path: /var/run/docker.sock
      restartPolicy: Never
    EOT
  }
  network_interface {
    network = google_compute_network.tf_network.name
    access_config {
      nat_ip = google_compute_address.tf_address[0].address
    }
  }
}

resource "google_logging_project_bucket_config" "tf_bucket" {
  project        = var.google_project
  location       = "global"
  retention_days = 30
  bucket_id      = "pp-${var.google_environment_target}"
}

resource "google_logging_project_sink" "tf_sink" {
  name                   = "tf-sink-${var.google_environment_target}"
  destination            = "logging.googleapis.com/${google_logging_project_bucket_config.tf_bucket.id}"
  filter                 = "logName = projects/${var.google_project}/logs/pp-${var.google_environment_target}"
  unique_writer_identity = true
}
