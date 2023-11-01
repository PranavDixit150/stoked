var express = require("express");
var router = express.Router();
const ownerController = require("../controller/businessOwner");
router.post("/createOwner", ownerController.createOwner);
router.post("/logInOwner", ownerController.logInOwner);
module.exports = router;
