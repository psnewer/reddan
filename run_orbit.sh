#!/bin/bash

# 获取当前时间戳
timestamp() {
  date +"%Y-%m-%d %H:%M:%S"
}

check_command() {
    pgrep -f "node iter.js" > /dev/null
    return $?
}

check_crash() {
    grep -qi "Error" ./iter.log > /dev/null
    return $?
}

# 检查是否存在正在运行的 Cypress 命令
if ! check_command; then
	echo "$(timestamp): Playwright 命令未在运行，启动命令..."
    rm -f iter.log
    touch iter.log
    node iter.js > iter.log 2>&1
fi

if check_crash; then
    echo "$(timestamp): 检测到异常状态，尝试杀死进程"
    pkill -f "node iter.js"
fi

