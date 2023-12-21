const mysql = require('mysql');
const path = require('path');

// Connection Pool
let connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

exports.get_home = (req, res) => {
  const absolutePath  = path.resolve(__dirname, '../../pawhacks1.0/index.html');
  res.sendFile(absolutePath);
}

exports.post_home = (req, res) => {
  const absolutePath = path.resolve(__dirname, '../../pawhacks1.0/index.html');
  res.sendFile(absolutePath);
}

exports.get_register = (req, res) => {
  const absolutePath = path.resolve(__dirname, '../../pawhacks1.0/register.html');
  res.sendFile(absolutePath);
}

exports.post_register = (req, res) => {
  const { first_name, last_name, email, username, password, phone_number, university } = req.body;

  // Break the query into multiple lines for better readability
  let query = `
    INSERT INTO users
    SET 
      first_name = ?, 
      last_name = ?, 
      email = ?, 
      username = ?, 
      password_hash = ?, 
      phone_number = ?, 
      university = ?
  `;

  // Execute the query
  connection.query(query, [first_name, last_name, email, username, password, phone_number, university], (err, rows) => {
    if (!err) {
      res.render('home', { rows });
    } else {
      console.log(err);
    }
    console.log('The data from user table: \n', rows);
  });
};

exports.view_application = (req, res) => {
  if (req.isAuthenticated()) {
      // User is authenticated, render the application page
      res.render('application'); 
  } else {
      // User is not authenticated, redirect to the login page
      res.redirect('/login');
  }
}

exports.submit_application = (req, res) => { 
  const { university, phone_number } = req.body; 
  console.log(university, phone_number)

  if(req.isAuthenticated()) { 
    const google_id = req.user.google_id; // Assuming the user ID is stored in req.user.id
    console.log(google_id)
    let query = ` 
      UPDATE users 
      SET 
        university = ?, 
        phone_number = ? 
      WHERE google_id = ?
    `;

    connection.query(query, [university, phone_number, google_id], (err, result) => { 
      if (err) {
        // Handle the error, maybe log it and send a response to the client
        console.error("Error updating user data: ", err);
        res.status(500).send('Error updating your information');
      } else {
        // Handle a successful update, maybe send a success message to the client
        console.log("User data updated successfully");
        res.send('Information updated successfully');
      }
    });
  } else {
    // User is not authenticated
    res.status(401).send('You need to log in to submit this form');
  }
}



// // View Users
// exports.view = (req, res) => {
//   // User the connection
//   connection.query('SELECT * FROM user WHERE status = "active"', (err, rows) => {
//     // When done with the connection, release it
//     if (!err) {
//       let removedUser = req.query.removed;
//       res.render('home', { rows, removedUser });
//     } else {
//       console.log(err);
//     }
//     console.log('The data from user table: \n', rows);
//   });
// }

// // Find User by Search
// exports.find = (req, res) => {
//   let searchTerm = req.body.search;
//   // User the connection
//   connection.query('SELECT * FROM user WHERE first_name LIKE ? OR last_name LIKE ?', ['%' + searchTerm + '%', '%' + searchTerm + '%'], (err, rows) => {
//     if (!err) {
//       res.render('home', { rows });
//     } else {
//       console.log(err);
//     }
//     console.log('The data from user table: \n', rows);
//   });
// }

// exports.form = (req, res) => {
//   res.render('add-user');
// }

// // Add new user
// exports.create = (req, res) => {
//   const { first_name, last_name, email, phone, comments } = req.body;
//   let searchTerm = req.body.search;

//   // User the connection
//   connection.query('INSERT INTO user SET first_name = ?, last_name = ?, email = ?, phone = ?, comments = ?', [first_name, last_name, email, phone, comments], (err, rows) => {
//     if (!err) {
//       res.render('add-user', { alert: 'User added successfully.' });
//     } else {
//       console.log(err);
//     }
//     console.log('The data from user table: \n', rows);
//   });
// }


// // Edit user
// exports.edit = (req, res) => {
//   // User the connection
//   connection.query('SELECT * FROM user WHERE id = ?', [req.params.id], (err, rows) => {
//     if (!err) {
//       res.render('edit-user', { rows });
//     } else {
//       console.log(err);
//     }
//     console.log('The data from user table: \n', rows);
//   });
// }


// // Update User
// exports.update = (req, res) => {
//   const { first_name, last_name, email, phone, comments } = req.body;
//   // User the connection
//   connection.query('UPDATE user SET first_name = ?, last_name = ?, email = ?, phone = ?, comments = ? WHERE id = ?', [first_name, last_name, email, phone, comments, req.params.id], (err, rows) => {

//     if (!err) {
//       // User the connection
//       connection.query('SELECT * FROM user WHERE id = ?', [req.params.id], (err, rows) => {
//         // When done with the connection, release it
        
//         if (!err) {
//           res.render('edit-user', { rows, alert: `${first_name} has been updated.` });
//         } else {
//           console.log(err);
//         }
//         console.log('The data from user table: \n', rows);
//       });
//     } else {
//       console.log(err);
//     }
//     console.log('The data from user table: \n', rows);
//   });
// }

// // Delete User
// exports.delete = (req, res) => {

//   // Delete a record

//   // User the connection
//   // connection.query('DELETE FROM user WHERE id = ?', [req.params.id], (err, rows) => {

//   //   if(!err) {
//   //     res.redirect('/');
//   //   } else {
//   //     console.log(err);
//   //   }
//   //   console.log('The data from user table: \n', rows);

//   // });

//   // Hide a record

//   connection.query('UPDATE user SET status = ? WHERE id = ?', ['removed', req.params.id], (err, rows) => {
//     if (!err) {
//       let removedUser = encodeURIComponent('User successeflly removed.');
//       res.redirect('/?removed=' + removedUser);
//     } else {
//       console.log(err);
//     }
//     console.log('The data from beer table are: \n', rows);
//   });

// }

// // View Users
// exports.viewall = (req, res) => {

//   // User the connection
//   connection.query('SELECT * FROM user WHERE id = ?', [req.params.id], (err, rows) => {
//     if (!err) {
//       res.render('view-user', { rows });
//     } else {
//       console.log(err);
//     }
//     console.log('The data from user table: \n', rows);
//   });

// }