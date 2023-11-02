const path = require("path");
const db = require("../connection/db");
const jwt = require("jsonwebtoken");

var dotenv = require("dotenv");
dotenv.config();

const SECRET = process.env.SECRET;

module.exports = {
  // ------------------------------------Start Crete Business Owner Api----------------------------------
  createOwner: async (req, res) => {
    try {
      const {
        businessId,
        ownerName,
        ownerEmail,
        ownerPhoneNumber,
        ownerDOB,
        ownerImage,
        ownerPassword,
        ownerRole,
        ownerLocation,
        latitude,
        longitude,
        isEmailVeryfied,
        isPhoneVeryfied,
        accountStatus,
        deviceType,
        deviceToken,
      } = req.body;

      // if (
      //   !businessId ||
      //   !ownerName ||
      //   !ownerEmail ||
      //   !ownerPhoneNumber ||
      //   !ownerDOB ||
      //   !ownerImage ||
      //   !ownerPassword ||
      //   !ownerRole ||
      //   !ownerLocation ||
      //   !latitude ||
      //   !longitude ||
      //   !isEmailVeryfied ||
      //   !isPhoneVeryfied ||
      //   !accountStatus ||
      //   !deviceType
      // ) {
      //   return res
      //     .status(400)
      //     .json({ message: "Please fill all required fields" });
      // }

      // const emailRegex = /\S+@\S+\.\S+/;
      // if (!emailRegex.test(ownerEmail)) {
      //   return res.status(400).json({ message: "Invalid email format" });
      // }

      // const phoneRegex = /^[0-9]{8,14}$/;
      // if (!phoneRegex.test(ownerPhoneNumber)) {
      //   return res.status(400).json({ message: "Invalid phone number format" });
      // }

      let ownerImageName = "";
      if (req.files && req.files.ownerImage) {
        const ownerImageFile = req.files.ownerImage;
        ownerImageName = ownerImageFile.name;
        const uploadDir = path.join(
          __dirname,
          "../public/images",
          ownerImageName
        );
        ownerImageFile.mv(uploadDir, (err) => {
          if (err) {
            console.error(err);
            return res.status(500).send("Error in uploading image");
          }
        });
      }
      const dbData = [
        parseInt(businessId),
        ownerName,
        ownerEmail,
        ownerPhoneNumber,
        ownerDOB,
        ownerImageName,
        ownerPassword,
        ownerRole,
        ownerLocation,
        latitude,
        longitude,
        isEmailVeryfied,
        isPhoneVeryfied,
        accountStatus,
        deviceType,
        deviceToken,
      ];
      console.log("db dat ==================>", dbData);
      db.query(
        "INSERT INTO businessOwner (businessId, ownerName, ownerEmail, ownerPhoneNumber, ownerDOB, ownerImage, ownerPassword, ownerRole, ownerLocation, latitude, longitude, isEmailVeryfied, isPhoneVeryfied, accountStatus, deviceType, deviceToken) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        dbData,
        async (err, result) => {
          if (err) {
            console.error(err);
            return res
              .status(500)
              .send("Error in inserting data into database");
          }
          const authToken = jwt.sign({ ownerEmail }, SECRET, {
            expiresIn: "1h",
          });
          db.query(
            `Update businessOwner set authToken = '${authToken}' where ownerEmail = '${ownerEmail}'`,
            [authToken]
          );
          console.log(authToken, SECRET, "-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-");
          return res.json({
            message: result,
            token: authToken,
          });
        }
      );
    } catch (error) {
      console.error(error);
      return res.status(500).send("Internal Server Error");
    }
  },

  logInOwner: async (req, res) => {
    try {
      const { ownerEmail, ownerPassword } = req.body;
      console.log(req.body, "hjdahsgcdhsdcfaswd");
      if (!ownerEmail || !ownerPassword) {
        return res
          .status(400)
          .json({ message: "Username and password are required." });
      }

      db.query(
        "SELECT * FROM businessOwner WHERE ownerEmail = ? AND ownerPassword = ?",
        [ownerEmail, ownerPassword],
        (err, results) => {
          if (err) {
            throw err;
          }
          if (results.length > 0) {
            res.json({ message: "Login successful" });
          } else {
            res.status(401).json({ message: "Invalid credentials" });
          }
        }
      );
    } catch (error) {
      console.log(error);
    }
  },
  // --------------------------------------End Owner login----------------------------------------

  // --------------------------------------Start Crete Business Api----------------------------------------
  createBusiness: async (req, res) => {
    try {
      const {
        businessName,
        businessDescription,
        businessLocation,
        longitude,
        latitude,
        openingTime,
        closingTime,
      } = req.body;

      if (
        !businessName ||
        !businessDescription ||
        !businessLocation ||
        !longitude ||
        !latitude ||
        !openingTime ||
        !closingTime
      ) {
        return res
          .status(400)
          .json({ message: "Please fill all required fields" });
      }

      const dbData = [
        businessName,
        businessDescription,
        businessLocation,
        latitude,
        longitude,
        openingTime,
        closingTime,
      ];

      db.query(
        "INSERT INTO business (businessName, businessDescription, businessLocation, latitude, longitude, openingTime, closingTime) VALUES (?, ?, ?, ?, ?, ?, ?)",
        dbData,
        (err, result) => {
          if (err) {
            console.error(err);
            return res
              .status(500)
              .send("Error in inserting data into database");
          }
          console.log("Data received from MySQL:", result);
          return res.json({ message: result });
        }
      );
    } catch (error) {
      console.error(error);
      return res.status(500).send("Internal Server Error");
    }
  },
  // --------------------------------------End Crete Business Api------------------------------------------
};
