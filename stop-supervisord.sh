#!/bin/bash

ps -ef | grep supervisord | egrep -v 'grep|stop' | awk '{print $2}' | xargs kill -9 
ps -ef | grep supervisord | egrep -v 'grep|stop'  

