const mysql = require("mysql");
const path = require("path");
const fs = require("fs");

// Connection Pool
let connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

exports.get_home = (req, res) => {
  const absolutePath = path.resolve(__dirname, "../../pawhacks1.0/index.html");
  res.sendFile(absolutePath);
};

exports.post_home = (req, res) => {
  const absolutePath = path.resolve(__dirname, "../../pawhacks1.0/index.html");
  res.sendFile(absolutePath);
};

exports.view_login = (req, res) => {
  res.render("login", { NotUserAuthenticated: true });
};

exports.privacy_policy = (req, res) => {
  // Assuming privacy_policy.pdf is at the root of the project
  const absolutePath = path.resolve(__dirname, "../../privacy_policy.pdf");
  // Check if the file exists before attempting to send it
  fs.access(absolutePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error("Cannot find privacy_policy.pdf:", err);
      res.status(404).send("Privacy policy not found");
    } else {
      res.sendFile(absolutePath);
    }
  });
};

exports.send_email = (req, res) => {
  const { email } = req.body;
  if (email) {
    let query = `INSERT INTO emails (email) VALUES (?)`;
    connection.query(query, [email], (err, result) => {
      if (err) {
        // Sending a client-side script for the alert
        res.send(
          `<script>alert("Error inserting email into database"); window.location.href = "/";</script>`
        );
      } else {
        console.log("Email inserted successfully");
        // Sending a client-side script for the alert
        res.send(
          `<script>alert("Email inserted successfully"); window.location.href = "/";</script>`
        );
      }
    });
  } else {
    // Sending a client-side script for the alert
    res.send(
      `<script>alert("No email provided"); window.location.href = "/";</script>`
    );
  }
};

exports.view_create_team = (req, res) => {
  const google_id = req.user.google_id; // The logged-in user's Google ID

  // Query to find the team and the owner's Google ID where the user is a member
  const queryFindTeamAndOwner = `
    SELECT 
      t.team_id, 
      t.team_name, 
      t.created_by_google_id, 
      t.is_open, 
      tm.accepted_invitation,
      owner.full_name AS owner_full_name,
      owner.email AS owner_email
    FROM 
      team_members tm
    INNER JOIN 
      teams t ON tm.team_id = t.team_id
    LEFT JOIN 
      users owner ON t.created_by_google_id = owner.google_id
    WHERE 
      tm.member_google_id = ?
  `;
  connection.query(queryFindTeamAndOwner, [google_id], (err, teams) => {
    if (err) {
      res.send(
        `<script>alert("Error retrieving team and owner information"); window.history.back();</script>`
      );
    }

    const accepted_teams = teams.filter(
      (team) => team.accepted_invitation === "ACCEPTED"
    );
    const pending_teams = teams.filter(
      (team) => team.accepted_invitation === "PENDING"
    );

    // Check if the user is part of a team
    if (accepted_teams.length !== 0) {
      const team_id = accepted_teams[0].team_id; // Get the team ID
      const team_name = accepted_teams[0].team_name;
      const owner_google_id = accepted_teams[0].created_by_google_id; // Get the owner's Google ID
      const is_open = accepted_teams[0].is_open;

      // You now have the team ID and the owner's Google ID, and you can proceed
      // with your logic, for example, retrieving all team members' information.

      // Get the specific information of all the teammates from the users table
      const queryGetTeammates = `
          SELECT u.first_name, u.last_name, u.email, u.university, u.google_id, tm.accepted_invitation, tm.team_id
          FROM users u
          INNER JOIN team_members tm ON u.google_id = tm.member_google_id
          WHERE tm.team_id = ?
        `;

      connection.query(queryGetTeammates, [team_id], (err, teammates) => {
        if (err) {
          res.send(
            `<script>alert("Error retrieving team members information"); window.history.back();</script>`
          );
          // console.log(err);
          // return res
          //   .status(500)
          //   .send("Error retrieving team members information");
        }
        // Send the teammates' information to the client, including a flag indicating if the user is the owner
        res.render("create_team", {
          teammates: teammates,
          is_owner: google_id === owner_google_id,
          owner_google_id: owner_google_id,
          team_id: team_id,
          team_name: team_name,
          is_open: is_open === 1,
          has_team: true,
          google_id: google_id,
          pending_teams: pending_teams,
          has_pending_team: pending_teams.length > 0,
        });
      });
    } else {
      res.render("create_team", {
        has_team: false,
        message: "You are not part of any team.",
        pending_teams: pending_teams,
        has_pending_team: pending_teams.length > 0,
      });
    }
  });
};

