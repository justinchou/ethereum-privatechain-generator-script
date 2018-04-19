#!/bin/bash

NETWORKID=1224
PORT=30303
RPCPORT=8545
PPROFPORT=6060
RPCAPI="admin,debug,eth,miner,net,personal,rpc,txpool,web3"

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

#${GETH} ${SCRIPT} --mine --minerthreads 1 ${ARGVS}
${GETH} ${SCRIPT} ${ARGVS}
