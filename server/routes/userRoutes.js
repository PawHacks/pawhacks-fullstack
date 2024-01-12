const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// Routes
router.get("/", userController.get_home);
router.post("/", userController.post_home);
router.get("/login", userController.view_login);
router.post("/send_email", userController.send_email)
// router.post('/register', userController.post_register);
router.get("/application", userController.view_application);
router.post("/application", userController.submit_application);
router.get("/create_team", userController.view_create_team);
router.post("/create_team", userController.submit_create_team);
router.get("/open_teams", userController.view_open_teams)
router.get("/view_team/:team_id", userController.view_team_by_team_id);
router.get("/team_invitations", userController.view_team_invitations)
router.post("/add_team_members", userController.add_team_members);
router.post(
  "/accept_team_invitation/:google_id/:team_id",
  userController.accept_team_invitation
);
router.post(
  "/decline_team_invitation/:google_id/:team_id",
  userController.decline_team_invitation
);
router.post(
  "/remove_team_member/:google_id/:team_id",
  userController.remove_team_member
);

module.exports = router;
