const path = require("path");
const db = require("../connection/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
// const randomstring = require("randomstring");
const emailMamanger = require("../helpers/sendMail");
// const otp = Math.floor(1000 + Math.random() * 9000);

var dotenv = require("dotenv");
const { log } = require("console");
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
        otp,
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
      //   isEmailVeryfied !== true ||
      //   isPhoneVeryfied !== true ||
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

      const hashedPassword = await bcrypt.hash(ownerPassword, 10);

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

      // let ownerImageName = "";
      // if (req.files && req.files.ownerImage) {
      //   const ownerImageFile = req.files.ownerImage;
      //   ownerImageName = ownerImageFile.name;
      //   const uploadDir = path.join(
      //     __dirname,
      //     "../public/images",
      //     ownerImageName
      //   );
      //   ownerImageFile.mv(uploadDir, (err) => {
      //     if (err) {
      //       console.error(err);
      //       return res.status(500).send("Error in uploading image");
      //     }
      //   });
      // }

      const dbData = [
        parseInt(businessId),
        ownerName,
        ownerEmail,
        ownerPhoneNumber,
        ownerDOB,
        ownerImageName,
        hashedPassword,
        ownerRole,
        ownerLocation,
        latitude,
        longitude,
        isEmailVeryfied,
        isPhoneVeryfied,
        accountStatus,
        deviceType,
        deviceToken,
        otp,
      ];
      console.log("db dat ==================>", dbData);

      db.query(
        "INSERT INTO businessOwner (businessId, ownerName, ownerEmail, ownerPhoneNumber, ownerDOB, ownerImage, ownerPassword, ownerRole, ownerLocation, latitude, longitude, isEmailVeryfied, isPhoneVeryfied, accountStatus, deviceType, deviceToken, otp) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
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
          res.json({
            message: result,
            token: authToken,
          });
          const otp = await emailMamanger.sendOTP(
            ownerEmail,
            "Account verify OTP"
          );
          console.log("otp =======>");
          db.query(
            `update businessOwner set otp = '${otp}'  where ownerEmail = '${ownerEmail}' `
          );
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
      const hashedPassword = await bcrypt.hash(ownerPassword, 10);

      console.log(req.body, "hjdahsgcdhsdcfaswd");
      if (!ownerEmail || !ownerPassword) {
        return res
          .status(400)
          .json({ message: "Username and password are required." });
      }
      db.query(
        "SELECT * FROM businessOwner WHERE ownerEmail = ? AND ownerPassword = ?",
        [ownerEmail, hashedPassword],
        (err, results) => {
          if (err) {
            throw err;
          }

          const result = new Promise((res, rej) => {
            db.query(
              `SELECT authToken FROM businessOwner WHERE ownerEmail = '${ownerEmail}'`,
              async (error, token) => {
                if (token) {
                  res(token);
                }
                if (error) {
                  rej(null);
                }
                console.log(token, "tokenoooooooooooooooooooo");
              }
            );
          });

          const ownerToken = jwt.sign({ ownerEmail }, SECRET, {
            expiresIn: "1h",
          });
          console.log(ownerToken, "ownerTokennb");
          // if (token === ownerToken) {
          //   if (results) {
          //     res.json({ message: "Login successful" });
          //   } else {
          //     res.status(401).json({ message: "Invalid credentials" });
          //   }
          // }
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
  createEvent: async (req, res) => {
    try {
      const {
        ownerId,
        businessId,
        eventName,
        description,
        image,
        location,
        longitude,
        latitude,
        time,
        date,
        whyAttend,
        termCondition,
      } = req.body;

      if (
        !ownerId ||
        !businessId ||
        !eventName ||
        !description ||
        !location ||
        !longitude ||
        !latitude ||
        !time ||
        !date ||
        !whyAttend ||
        !termCondition
      ) {
        return res
          .status(400)
          .json({ message: "Please fill all required fields" });
      }
      // let ownerImageName = "";
      // if (req.files && req.files.ownerImage) {
      //   const ownerImageFile = req.files.ownerImage;
      //   ownerImageName = ownerImageFile.name;
      //   const uploadDir = path.join(
      //     __dirname,
      //     "../public/images",
      //     ownerImageName
      //   );
      //   ownerImageFile.mv(uploadDir, (err) => {
      //     if (err) {
      //       console.error(err);
      //       return res.status(500).send("Error in uploading image");
      //     }
      //   });
      // }

      let eventImage = "";
      if (req.files && req.files.image) {
        const ImageFile = req.files.image;
        eventImage = ImageFile.name;
        const uploadDir = path.join(__dirname, "../public/images", eventImage);
        ImageFile.mv(uploadDir, (err) => {
          if (err) {
            console.error(err);
            return res.status(500).send("Error in uploading image");
          }
        });
      }

      const dbData = [
        ownerId,
        businessId,
        eventName,
        description,
        eventImage,
        location,
        longitude,
        latitude,
        time,
        date,
        whyAttend,
        termCondition,
      ];

      db.query(
        "INSERT INTO events (ownerId, businessId, eventName, description, image, location, longitude, latitude, time, date, whyAttend, termCondition) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
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
      console.log(error);
    }
  },

  // --------------------------------------Start Edit Event Api------------------------------------------

  editEvent: async (req, res) => {
    try {
      const {
        ownerId,
        businessId,
        eventName,
        description,
        image,
        location,
        longitude,
        latitude,
        time,
        date,
        whyAttend,
        termCondition,
      } = req.body;

      let eventImage = "";
      if (req.files && req.files.image) {
        const ImageFile = req.files.image;
        eventImage = ImageFile.name;
        const uploadDir = path.join(__dirname, "../public/images", eventImage);
        ImageFile.mv(uploadDir, (err) => {
          if (err) {
            console.error(err);
            return res.status(500).send("Error in uploading image");
          }
        });
      }

      const eventId = req.params.eventId;
      db.query(
        `UPDATE events SET ownerId = ?, businessId = ?, eventName = ?, description = ?, image = ?, location = ?, longitude = ?, latitude = ?, time = ?, date = ?, whyAttend = ?, termCondition = ? WHERE eventId = ?`,
        [
          ownerId,
          businessId,
          eventName,
          description,
          eventImage,
          location,
          longitude,
          latitude,
          time,
          date,
          whyAttend,
          termCondition,
          eventId,
        ]
      );

      res.status(200).json({ message: "Event updated successfully" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  // ------------------------------------ delete event -------------------------->>>>>>>>>>
  deleteEvent: async (req, res) => {
    try {
      const eventId = req.params.eventId;

      const result = await new Promise((res, rej) => {
        db.query(
          `SELECT eventId FROM events WHERE eventId = '${eventId}'`,
          (error, data) => {
            if (data) {
              res(data);
            }
            if (error) {
              rej(null);
            }
          }
        );
      });
      console.log(result, "JDDHDHGUGHDKSJFUDUURFTEFHU4");
      if (result[0]) {
        await db.query(`DELETE FROM events WHERE eventId = '${eventId}'`);

        res.status(200).json({ message: "Event deleted successfully" });
      } else {
        return res.status(404).json({ message: "Event not found" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  createInventory: async (req, res) => {
    try {
      const {businessId, businessOwnerId, eventId, image, description, location, longitude, latitude, category, subCategory, quantity } = req.body;

      let inventoryImage = ""
      if(req.files && req.files.image){
        const imageFile = req.files.image
        inventoryImage = imageFile.name
        const uploadDir = path.join(__dirname, "../public/images", inventoryImage)
        imageFile.mv(uploadDir, (err) => {
          if(err){
            console.error(err)
            return res
            .status(500)
            .send("Error in uploading image")
          }
        })
      }

      const dbData = [
        businessId,
        businessOwnerId,
        eventId,
        description,
        inventoryImage,
        location,
        longitude,
        latitude,
        category,
        subCategory,
        quantity,
      ];
      console.log(dbData, "fchdfhdjwhfudfugfdchwufgwdjcbdfgwdhbcouwdetfdnbfow7e");

      db.query ("insert into inventory (businessId, businessOwnerId, eventId, image, description, location, longitude, latitude, category, subCategory, quantity) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"),
      dbData, (err, res) => {
        if(err) {
          console.error(err)
          return res
          .status(500)
          .send("Error in inserting data")
        }
        console.log("Data insertied successfully...")
      }
    } catch (error) {
      console.log(error,  "Error");
    }
  }
};