exports.view_team_invitations = (req, res) => {
  const google_id = req.user.google_id; // The logged-in user's Google ID

  // Query to find the team and the owner's Google ID where the user is a member
  const queryFindTeamAndOwner = `
    SELECT 
      t.team_id, 
      t.team_name, 
      t.created_by_google_id, 
      t.is_open, 
      tm.accepted_invitation,
      owner.full_name AS owner_full_name,
      owner.email AS owner_email
    FROM 
      team_members tm
    INNER JOIN 
      teams t ON tm.team_id = t.team_id
    LEFT JOIN 
      users owner ON t.created_by_google_id = owner.google_id
    WHERE 
      tm.member_google_id = ?
  `;
  connection.query(queryFindTeamAndOwner, [google_id], (err, teams) => {
    if (err) {
      res.send(
        `<script>alert("Error retreiving team and owner information"); window.history.back();</script>`
      );
      // console.log(err);
      // return res
      //   .status(500)
      //   .send("Error retrieving team and owner information");
    }

    const pending_teams = teams.filter(
      (team) => team.accepted_invitation === "PENDING"
    );
    // Send the teammates' information to the client, including a flag indicating if the user is the owner
    res.render("team_invitations", {
      google_id: google_id,
      pending_teams: pending_teams,
      has_pending_team: pending_teams.length > 0,
    });
  });
};

exports.view_team_by_team_id = (req, res) => {
  const google_id = req.user.google_id; // The logged-in user's Google ID
  const team_id = req.params.team_id;

  // Get the specific information of all the teammates from the users table
  const queryGetTeammates = `
          SELECT u.first_name, u.last_name, u.email, u.university, u.google_id, tm.accepted_invitation, t.team_name, t.is_open, t.team_id, t.created_by_google_id
          FROM users u
          INNER JOIN team_members tm ON u.google_id = tm.member_google_id
          INNER JOIN teams t on tm.team_id = t.team_id
          WHERE tm.team_id = ?
        `;

  connection.query(queryGetTeammates, [team_id], (err, result) => {
    if (err) {
      // console.log(err);
      // return res.status(500).send("Error retrieving team members information");
    } else if (result[0].is_open === 1 == 0) {
      return res.send(
        `<script>alert("You cannot view a team that is not open unless you are a member of the team"); window.history.back();</script>`
      );
    }
    // Send the teammates' information to the client, including a flag indicating if the user is the owner
    res.render("view_team", {
      teammates: result,
      team_id: result[0].team_id,
      team_name: result[0].team_name,
      is_open: result[0].is_open === 1,
      google_id: google_id,
    });
  });
};

exports.view_open_teams = (req, res) => {
  const google_id = req.user.google_id; // The logged-in user's Google ID

  // Query to find the team and the owner's Google ID where the user is a member
  const queryFindTeamAndOwner = `
  SELECT 
  t.team_id, 
  t.team_name, 
  t.created_by_google_id, 
  t.is_open, 
  GROUP_CONCAT(DISTINCT tm.accepted_invitation) AS accepted_invitations,
  GROUP_CONCAT(DISTINCT owner.full_name) AS owner_full_names,
  GROUP_CONCAT(DISTINCT owner.email) AS owner_emails
FROM 
  team_members tm
INNER JOIN 
  teams t ON tm.team_id = t.team_id
LEFT JOIN 
  users owner ON t.created_by_google_id = owner.google_id
WHERE 
  t.is_open = 1
GROUP BY 
  t.team_id, t.team_name, t.created_by_google_id, t.is_open

  `;
  connection.query(queryFindTeamAndOwner, [1], (err, teams) => {
    if (err) {
      console.log(err);
      return res.send(
        `<script>alert("Error retreiving team and owner information"); window.history.back();</script>`
      );
    }
    // Send the teammates' information to the client, including a flag indicating if the user is the owner
    res.render("open_teams", {
      teams: teams,
    });
  });
};

