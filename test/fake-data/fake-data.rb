#!/usr/bin/env ruby

def fake_cars() 
  counter = 100
  cars = Array.new(300) { 
    long = rand(-118.5..-118.25)
    lat = rand(34.01..34.1)
    charge = rand(40..99)
    if rand < 0.4
      speed = 0
    else
      speed = rand(0..60)
    end
    [ '"%s"' % rand(2**32..2**33-1).to_s(16), '"WAIVE%d"' % (counter += 1), 'CURRENT_TIMESTAMP', 'CURRENT_TIMESTAMP', speed, speed, charge, long, lat, true] 
  }

  print "DELETE FROM cars where fake is true;\n";
  print "INSERT INTO cars (id, license, created_at, updated_at, current_speed, calculated_speed,charge, longitude, latitude, fake) VALUES "
  print "%s;" % cars.map { | row |
    '(%s)' % row.join(',')
  }.join(",\n")
end

def fake_users()
  first_name_list = File.readlines('first_names')
  surname_list = File.readlines('last_names')
  
  first_name_list = first_name_list.map { | name | name.strip.capitalize }
  surname_list = surname_list.map { | name | name.strip.capitalize }
  domain_list = ['yahoo.com', 'gmail.com', 'hotmail.com', 'aol.com', 'mail.com', 'outlook.com', 'office365.com']
  areacode_list = [ '310', '213', '818', '424', '661' ]
     
  print "DELETE FROM users where fake is true;\n";
  num=1000000
  fname=0
  lname=0

  0.upto(100) do
    users = []
    0.upto(600) do
      first_name = first_name_list[fname]
      last_name = surname_list[lname]
      fname = (fname + 1) % first_name_list.length
      lname = (lname + 1) % surname_list.length
      domain = domain_list[rand(domain_list.length)]
      year = rand(0..40) + 1955
      email = "#{first_name}.#{last_name}#{year}@#{domain}"
      active = rand < 0.78 ? 'active' : 'pending'
      phone = false
      phone_verified = false

      if active or rand < 0.3
        num +=1
        phone = "\"+1#{areacode_list[rand(areacode_list.length)]}#{num}\""
        phone_verified = rand < 0.8
      end

      users << [ '"%s"' % first_name, '"%s"' % last_name, '"%s"' % email, '"%s"' % active, phone || 'null', phone_verified, 'CURRENT_TIMESTAMP', 'CURRENT_TIMESTAMP', true ]
    end

    print "INSERT INTO users (first_name, last_name, email, status, phone, verified_phone, created_at, updated_at, fake) VALUES "
    print "%s;" % users.map { | row |
      '(%s)' % row.join(',')
    }.join(",\n")
  end
end

fake_cars
fake_users
