#!/bin/bash


#Nome="teste-odoo"
#Image_registry= "docker.io"
#Image_Name="bitnami/odoo"
#Image_Tag="11.0.20190315"

helm upgrade --name $name /opt/bradoo-chart/ --set image.registry=$url_image,image.repository=$image_name,image.tag=$image_tag,DB_ADDR=$DB_ADDR,DB_NAME=$name,DB_PORT=$DB_PORT,DB_USER=$name,DB_PASSWORD=$DB_PASSWORD





