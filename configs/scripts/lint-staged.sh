#!/bin/bash

yarn eslint --fix $(git diff --cached --diff-filter=d --name-only '*.ts*')
