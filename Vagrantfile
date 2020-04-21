Vagrant::Config.run do |config|
  config.vm.box = "ubuntu/bionic64"
  config.vm.forward_port 5000, 5000
  config.vm.forward_port 80, 3080
end
Vagrant.configure(2) do |config|
  config.ssh.insert_key = false
end
