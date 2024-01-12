CREATE TABLE emails (
  id INT NOT NULL AUTO_INCREMENT,
  email VARCHAR(100) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY (email)
);

CREATE TABLE teams (
  team_id INT NOT NULL AUTO_INCREMENT,
  team_name VARCHAR(255) NOT NULL,
  is_open TINYINT(1) NOT NULL DEFAULT 0,
  created_by_google_id VARCHAR(21) NOT NULL,
  PRIMARY KEY (team_id)
);

CREATE TABLE team_members (
  team_id INT NOT NULL,
  member_google_id VARCHAR(21) NOT NULL,
  accepted_invitation ENUM('ACCEPTED', 'PENDING', 'DECLINED') NOT NULL DEFAULT 'PENDING',
  PRIMARY KEY (team_id, member_google_id),
  FOREIGN KEY (team_id) REFERENCES teams(team_id)
);

CREATE TABLE users (
  user_id INT NOT NULL AUTO_INCREMENT,
  google_id VARCHAR(21) NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  full_name VARCHAR(128) NOT NULL,
  email VARCHAR(255) NOT NULL,
  university VARCHAR(255),
  over_18 TINYINT(1),
  have_id TINYINT(1),
  hackathon_experience VARCHAR(500),
  PRIMARY KEY (user_id),
  UNIQUE KEY (email),
  UNIQUE KEY (google_id)
);
