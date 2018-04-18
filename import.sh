#!/bin/bash

KEY=$1

if [ "${KEY}" == "" ]; then
  echo 'invalid key ${KEY}'
  exit
fi

PRIV_PATH=private

if [ ! -d ${PRIV_PATH} ]; then
  mkdir -p ${PRIV_PATH}
fi

Rand=${RANDOM}
FILENAME=private${Rand}.key
ACCOUNT=account${Rand}.key
echo ${KEY} >> ${PRIV_PATH}/${FILENAME}

geth account import ${PRIV_PATH}/${FILENAME} --datadir ./datastore #> account/${ACCOUNT}
