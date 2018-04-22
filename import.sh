#!/bin/bash

KEY=$1
if [ "${KEY}" == "" ]; then
  echo 'invalid key ${KEY}'
  exit 1
fi

EXAMPLE=d657c6e5a313bf0d493975ad283be013de06cb2d4beebaf9a27af807ec636962
if [ "${#KEY}" != "${#EXAMPLE}" ]; then
  echo "invalid key length ${#KEY} should ${#EXAMPLE}"
  exit 2
fi 

PRIV_PATH=private
if [ ! -d ${PRIV_PATH} ]; then
  mkdir -p ${PRIV_PATH}
fi

DATADIR=./datastore
if [ ! -d ${DATADIR} ]; then
  mkdir -p ${DATADIR}
fi

PASSFILE=account.password
PASSWD=""
if [ -f "${PASSFILE}" ]; then
  PASSWD="--password ./account.password"
fi

Rand=${RANDOM}
FILENAME=private${Rand}.key
ACCOUNT=account${Rand}.key

echo ${KEY} >> ${PRIV_PATH}/${FILENAME}
geth account import ${PRIV_PATH}/${FILENAME} --datadir ${DATADIR} ${PASSWD}
