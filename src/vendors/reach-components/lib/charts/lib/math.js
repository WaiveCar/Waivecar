export default {

  groupByDay : (array, returnCountAsArray = true, field = 'createdAt') => {
    let days = {};
    let group = (value, index, array) => {
      let day = new Date(value[field]);
      day = Math.floor(day.getTime() / (1000 * 60 * 60 * 24));
      days[day] = days[day] || 1;
      days[day] = days[day] + 1;
    }

    array.map(group);

    if (returnCountAsArray) {
      return Object.keys(days).map(function (key) { return days[key] });
    }

    return days;
  }

};