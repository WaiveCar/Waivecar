Vagrant::Config.run do |config|
  config.vm.box = "ubuntu/trusty64"
  config.vm.forward_port 3000, 3000
  config.vm.forward_port 5000, 5000
  config.vm.forward_port 8080, 3080
  config.vm.box_url = "http://files.vagrantup.com/precise64.box"
end
