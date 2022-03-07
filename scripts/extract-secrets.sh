#!/bin/bash -eux

cd root/ && \
echo "$TF_TERRAFORM_TFVARS" > terraform.tfvars && \
echo "google_environment_target = $GOOGLE_ENVIRONMENT_TARGET" >> terraform.tfvars && \
mkdir secrets/ && \
echo "$TF_GOOGLE_CREDENTIAL_FILE" > secrets/google_credential.json && \
echo "$TF_ROOT_CRT_FILE" > secrets/root.crt && \
echo "$TF_ROOT_KEY_FILE" > secrets/root.key
