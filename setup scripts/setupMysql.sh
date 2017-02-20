# Install MySQL

    apt-get install -y mysql-client mysql-server

# Secure installation of MySQL, if y is selected.

    echo "Do you want to do a secure installation of MySQL? (Y/n)"
    read ans
    if [ "$ans" != "n" ] ; then
        mysql_secure_installation
    fi

# Find current directory.

    DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Set up tables in MySQL

    echo "
Enter the same MySQL password you just created, or the MySQL password that
  already existed for the root user.
"
    mysql -uroot -p -e "source $DIR/setupmysqltables.sql"

