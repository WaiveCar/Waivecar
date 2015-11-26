###

add an ENV Variable to the VM's exposed Docker location
export DOCKER_HOST=tcp://192.168.10.10:2375

### Vagrant
`Vagrantfile` should be used to create a VM.

Important settings include:
- the IP for the network
```
  config.vm.network 'private_network', ip: '192.168.10.10'
```
- Ram/Core settings:
```
  config.vm.provider "virtualbox" do |vb|
    vb.memory = 4096
    vb.cpus = 2
  end
```
- rsync sync and exclude folders:
```
  config.vm.synced_folder
```




To start VM run the following:

1. `vagrant up`
2. `vagrant rsync-auto`

To stop:

1. `vagrant halt`

### Docker

TO configure Docker we use Docker Compost and Dockerfiles. The intent is to run the following containers:

1. API - http server
2. API - socker server
3. Web
4. Mongo
5. Redis
6. MySQL

`docker-compose.yml` file must be placed at the project root so that it can find the relevant `Dockerfile`s.

e.g.
/waiveecar/docker-compose.yml
/waivecar/api/Dockerfile
/waivecar/web/Dockerfile

To run, from the root, execute:

1. `docker-compose up`


### API Configuration:

Docker uses Environment Variables to add support for runtime set dynamic port/ip addresses for containers. As such, your local.js configuration files should be set up to support these:

1. Mongo

```
  mongo : {
    host     : process.env.MONGO_1_PORT_27017_TCP_ADDR,
    port     : process.env.MONGO_1_PORT_27017_TCP_PORT,
    database : 'waivecar_local'
  }
```

2. Redis

```
  redis  : {
    host : process.env.REDIS_1_PORT_6379_TCP_ADDR,
    port : process.env.REDIS_1_PORT_6379_TCP_PORT
  }
```

3. SQL

```
  sequelize : {
    host     : process.env.MYSQL_1_PORT_3306_TCP_ADDR,
    database : 'waivecar_local',
    username : 'root',
    password : 'password'
  }
```