exports.submit_create_team = (req, res) => {
  const google_id = req.user.google_id; // Assuming the user ID is stored in req.user.google_id
  const { team_name, is_open } = req.body;
  const is_open_boolean = is_open === "true" ? 1 : 0;

  // Check if the user already has a team
  const queryCheckTeam = `SELECT * FROM team_members WHERE member_google_id = ? AND accepted_invitation = ?`;
  connection.query(queryCheckTeam, [google_id, "ACCEPTED"], (err, teams) => {
    if (err) {
      console.log(err);
      res.send(
        `<script>alert("Error checking for existing team"); window.history.back();</script>`
      );
    }

    if (teams.length > 0) {
      // User already has a team, so don't allow creating a new one
      res.send(
        `<script>alert("You have a team and cannot create another one"); window.history.back();</script>`
      );
    }

    // No existing team found for the user, proceed with team creation
    connection.beginTransaction((err) => {
      if (err) {
        res.send(
          `<script>alert("Error starting transaction"); window.history.back();</script>`
        );
      }

      // Insert the new team into the teams table
      const queryInsertTeam = ` 
          INSERT INTO teams (team_name, is_open, created_by_google_id)
          VALUES (?, ?, ?)
        `;
      connection.query(
        queryInsertTeam,
        [team_name, is_open_boolean, google_id],
        (err, result) => {
          if (err) {
            console.log(err);
            // Rollback the transaction in case of error
            connection.rollback(() => {
              res.send(
                `<script>alert("Error inserting team"); window.history.back();</script>`
              );
              // res.status(500).send("Error inserting team");
            });
            return;
          }

          // Get the team_id of the newly created team
          const team_id = result.insertId;

          // Insert the owner as the first team member
          const queryInsertOwner = `
            INSERT INTO team_members (team_id, member_google_id, accepted_invitation)
            VALUES (?, ?, ?)
          `;
          connection.query(
            queryInsertOwner,
            [team_id, google_id, "ACCEPTED"],
            (err, result) => {
              if (err) {
                console.log(err);
                // Rollback the transaction in case of error
                connection.rollback(() => {
                  res.send(
                    `<script>alert("Error adding team owner to team members"); window.history.back();</script>`
                  );
                  // res
                  //   .status(500)
                  //   .send("Error adding team owner to team members");
                });
                return;
              }

              // Commit the transaction if all operations were successful
              connection.commit((err) => {
                if (err) {
                  console.log(err);
                  connection.rollback(() => {
                    res.send(
                      `<script>alert("Error during transaction commit"); window.history.back();</script>`
                    );
                    // res.status(500).send("Error during transaction commit");
                  });
                  return;
                }

                // Team creation was successful
                res.redirect("/create_team");
              });
            }
          );
        }
      );
    });
  });
};

exports.add_team_members = (req, res) => {
  const google_id = req.user.google_id;
  const { add_team_members_email } = req.body;
  const query = `
      INSERT INTO team_members (team_id, member_google_id)
      SELECT t.team_id, u.google_id
      FROM (SELECT team_id FROM teams WHERE created_by_google_id = ?) as t,
          (SELECT google_id FROM users WHERE email = ?) as u`;

  connection.query(
    query,
    [google_id, add_team_members_email],
    (err, result) => {
      if (!err) {
        if (result.affectedRows > 0) {
          res.redirect("/create_team");
        } else {
          console.log(result);
          res.send(
            `<script>alert("Team or user not found. Your teammate has not registered for this hackathon using this email. Enter a new email, or ask your teammate to register first before inviting them."); window.history.back();</script>`
          );
        }
      } else {
        console.log(err);
        res.send(
          `<script>alert("An error occurred while adding the team member."); window.history.back();</script>`
        );
      }
    }
  );
};

