#/bin/bash


if [ "$version" == "last" ]
then
	version=`helm history $name  |awk '/./{line=$0} END{print line}' |awk '{print $1}'`
	version=$((version - 1))
	echo "Retornando para versao $version"
else
	echo "Retornando para versao $version"
fi

helm rollback $name $version

