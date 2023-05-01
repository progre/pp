terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "4.38.0"
    }
  }
}

variable "env_email_address" {}
variable "env_password" {}
variable "logflare_uri" {}
variable "generate_index_txt_google_application_credentials_json" {}
variable "google_cloud_dns_zone_name" {}
variable "google_environment_target" {}
variable "google_power" {}
variable "google_project" {}

provider "google" {
  credentials = file("secrets/google_credential.json")
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
    ports    = ["22", "80", "443", "7144", "7146", "7443"]
  }
}

resource "google_compute_address" "tf_address" {
  count = var.google_power ? 1 : 0

  name = "tf-${var.google_environment_target}-ipv4-address"
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
            - name: EMAIL_ADDRESS
              value: "${var.env_email_address}"
            - name: GENERATE_INDEX_TXT_BUCKET_NAME
              value: "p-at-net"
            - name: GENERATE_INDEX_TXT_GOOGLE_APPLICATION_CREDENTIALS_JSON
              value: "${var.generate_index_txt_google_application_credentials_json}"
            - name: INSECURE_DOMAIN
              value: "insecure.p-at.net"
            - name: LOGFLARE_URI
              value: "${var.logflare_uri}"
            - name: PASSWORD
              value: "${var.env_password}"
            - name: ROOT_CRT
              value: "${replace(file("secrets/root.crt"), "\n", "\\n")}"
            - name: ROOT_DOMAIN
              value: "root.p-at.net"
            - name: ROOT_KEY
              value: "${replace(file("secrets/root.key"), "\n", "\\n")}"
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
  project        = "projects/${var.google_project}"
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