exports.view_application = (req, res) => {
  const google_id = req.user.google_id;

  if (req.isAuthenticated()) {
    const query = "SELECT university_email FROM users WHERE google_id = ?";

    connection.query(query, [google_id], (err, results) => {
      if (err) {
        console.error("Database query error:", err);
        return res.redirect("/error"); // Or handle the error in another way
      }

      let NotCompletedApplication = true;

      // Check if the university_email field is not empty
      if (results.length > 0 && results[0].university_email) {
        NotCompletedApplication = false;
      }

      // Attach the result to the request object to use in the next middleware or route handler
      // Render the application page with the completedApplication variable
      res.render("application", {
        NotCompletedApplication: NotCompletedApplication,
      });
    });
  } else {
    // User is not authenticated, redirect to the login page
    res.redirect("/login");
  }
};

exports.submit_application = (req, res) => {
  const {
    university,
    university_email,
    phone_number,
    over_18,
    have_id,
    hackathon_experience,
    shirt_size,
    race,
    gender,
    other_gender,
    other_university,
  } = req.body;
  const have_id_boolean = have_id === "true" ? 1 : 0;
  const over_18_boolean = over_18 === "true" ? 1 : 0;
  const mlh_sharing_optional = req.body.mlh_sharing_optional ? 1 : 0;

  // Handle 'Other' cases for university and gender
  const finalUniversity =
    university === "other" ? other_university : university;
  const finalGender = gender === "other" ? other_gender : gender;

  if (req.isAuthenticated()) {
    const google_id = req.user.google_id; // Assuming the user ID is stored in req.user.google_id

    let query = ` 
        UPDATE users 
        SET 
          university = ?, 
          university_email = ?,
          phone_number = ?,
          over_18 = ?, 
          have_id = ?, 
          hackathon_experience = ?,
          shirt_size = ?,
          race = ?,
          gender = ?, 
          mlh_sharing_optional = ?
        WHERE google_id = ?
      `;

    connection.query(
      query,
      [
        finalUniversity,
        university_email,
        phone_number,
        over_18_boolean,
        have_id_boolean,
        hackathon_experience,
        shirt_size,
        race,
        finalGender,
        mlh_sharing_optional,
        google_id,
      ],
      (err, result) => {
        if (err) {
          console.log(err);
          res.send(
            `<script>alert("Error updating your information"); window.history.back();</script>`
          );
        } else if (!university_email.endsWith(".edu")) {
          res.send(
            `<script>alert("You must enter a valid university email that ends in '.edu'"); window.history.back();</script>`
          );
        } else if (over_18_boolean == 0) {
          res.send(
            `<script>alert("You must be 18 or older by the start of the hackathon"); window.history.back();</script>`
          );
        } else if (have_id_boolean == 0) {
          res.send(
            `<script>alert("You must have a college issued ID"); window.history.back();</script>`
          );
        } else {
          res.redirect("/create_team");
        }
      }
    );
  } else {
    res.send(
      `<script>alert("You need to be logged in to submit this form"); window.history.back();</script>`
    );
  }
};

exports.accept_team_invitation = (req, res) => {
  const google_id = req.user.google_id;
  const team_id = req.params.team_id;

  // Check if the user already belongs to a team with an 'ACCEPTED' status
  const queryCheckTeam = `SELECT * FROM team_members WHERE member_google_id = ? AND accepted_invitation = 'ACCEPTED'`;
  connection.query(queryCheckTeam, [google_id], (err, teams) => {
    if (err) {
      console.log(err);
      return res.send(`<script>alert("Error checking for existing team"); window.history.back();</script>`);
    }

    if (teams.length > 0) {
      // User already has a team, so don't allow joining a new one
      return res.send(`<script>alert("You already have a team and cannot join another one"); window.history.back();</script>`);
    } else {
      // Check if the user has a pending invitation for the team
      const queryCheckPending = `SELECT * FROM team_members WHERE member_google_id = ? AND team_id = ?`;
      connection.query(queryCheckPending, [google_id, team_id], (err, result) => {
        if (err) {
          console.log(err);
          return res.send(`<script>alert("Error checking invitation status"); window.history.back();</script>`);
        }

        if (result.length > 0) {
          // User has a pending invitation, update to 'ACCEPTED'
          const queryUpdateMember = `
            UPDATE team_members
            SET accepted_invitation = 'ACCEPTED' 
            WHERE member_google_id = ? AND team_id = ?
          `;
          connection.query(queryUpdateMember, [google_id, team_id], (err, updateResult) => {
            if (err) {
              console.log(err);
              return res.send(`<script>alert("Error updating invitation status"); window.history.back();</script>`);
            }
            return res.redirect("/create_team");
          });
        } else {
          // User does not have a pending invitation, insert new 'ACCEPTED' status
          const queryInsertMember = `
            INSERT INTO team_members (team_id, member_google_id, accepted_invitation)
            VALUES (?, ?, 'ACCEPTED')
          `;
          connection.query(queryInsertMember, [team_id, google_id], (err, insertResult) => {
            if (err) {
              console.log(err);
              return res.send(`<script>alert("Error adding user to team"); window.history.back();</script>`);
            }
            return res.redirect("/create_team");
          });
        }
      });
    }
  });
};

