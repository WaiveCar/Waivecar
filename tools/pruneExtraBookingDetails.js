const mysql = require('mysql');
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'waivecar',
  password: 'eNwlGGl6g6V0w0qX3vx0S5GKbGvTtR3X',
  database: 'waivecar_development',
});

connection.connect();

function query(connection, query) {
  return new Promise((resolve, reject) => {
    connection.query(query, (error, results) => {
      if (error) {
        throw error;
      }
      resolve(results);
    });
  });
}

async function pruneExtras() {
  let rows = await query(
    connection,
    'select * from (select count(*) as b , booking_id,type from booking_details join bookings on booking_details.booking_id = bookings.id group by booking_id,type) as m where b > 1 order by booking_id asc;',
  );
  let purging = [];
  for (let row of rows) {
    let result = await query(
      connection,
      `select * from booking_details where booking_id=${
        row.booking_id
      } and type="${row.type}"`,
    );

    let noAddress = result.filter(item => item.address === null);
    let withAddress = result.filter(item => item.address !== null);
    let toPrune;
    if (result.length === noAddress.length) {
      // This happens if none of the details have addresses
      toPrune = result.slice(1);
    } else if (result.length === withAddress.length) {
      // This happens if all the details have addresses
      toPrune = result.slice(1);
    } else {
      // This happens if some of the details have addresses
      let temp = result.filter(item => item.address !== null);
      let toKeep = temp[0];
      toPrune = result.filter(item => item.id !== toKeep.id);
    }
    toPrune.forEach(item => purging.push(item.id)); 
  }
  console.log(`Items to be removed: ${purging}`);
  for (let i = 0; i < purging.length; i++) {
    let deleted = await query(connection, `delete from booking_details where id=${purging[i]}`);
    console.log(`Row deleted where id=${purging[i]}`);
  }
  connection.end();
}

pruneExtras();
