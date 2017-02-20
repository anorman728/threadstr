# -*- mode: ruby -*-
# vi: set ft=ruby :

# Note for Threadstr:
# Not a lot of configuration has been done on this Vagrantfile, so you'll need to
# run ubuntusetup.sh every time you create a new machine.  Will be easier to just
# halt the machine instead of destroying it, unless you specifically want to start
# again from the beginning.

# All Vagrant configuration is done below. The "2" in Vagrant.configure
# configures the configuration version (we support older styles for
# backwards compatibility). Please don't change it unless you know what
# you're doing.

Vagrant.configure("2") do |config|
  config.vm.box = "bento/ubuntu-16.04"
  config.vm.network "private_network", ip: "192.168.33.10"
end