exports.decline_team_invitation = (req, res) => {
  const google_id = req.user.google_id;
  const team_id = req.params.team_id;
  const query = ` 
    UPDATE team_members
    SET accepted_invitation = ? 
    WHERE member_google_id = ?
    AND team_id = ?
    `;
  connection.query(query, ["DECLINED", google_id, team_id], (err, result) => {
    if (!err) {
      res.redirect("/create_team");
    } else {
      // console.log(err);
      // res.send("update did not work");
      res.send(
        `<script>alert("Update did not work"); window.history.back();</script>`
      );
    }
  });
};

// fix clean code later
exports.remove_team_member = (req, res) => {
  const member_google_id = req.params.google_id; // The Google ID of the member to remove

  // First, find the team that this member is a part of
  const queryFindTeamAndOwner = `
      SELECT team_id 
      FROM team_members 
      WHERE member_google_id = ?
    `;

  connection.query(queryFindTeamAndOwner, [member_google_id], (err, result) => {
    if (err) {
      res.send(
        `<script>alert("Error finding team member"); window.history.back();</script>`
      );
      // console.log(err);
      // return res.status(500).send("Error finding team member");
    }

    if (result.length === 0) {
      res.send(
        `<script>alert("Team member not found"); window.history.back();</script>`
      );
      // return res.status(404).send("Team member not found");
    }

    const teamID = result[0].team_id;

    // Now, ensure that this member is not the owner of the team
    const queryCheckOwner = `
        SELECT created_by_google_id 
        FROM teams 
        WHERE team_id = ?
      `;

    connection.query(queryCheckOwner, [teamID], (err, result) => {
      if (err) {
        console.log(err);
        // return res.status(500).send("Error checking team owner");
        res.send(
          `<script>alert("Error checking team owner"); window.history.back();</script>`
        );
      }

      if (result.length === 0) {
        // return res.status(404).send("Team not found");
        res.send(
          `<script>alert("Team owner not found"); window.history.back();</script>`
        );
      }

      const owner_google_id = result[0].created_by_google_id;

      // If the member is the owner, proceed to delete the team
      if (member_google_id === owner_google_id) {
        const queryCountMembers = `SELECT COUNT(*) AS memberCount FROM team_members WHERE team_id = ?`;
        connection.query(queryCountMembers, [teamID], (err, results) => {
          if (err) {
            // console.log(err);
            res.send(
              `<script>alert("Error checking team owner"); window.history.back();</script>`
            );
          }

          // If it's only the owner in the team, delete the team and team members
          if (results[0].memberCount <= 1) {
            const queryRemoveTeamMembers = `DELETE FROM team_members WHERE team_id = ?`;
            connection.query(queryRemoveTeamMembers, [teamID], (err) => {
              if (err) {
                // console.log(err);
                // return res.status(500).send("Error removing team members");
                res.send(
                  `<script>alert("Error removing team members"); window.history.back();</script>`
                );
              }

              const queryRemoveTeam = `DELETE FROM teams WHERE team_id = ?`;
              connection.query(queryRemoveTeam, [teamID], (err) => {
                if (err) {
                  console.log(err);
                  // return res.status(500).send("Error removing team");
                  res.send(
                    `<script>alert("Error removing team"); window.history.back();</script>`
                  );
                }

                res.redirect("/create_team");
              });
            });
          } else {
            res.send(
              `<script>alert("To delete the team as a team owner, you must remove all other team members first."); window.history.back();</script>`
            );
          }
        });
      } else {
        // If the member is not the owner, proceed to remove the member
        const queryRemoveMember = `
            DELETE FROM team_members 
            WHERE member_google_id = ? AND team_id = ?
          `;

        connection.query(
          queryRemoveMember,
          [member_google_id, teamID],
          (err, result) => {
            if (err) {
              res.send(
                `<script>alert("Error removing team member"); window.history.back();</script>`
              );
              // console.log(err);
              // return res.status(500).send("Error removing team member");
            }

            if (result.affectedRows === 0) {
              res.send(
                `<script>alert("No team member removed"); window.history.back();</script>`
              );
              // return res.status(404).send("No team member removed");
            }

            res.redirect("/create_team");
          }
        );
      }
    });
  });
};

