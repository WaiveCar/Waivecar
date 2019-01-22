## Installation

You need nvm in order to run this. 

    $ curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | bash 
    # Follow the instructions and put the lines into ~/.profile and start a new terminal

    $ nvm install v8.11.3
    $ sudo mkdir /var/log/outgoing /var/log/invers
    $ sudo chmod 0777 /var/log/outgoing /var/log/invers
    $ sudo apt install mysql-server redis-server git nginx
     
    $ mysql -uroot
    > create database waivecar_development
    > create user 'waivecar'@'%' identified by 'eNwlGGl6g6V0w0qX3vx0S5GKbGvTtR3X';
    > grant all on *.* to 'waivecar'@'%';
    $ mysql -uroot waivecar_development < (backup file)

    # Add 127.0.0.1 datastore to /etc/hosts 
    $ echo 127.0.0.1 datastore |& sudo tee -a /etc/hosts
    $ sudo cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup
    $ sudo cp nginx.conf /etc/nginx
    $ sudo service nginx restart

## Running

There's 2 (yes 2) processes that need to run, I usually use tmux but you can use whatever you want

    $ ./run.sh
    $ ./run-socket.sh ( not *really* required but things are _less_ broken with this)

## Notes:

Ending a booking: end@`modules/waivecar/lib/booking-service.js`

Active booking loop: modules/waivecar/bootstrap/schedules/active-booking.js

For raw sql queries use `Bento.provider('sequelize')` as found in places like `api/modules/shop/lib/customer-service.js`.

## Booking history notes

This may need to be redone eventually ... there's a few issues with this model (as of this writing no tickets ... they are mostly race condition based).


Anyway, getting all the booking start and end times is done through something like:

    select * from booking_details where booking_id in (
      select id from bookings where 
        car_id='59000018940C5501' and 
        status in ('completed', 'closed', 'ended') and 
        created_at > '2017-01-10';
      )
    );

Of course update it to your needs.

### CSV notes

Although this is profusely documented elsewhere, I'm doing it again:


    INTO OUTFILE '/var/lib/mysql-files/somename.csv' FIELDS TERMINATED BY ',' LINES TERMINATED BY '\n';


### Sequelize notes

#### delete/destroy/remove

What CT left behind is the following pattern:

 * retrieve the record you want to delete
 * call record.delete() on it

This is a soft delete ... Of course the immediate problem with this is that soft deletes should be *just an option*. So a second method was introduced that
is a pass-thru of the actual method with `{force: true}` being set to avoid the notion of a soft-delete. The function signature follows the Sequelize 
documentation in the form of `model.destroy({where: ... })` and is just a pass-thru

### About the load-balancing:

Be weary of things like `scheduler.process` ... two reasons:

  * If a process crashes, I don't believe these ever actually happen.
  * If they are running independently, it could be possible that it's doing two things at once.

### View Import/Export

Views reside in a mongo database in a View collection.

To import existing views in to your database:

```sh
mongoimport --db waivecar_local --collection views --upsert --file ./fixtures/views.json
```

To update the export with what you have locally:

```sh
mongoexport --db waivecar_local --collection views --out ./fixtures/views.json
```
