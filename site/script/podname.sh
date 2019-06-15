#!/bin/bash

if [ "$1" != "" ]; then
    echo "Get pods in service: $1"
else
    echo "Service blank"
    echo "Pass the target service"
    exit 1
fi


SELECTORS=$(kubectl get svc/"$1" -o=go-template='{{ range $key, $value := .spec.selector }}{{$key}}={{$value}},{{ end }}');

SELECTORS=${SELECTORS%?}

kubectl get pods --selector="$SELECTORS";
