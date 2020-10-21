#!/bin/sh

img_name=lwm-frontend
packed_name=dist/${img_name}.tar

buildApp() {
  ng build --prod
}

dockerRebuild() {
  docker stop ${img_name}
  docker container rm ${img_name}
  docker image rm ${img_name}
  docker build -t ${img_name} .
}

pack() {
  docker save -o ${packed_name} ${img_name}
}

upload() {
  echo start scp &&
  scp ${packed_name} $1 &&
  echo finised scp &&
  rm ${packed_name} &&
  echo removed img file
}

case "$1" in
"local")
  buildApp && 
    dockerRebuild
  ;;
"stage")
  buildApp && 
    dockerRebuild && 
    pack && 
    upload $2
  ;;
*)
  echo expected stage or local, but was $1
  exit 1
  ;;
esac
