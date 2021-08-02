```
$ docker build --tag progre/pp:latest .
$ docker push progre/pp:latest
$ terraform init
$ terraform apply -var-file="main.tfvars" -auto-approve
```

```
$ terraform destroy -var-file="main.tfvars" -auto-approve
$ docker run -it --env DOMAIN=localhost --env EMAIL_ADDRESS=hoge@example.com --env PASSWORD=hoge -p 80:80 -p 7146:7144 progre/pp:latest
```

pcp://root.p-at.net
https://p-at.net/index.txt
