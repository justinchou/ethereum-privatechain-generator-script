#!/bin/bash

DATADIR=datastore
ACCOUNT=account
PASSFILE=account.password


if [ ! -d ${ACCOUNT} ]; then
  mkdir -p ${ACCOUNT}/private
fi
if [ ! -d ${DATADIR} ]; then
  mkdir -p ${DATADIR}/logs
fi


## create init accounts if none exists.
AccList=`ls ${ACCOUNT}/account*.key | wc -l`
if [ ${AccList} -lt 5 ]; then
  Name=account${RANDOM}.key
  geth --datadir=${DATADIR} --password ${PASSFILE} account new > ${ACCOUNT}/${Name}
  sleep 3
  cp -r ${DATADIR}/keystore/UTC-* ${ACCOUNT}/private/
  echo "generate new key ${Name}"
fi

## add generate account into genesis.json
PrivKey=`cat ${ACCOUNT}/account*.key | cut -d{ -f 2 | cut -d\} -f1`
# for pk in ${PrivKey[@]}; do
#   echo ${pk}
# done
echo ${PrivKey}
node init.js ${PrivKey}

rm -rf ${DATADIR}/geth/* ${DATADIR}/keystore/*
cp -f ${ACCOUNT}/private/UTC-* ${DATADIR}/keystore/ 

geth init genesis.json --datadir ${DATADIR}

