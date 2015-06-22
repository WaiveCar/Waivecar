# -*- mode: ruby -*-
# vi: set ft=ruby :

# How to use:
# http://q.clevertech.biz/articles/vagrant-virtualbox-ansible

Vagrant.require_version '>= 1.5.1'

VAGRANTFILE_API_VERSION = "2"

# Set the Ansible configuration environment variable
ENV['ANSIBLE_CONFIG'] = "deployment/ansible/ansible.cfg"

# app name, deducted from current folder name or can be set manually
$app_name = File.basename(Dir.getwd)
#$app_name = "projectname"

# branching model, can be web, api_app, no_deploy
$branching_model = "web"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|

 config.vm.define "clevertech-" + $app_name do |vm_config|

  vm_config.vm.box = "ubuntu/trusty64"
  vm_config.vm.box_url = "https://oss-binaries.phusionpassenger.com/vagrant/boxes/latest/ubuntu-14.04-amd64-vbox.box"
  vm_config.vm.host_name = "clevertech-" + $app_name

  vm_config.vm.network :private_network, type: "dhcp"
  # forward local 8080 port to guest's 80
  vm_config.vm.network "forwarded_port", guest: 80, host: 8080
  # forward rtail port
  vm_config.vm.network "forwarded_port", guest: 10000, host: 10000

  # 1 CPU + 1G RAM
  vm_config.vm.provider :virtualbox do |vb|

    vb.name = "clevertech-" + $app_name
    vb.gui = true
    vb.customize ["modifyvm", :id, "--memory", 1024]
    vb.customize ["modifyvm", :id, "--cpus", "1"]
    vb.customize ['modifyvm', :id, '--natdnshostresolver1', 'on']
    vb.customize ['modifyvm', :id, '--natdnsproxy1', 'on']

  end

  config.vm.synced_folder ".", "/mnt/source"

  # provision server with Ansible
  vm_config.vm.provision :ansible do |ansible|

    ansible.groups = {

      "vagrant" => ["clevertech-" + $app_name],
      "vagrant:vars" => { "env" => "dev", "branching_model" => $branching_model, "name" => $app_name },

    }

    ansible.verbose = "vv"
    ansible.playbook = "deployment/ansible/main.yml"
    ansible.host_key_checking = false

  end

 end

 config.push.define "local-exec" do |push|
 
   push.inline = <<-SCRIPT
    vagrant ssh -c "sudo rsync -avr --delete-after --exclude \".git\" --exclude \".vagrant\" --exclude \"node_modules\" /mnt/source/ /opt/$1/"
    vagrant ssh -c "sudo chown -R vagrant:vagrant /opt"
    vagrant ssh -c "sudo npm i npm@next -g"
    vagrant ssh -c "cd /opt/$1 && deployment/build/scripts/commit_dependencies --fast && deployment/build/scripts/commit_build"
    vagrant ssh -c "sudo chown -R travis:travis /opt"
    vagrant ssh -c "sudo /etc/init.d/node-$1 restart"
   SCRIPT

   push.args = $app_name

 end

end
