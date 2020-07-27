module.exports = {
  api : {
    port : 3000,
    uri  : 'http://localhost:3000'
  },
  socket : {
    api : {
      url   : 'http://localhost:3000',
      me    : '/users/me',
      roles : '/roles'
    }
  },
  web : {
    uri : 'https://waivecar-dev.cleverbuild.biz'
  },
  redis : {
    host : 'waivecar-development.xvq4ay.ng.0001.use2.cache.amazonaws.com',
    port : 6379
  },
  users : [
    {
      firstName     : 'Steven',
      lastName      : 'White',
      email         : 'steven@clevertech.biz',
      password      : 'foobar',
      role          : 'Super User', // Super
      verifiedEmail : true,
      status        : 'active'
    },
    {
      firstName     : 'Gabriel',
      lastName      : 'Schroder',
      email         : 'gabriel.schroder@clevertech.biz',
      password      : 'dudebruh',
      role          : 'Super User', // Super
      verifiedEmail : true,
      status        : 'active'
    },
    {
      firstName     : 'Zoli',
      lastName      : 'Honig',
      email         : 'zoli@waive.car',
      password      : 'password',
      role          : 'Owner', // Owner
      verifiedEmail : true,
      status        : 'active'
    },
    {
      firstName     : 'Issac',
      lastName      : 'Deutsch',
      email         : 'ideutsch@waive.car',
      password      : 'password',
      role          : 'Owner', // Owner
      verifiedEmail : true,
      status        : 'active'
    },
    {
      firstName     : 'Roy',
      lastName      : 'Ryman',
      email         : 'roy@waive.car',
      password      : 'password',
      role          : 'Administrator', // Admin
      verifiedEmail : true,
      status        : 'active'
    },
    {
      firstName     : 'Generic',
      lastName      : 'User',
      email         : 'demo@example.com',
      password      : 'lollipop0',
      role          : 'User', // User
      verifiedEmail : true,
      verifiedPhone : true,
      status        : 'active'
    },
    {
      firstName     : 'Sergio',
      lastName      : 'Vides',
      email         : 'sergio.g.vides@gmail.com',
      phone         : '+13107407461',
      password      : 'password',
      role          : 'Administrator',
      verifiedEmail : true,
      verifiedPhone : true,
      status        : 'active'
    },
    {
      firstName     : 'Naceur',
      lastName      : 'Garouachi',
      email         : 'naceur.garouachi@gmail.com',
      phone         : '+13103672199',
      password      : 'password',
      role          : 'Administrator',
      verifiedEmail : true,
      verifiedPhone : true,
      status        : 'active'
    },
    {
      firstName     : 'Rafael',
      lastName      : 'Moreno',
      email         : 'danimoreno1194@gmail.com',
      phone         : '+13108906097',
      password      : 'password',
      role          : 'Administrator',
      verifiedEmail : true,
      verifiedPhone : true,
      status        : 'active'
    },
    {
      firstName     : 'Artist',
      lastName      : 'Patton III',
      email         : 'artistpatton@gmail.com',
      phone         : '+14242646717',
      password      : 'password',
      role          : 'Administrator',
      verifiedEmail : true,
      verifiedPhone : true,
      status        : 'active'
    },
    {
      firstName     : 'Robert',
      lastName      : 'Brown Jr.',
      email         : 'brownrr13@yahoo.com',
      phone         : '+13233092089',
      password      : 'password',
      role          : 'Administrator',
      verifiedEmail : true,
      verifiedPhone : true,
      status        : 'active'
    },
    {
      firstName     : 'Tonia',
      lastName      : 'Sample',
      email         : 'tesample@aol.com',
      phone         : '+16264821211',
      password      : 'password',
      role          : 'Administrator',
      verifiedEmail : true,
      verifiedPhone : true,
      status        : 'active'
    },
    {
      firstName     : 'Ronnie',
      lastName      : 'Calton',
      email         : 'taroncample@yahoo.com',
      phone         : '+16266440360',
      password      : 'password',
      role          : 'Administrator',
      verifiedEmail : true,
      verifiedPhone : true,
      status        : 'active'
    },
    {
      firstName     : 'Lonnie',
      lastName      : 'Calton',
      email         : 'lonniecalton82@gmail.com',
      phone         : '+17606381822',
      password      : 'password',
      role          : 'Administrator',
      verifiedEmail : true,
      verifiedPhone : true,
      status        : 'active'
    }
  ]
};
