#!/bin/bash

git pull origin main
npm ci
pm2 restart all
