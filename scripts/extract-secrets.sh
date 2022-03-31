#!/bin/bash -eux

{
  echo "$TF_TERRAFORM_TFVARS"
  echo "logflare_uri = \"$LOGFLARE_URI\""
  echo "google_environment_target = \"$GOOGLE_ENVIRONMENT_TARGET\""
  echo "google_power = \"$GOOGLE_POWER\""
} > root/terraform.tfvars
mkdir root/secrets/
echo "$TF_GOOGLE_CREDENTIAL_FILE" > root/secrets/google_credential.json
echo "$TF_ROOT_CRT_FILE" > root/secrets/root.crt
echo "$TF_ROOT_KEY_FILE" > root/secrets/root.key
