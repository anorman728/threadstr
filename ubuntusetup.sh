#!/bin/bash

# Be sure to run this with root permissions.

# This is designed for Ubuntu, but it should work for any debian-based distro.

# Make sure that user has superuser privileges.
    
    if [[ $(id -u) -ne 0 ]] ; then 
        echo "This script must be run as root."
        exit 1
    fi

# Install nodejs and nodejs packages.

    curl -sL https://deb.nodesource.com/setup_4.x | sudo bash -
    apt-get update
    apt-get install -y nodejs build-essential

    npm install mysql bscript prompt express client-sessions body-parser nodemailer

# Wipe previous config if it exists.

    node ./setup\ scripts/recreateConfig.js

# Ask user if want to store password on server, then setup MySQL.

    node ./setup\ scripts/addDatabasePassword.js
    bash ./setup\ scripts/setupMysql.sh

# Ask user to input nodemailer config data.
    
    node ./setup\ scripts/addNodemailerPassword.js