exports.change_open_team = (req, res) => {
  const google_id = req.user.google_id;
  const new_status = req.body.team_status === "open" ? 1 : 0;

  // Update the 'is_open' status of the team where the user is the owner
  const query = `
    UPDATE teams
    SET is_open = ?
    WHERE created_by_google_id = ?`;

  connection.query(query, [new_status, google_id], (err, result) => {
    if (err) {
      console.log(err);
      res.send(
        `<script>alert("An error occurred while changing the team status."); window.history.back();</script>`
      );
    } else {
      res.redirect("/create_team"); // Redirect to a relevant page after status change
    }
  });
};

exports.view_refer = (req, res) => {
  res.render("refer");
};

exports.submit_refer = (req, res) => {
  const google_id = req.user.google_id; // Assuming this is set after the user logs in

  // Define the query to get the logged-in user's name and email
  const queryGetReferrerInfo = `
    SELECT full_name, email 
    FROM users 
    WHERE google_id = ?
  `;

  // Execute the query to get the referrer's information
  connection.query(queryGetReferrerInfo, [google_id], (err, results) => {
    if (err) {
      console.error("Error fetching referrer info:", err);
      return res.send(
        `<script>alert("There was an error retrieving your information."); window.history.back();</script>`
      );
    }

    if (results.length > 0) {
      const referrer_name = results[0].full_name;
      const referrer_email = results[0].email;

      // Extract referee info from the request body
      const { referee_name, referee_email } = req.body;

      // Prepare the SQL query to insert the referral into the database
      const queryInsertReferral = `
        INSERT INTO referral (referrer_name, referrer_email, referee_name, referee_email) 
        VALUES (?, ?, ?, ?)
      `;

      // Execute the query to insert the referral
      connection.query(
        queryInsertReferral,
        [referrer_name, referrer_email, referee_name, referee_email],
        (err, insertResult) => {
          if (err) {
            console.error("Error submitting referral:", err);
            return res.send(
              `<script>alert("There was an error processing your referral."); window.history.back();</script>`
            );
          }
          res.send(
            `<script>alert("Refer successful"); window.history.back();</script>`
          );
        }
      );
    } else {
      res.send(
        `<script>alert("Referrer information not found."); window.history.back();</script>`
      );
    }
  });
};

// exports.post_register = (req, res) => {
//   const { first_name, last_name, email, username, password, phone_number, university } = req.body;
//
//   // Break the query into multiple lines for better readability
//   let query = `
//     INSERT INTO users
//     SET
//       first_name = ?,
//       last_name = ?,
//       email = ?,
//       username = ?,
//       password_hash = ?,
//       phone_number = ?,
//       university = ?
//   `;

//   // Execute the query
//   connection.query(query, [first_name, last_name, email, username, password, phone_number, university], (err, rows) => {
//     if (!err) {
//       res.render('home', { rows });
//     } else {
//       console.log(err);
//     }
//     console.log('The data from user table: \n', rows);
//   });
// };
