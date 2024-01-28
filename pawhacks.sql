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
  full_name VARCHAR(255) NOT NULL, -- Changed from VARCHAR(128) to VARCHAR(255)
  email VARCHAR(255) NOT NULL,
  university_email VARCHAR(255) NOT NULL,
  university VARCHAR(255),
  over_18 TINYINT(1),
  have_id TINYINT(1),
  mlh_sharing_option TINYINT(1),
  hackathon_experience VARCHAR(500),
  gender VARCHAR(50) NOT NULL,
  race ENUM('american_indian', 'asian', 'african_american', 'pacific_islander', 'caucasian', 'other') NOT NULL,
  shirt_size ENUM('S', 'M', 'L', 'XL') NOT NULL,
  phone_number VARCHAR(15), -- New column for phone number
  PRIMARY KEY (user_id),
  UNIQUE KEY unique_email (email), -- Named constraint for uniqueness
  UNIQUE KEY unique_google_id (google_id) -- Named constraint for uniqueness
);

CREATE TABLE referral (
  referrer_name VARCHAR(100) NOT NULL,
  referrer_email VARCHAR(100) NOT NULL,
  referee_name VARCHAR(100) NOT NULL,
  referee_email VARCHAR(100) NOT NULL
) 

