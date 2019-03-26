Vagrant::Config.run do |config|
  config.vm.box = "ubuntu/trusty64"
  config.vm.forward_port 80, 3080
end
Vagrant.configure(2) do |config|
  config.ssh.insert_key = false
end
