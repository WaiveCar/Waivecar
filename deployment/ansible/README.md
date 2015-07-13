Ansible script for new AWS server creation and basic prepare
=================

### Preprequisite
* **You should have an account on mainconn server, server creation script can be started only from there**
* Setup AWS variables:
  * `export AWS_ACCESS_KEY_ID='YOUR_AWS_API_KEY'`
  * `export AWS_SECRET_ACCESS_KEY='YOUR_AWS_API_SECRET_KEY'`

### Server creation procedure
* `ssh-keygen -t rsa -C "ClientName" -f ~/.ssh/ClientName` (leave an empty passphrase, if possible, 'ClientName' should be the same as in CleverBoard)
* `cd deployment/ansible`
* `cp create_aws_server.yml server-$env.yml` (for example, `server-dev.yml`
* `edit server-$env.yml` (update variables)
* `ansible-playbook -v -i ansible.cfg --private-key=~/.ssh/ClientName server-$env.yml`

### What does server creation script
* Setup EC2 keypair
* Uploads private key which you generated to S3
* Create security group
* Launch instance
* Tag instance (Client tag)
* Allocate new IP and associate it with new instance
* Create DNS record ($projectname-$env.clevertech.biz)
* Create a new security group for Zabbix (should be assigned manually to Zabbix server, no way to do it from Ansible for now)
* Add hostname to `/etc/hosts` (vpn routes are generated from this file)
* Setup hostname on new server (clientname-$env)
* Add additional apt repos and perform system upgrade
* Reboot server

Ansible scripts for server configuration
=================

Every change to server configuration should be obtained by modifying these script and running them.

Information on how to run the script for the first time can be found in the main Cleverbuild README.md.

### Further executions
* Pull the last version of the script from `development` branch: `git checkout development; git pull`
* Edit the scripts
* Execute: `ansible-playbook -i inventory --private-key $PATH_TO_SERVER_PEM$  main.yml`
* Commit and push your changes to the repository

### Create nginx htpasswd file for rtail
In order to allow only authorized users to watch rtail logs, you need to create nginx auth file in `/opt/rtail_htpasswd`. The following command would create the file and also add the user and an encrypted password to it.

```sudo htpasswd -c /opt/rtail_htpasswd rtail```

The tool will prompt you for a password.

```
New password:
Re-type new password:
Adding password for user rtail
```

The structure of the htpasswd file would be like this:

rtail:encryptedpasswordhere

Note that this htpasswd should be accessible by the user-account that is running Nginx.

