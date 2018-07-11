Vagrant::Config.run do |config|
  config.vm.box = "ubuntu/trusty64"
  config.vm.forward_port 3000, 3000
  config.vm.forward_port 5000, 5000
  config.vm.forward_port 9229, 9229
  config.vm.forward_port 8080, 18080
  config.vm.forward_port 80, 3080
end
Vagrant.configure(2) do |config|
  config.ssh.insert_key = false
end
