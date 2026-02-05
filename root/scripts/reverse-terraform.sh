#!/bin/bash -eux

environment_target=$(sed --null-data --regexp-extended 's/^.+google_environment_target += "([^\"]+)".*$/\1/' terraform.tfvars)
project=$(sed --null-data --regexp-extended 's/^.+google_project += "([^\"]+)".*$/\1/' terraform.tfvars)

terraform init
terraform import \
  google_compute_network.tf_network \
  "projects/$project/global/networks/tf-network"
terraform import \
  google_compute_firewall.tf_firewall \
  "projects/$project/global/firewalls/tf-firewall"
terraform import \
  google_compute_address.tf_address \
  "projects/$project/regions/us-west1/addresses/tf-$environment_target-ipv4-address" \
  || echo skip
terraform import \
  google_compute_instance.tf_cloud_01 \
  "projects/$project/zones/us-west1-c/instances/tf-$environment_target" \
  || echo skip
terraform import \
  google_logging_project_bucket_config.tf_bucket \
  "projects/$project/locations/global/buckets/pp-$environment_target" \
  || echo skip
terraform import \
  google_logging_project_sink.tf_sink \
  "projects/$project/sinks/tf-sink-$environment_target" \
  || echo skip
