const express = require("express");
const multer = require("multer");

const {
  processarCupom,
} = require("../controllers/cupons.controller");

const router = express.Router();

const upload = multer({
  dest: "uploads/",
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("O arquivo precisa ser uma imagem"));
    }
  },
});

router.post(
  "/teste",
  upload.single("cupom"),
  processarCupom
);

module.exports = router; 