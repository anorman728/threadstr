# The setup in this file came from the tutorial on this site: https://mandrill.zendesk.com/hc/en-us/articles/205582187-How-to-Use-Postfix-to-Send-Email-with-Mandrill

# This is intended to be called from ubuntusetup.sh, but if you want to run it individually, be sure to run it as root.  (It will not verify like ubuntusetup.sh does.)

echo "

You will need to set up a mail server to send emails to users for things like
  verification.  Threadr is designed to work with a Mandrill server via Postfix.

"

echo "

When setup installs Postfix, you will need to do the following:
    
    1.) Select "Internet Site" as your server.
    2.) Enter your FQDN (either gmail.com or a custom Google App's domain name).

"

read -p "
Setup will now install Postfix and then request the information from you
  concerning the gmail account.  Press enter to continue.
"

# Install Postfix.

    apt-get install postfix mailutils libsasl2-2 ca-certificates libsasl2-modules

# Add relevant lines to main config file:
    echo "
relayhost = [smtp.gmail.com]:587
smtp_sasl_auth_enable = yes
smtp_sasl_password_maps = hash:/etc/postfix/sasl_passwd
smtp_sasl_security_options = noanonymous
smtp_tls_CAfile = /etc/ssl/certs/ca-certificates.crt
smtp_use_tls = yes
" >> /etc/postfix/main.cf

# Get username, domain, and password, but it into sasl_password.
    read -p "
Please enter the gmail username that you wish to use for this server:
" gmailUsername

    read -p "
Please enter the gmail domain that you wish to use (gmail.com if you're not
  using a custom domain).
" gmailDomain

    read -p "
Please enter the password to use with this gmail account.
" gmailPassword

    echo "
[smtp.gmail.com]:587    ${gmailUsername}@${gmailDomain}:${gmailPassword}
" >> /etc/postfix/sasl_passwd

# Fix permission and update postfix config to use sasl_passwd file.
    chmod 400 /etc/postfix/sasl_passwd
    postmap /etc/postfix/sasl_passwd


# Validate certificates to avoid running into error. 
    cat /etc/ssl/certs/Thawte_Premium_Server_CA.pem | sudo tee -a /etc/postfix/cacert.pem

# Reload Postfix.
    /etc/init.d/postfix reload
