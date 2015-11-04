module.exports = {

  groupByDay : (array, returnCountAsArray = true, field = 'createdAt') => {
    let days = {};
    let group = (value, index, array) => {
      let day = new Date(value[field]);
      day = Math.floor(day.getTime() / (1000 * 60 * 60 * 24));
      days[day] = days[day] || 0;
      days[day] = days[day] + 1;
    }

    array.map(group);

    if (returnCountAsArray) {
      let result = Object.keys(days).map((key) => { return days[key] });
      if (result.length < 3) {
        result.unshift(0);
        result.push(0);
      }

      return result;
    }

    return days;
  }

};