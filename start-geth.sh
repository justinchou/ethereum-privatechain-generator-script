#!/bin/bash

NETWORKID=1224
PORT=30303
RPCPORT=8545
PPROFPORT=6060
RPCAPI="admin,debug,eth,miner,net,personal,rpc,txpool,web3"

NODENAME='privatechainnode'
NODEPASS='thisisprivatekeyforgethstatus'
STATSERVER='localhost:3000'
ETHSTATS="${NODENAME}:${NODEPASS}@${STATSERVER}"

RPC_CORS_DOMAIN="http://localhost:8000"

DATADIR=./datastore
PASSFILE=account.password

SCRIPT="--datadir ${DATADIR} --password ${PASSFILE} --port ${PORT} --rpc --rpcaddr "0.0.0.0" -rpcapi "${RPCAPI}" --rpcport ${RPCPORT} --networkid ${NETWORKID} --lightkdf --nodiscover --maxpeers 0 --verbosity 6 --pprof --pprofport ${PPROFPORT}"
ARGVS="$@ > ./${DATADIR}/logs/geth.log 2>&1 &"

GETH=/usr/bin/geth
if [ ! -f ${GETH} ]; then
GETH=./geth
fi
if [ ! -f ${GETH} ]; then
GETH=geth
fi

echo ${GETH} ${SCRIPT} --mine --minerthreads 1 --ethstats="${ETHSTATS}" --rpccorsdomain=${RPC_CORS_DOMAIN} ${ARGVS}
${GETH} ${SCRIPT} --mine --minerthreads 1 --ethstats="${ETHSTATS}" --rpccorsdomain=${RPC_CORS_DOMAIN} ${ARGVS}

#echo ${GETH} ${SCRIPT} --ethstats="${ETHSTATS}" --rpccorsdomain=${RPC_CORS_DOMAIN} ${ARGVS}
#${GETH} ${SCRIPT} --ethstats="${ETHSTATS}" --rpccorsdomain=${RPC_CORS_DOMAIN} ${ARGVS}

