#!/bin/sh

echoerr() { echo "$@" 1>&2; }

img_name=lwm-frontend
packed_name=dist/${img_name}.tar

ng build

if [ $? -eq 0 ]; then
  docker stop ${img_name}
  docker container rm ${img_name}
  docker image rm ${img_name}
  docker build -t ${img_name} .

  if [ $? -eq 0 ]; then
    rm ${packed_name} > /dev/null 2>&1 &
    docker save -o ${packed_name} ${img_name}
    if [ $? -eq 0 ]; then
      docker run -p 9001:80 -d --name ${img_name} ${img_name}
      if [ $? -eq 0 ]; then
        echo ${img_name} is running
      else
        echoerr docker run failed
      fi
    else
      echoerr docker save failed
    fi
  else
    echoerr docker build failed
  fi
else
  echoerr ng build failed
fi
