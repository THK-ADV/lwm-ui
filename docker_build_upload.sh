#!/bin/sh

echoerr() { echo "$@" 1>&2; }

build() {
  img_name=$1
  packed_name=$2

  ng build --prod

  if [ $? -eq 0 ]; then
    docker stop ${img_name}
    docker container rm ${img_name}
    docker image rm ${img_name}
    docker build -t ${img_name} .

    if [ $? -eq 0 ]; then
      rm ${packed_name} > /dev/null 2>&1 &
      docker save -o ${packed_name} ${img_name}
      # if [ $? -eq 0 ]; then
      #   docker run -p 9001:80 -d --name ${img_name} ${img_name}
      #  if [ $? -eq 0 ]; then
      #    echo ${img_name} is running
      #  else
      #    echoerr docker run failed
      #  fi
     # else
     #   echoerr docker run failed
     #  fi
    else
      echoerr docker build failed
    fi
  # else
  #   echoerr ng build failed
  fi
}

upload() {
  img_name=$1
  packed_name=$2

  echo start scp &&
  scp ${packed_name} dobrynin@advm1.gm.fh-koeln.de:/home/dobrynin &&
  echo finised scp &&
  rm ${packed_name} &&
  echo removed img file
}

img_name=lwm-frontend
packed_name=dist/${img_name}.tar

build ${img_name} ${packed_name} &&
upload ${img_name} ${packed_name}
