module.exports = {
  waivecar: {
    car: {
      staleLimit: 30,
      sync: {
        value: 10,
        type: 'minutes',
      },
    },
    mock: {
      cars: false,
      homebase: true,
      stations: true,
      valets: false,
    },
    telem: {
      uri: 'http://127.0.0.1:2080',
    },
  },
};
