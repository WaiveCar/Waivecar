Cleverbuild Internals
============

Please read first the README.md in the project root.

If you are really interested in Cleverbuild internals:

In order to setup a project, you have to (in this order):
* Setup EC2 servers [Ansible AWS server creation script](ansible/README.md)
* Setup build and deploy with [Travis scripts](build/README.md)
* Setup the node application [init scripts](init/README.md)
* Setup server configuration using [Ansible server prepare scripts](ansible/README.md)
* Setup backups using [backup role](ansible/roles/backup/README.md)
