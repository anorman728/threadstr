#!/bin/bash

# Be sure to run this with root permissions.

# This is designed for Ubuntu, but it should work for any debian-based distro.

# Make sure that user has superuser privileges.
    
    if [[ $(id -u) -ne 0 ]] ; then 
        echo "This script must be run as root."
        exit 1
    fi

# Install nodejs.

    curl -sL https://deb.nodesource.com/setup_6.x | sudo bash -
    apt-get update
    apt-get install -y nodejs build-essential

    # npm install mysql bcrypt-nodejs prompt express client-sessions body-parser nodemailer

        # Keeping this here for reference, but no longer installing package
        # during Threadstr installation-- Versioning them instead.
        # Installing npm packages during installation caused unpredictability,
        # because the package installed may not be the same version as used by
        # Threadstr during development.

        # TODO: Actually record the packages that are used the way that they're
        # supposed to be recorded in Node.js projects.

# Wipe previous config if it exists, and recreate new one.

    node ./setup\ scripts/recreateConfig.js

# Ask user if want to store password on server, then setup MySQL.

    node ./setup\ scripts/addDatabasePassword.js
    bash ./setup\ scripts/setupMysql.sh

# Ask user to input nodemailer config data.
    
    node ./setup\ scripts/addNodemailerPassword.js
