```
$ docker build --tag progre/pp-nginx:latest --file nginx/Dockerfile . && \
  docker build --tag progre/pp-peercast:latest --file peercast/Dockerfile . && \
  docker build --tag progre/pp:latest .
$ docker push progre/pp-nginx:latest && \
  docker push progre/pp-peercast:latest && \
  docker push progre/pp:latest
$ terraform init
$ terraform apply -var-file="main.tfvars" -auto-approve
```

```
$ terraform destroy -var-file="main.tfvars" -auto-approve
$ docker run -it \
  --volume /var/run/docker.sock:/var/run/docker.sock \
  --env ROOT_DOMAIN=localhost \
  --env INSECURE_DOMAIN=localhost2 \
  --env EMAIL_ADDRESS=hoge@example.com \
  --env PASSWORD=hoge \
  progre/pp:latest
```

pcp://root.p-at.net
https://p-at.net/index.txt
