#!/bin/bash

# 获取当前时间戳
timestamp() {
  date +"%Y-%m-%d %H:%M:%S"
}

# 检查是否存在正在运行的 Cypress 命令
if ! pgrep -f "cypress run --spec cypress/e2e/orbit/iter.cy.js"; then
    echo "Cypress 命令未在运行，启动命令..."
	echo "$(timestamp): 开始执行 Cypress 测试"
    npx cypress run --spec cypress/e2e/orbit/iter.cy.js
else
    echo "Cypress 命令已在运行。"
fi

