const express = require("express");
const router = express.Router();
const {
  createPetition,
  getPetitions,
  signPetition,
} = require("../controllers/petitionController");
const { protect } = require("../middleware/authmiddleware");

// POST → Create new petition
router.post("/", protect, createPetition);

// GET → List/filter petitions
router.get("/", getPetitions);

// POST → Sign a petition
router.post("/:id/sign", protect, signPetition);

module.exports = router;
