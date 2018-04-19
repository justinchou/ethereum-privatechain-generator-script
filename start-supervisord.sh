#!/bin/bash

supervisord -c supervisord.conf
ps -ef | grep supervisord | egrep -v 'grep|start' 
sleep 3
ps -ef | grep geth | egrep -v 'grep'
