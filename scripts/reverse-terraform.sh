#!/bin/bash -eux

insecure_domain=$(sed --null-data --regexp-extended 's/^.+env_insecure_domain + = "([^\"]+)".*$/\1/' root/terraform.tfvars)
root_domain=$(sed --null-data --regexp-extended 's/^.+env_root_domain + = "([^\"]+)".*$/\1/' root/terraform.tfvars)
dns_zone_name=$(sed --null-data --regexp-extended 's/^.+google_cloud_dns_zone_name + = "([^\"]+)".*$/\1/' root/terraform.tfvars)
environment_target=$(sed --null-data --regexp-extended 's/^.+google_environment_target + = "([^\"]+)".*$/\1/' root/terraform.tfvars)
project=$(sed --null-data --regexp-extended 's/^.+google_project + = "([^\"]+)".*$/\1/' root/terraform.tfvars)

cd root/
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

if [ "$environment_target" = 'production' ]; then
  terraform import \
    google_dns_record_set.resource_recordset \
    "projects/$project/managedZones/$dns_zone_name/rrsets/$root_domain./A"
  terraform import \
    google_dns_record_set.resource_recordset2 \
    "projects/$project/managedZones/$dns_zone_name/rrsets/$insecure_domain./A"
fi

terraform import \
  google_compute_instance.tf_cloud_01 \
  "projects/$project/zones/us-west1-a/instances/tf-$environment_target" \
  || echo skip
terraform import \
  google_logging_project_bucket_config.tf_bucket \
  "projects/$project/locations/global/buckets/pp-$environment_target" \
  || echo skip
terraform import \
  google_logging_project_sink.tf_sink \
  "projects/$project/sinks/tf-sink-$environment_target" \
  || echo skip
