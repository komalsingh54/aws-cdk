#!/bin/bash

sudo su
yum update -y
yum install -y httpd

systemctl start httpd
systemctl enable httpd

echo "<h1>Hello from AWS CDK Course on Udemy with Rahul</h1>" > /var/www/html/index.html