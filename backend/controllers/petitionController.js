const Petition = require("../model/petition");

// ✅ Create a new petition
exports.createPetition = async (req, res) => {
  try {
    const { title, description, category, location } = req.body;

    const petition = await Petition.create({
      creator: req.user.id,
      title,
      description,
      category,
      location,
    });

    res.status(201).json({ success: true, petition });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get petitions (with optional filters)
exports.getPetitions = async (req, res) => {
  try {
    const { category, location, status } = req.query;
    const filters = {};
    if (category) filters.category = category;
    if (location) filters.location = location;
    if (status) filters.status = status;

    const petitions = await Petition.find(filters)
      .populate("creator", "name email role location")
      .sort({ createdAt: -1 });

    res.json({ success: true, petitions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Sign a petition
exports.signPetition = async (req, res) => {
  try {
    const petition = await Petition.findById(req.params.id);
    if (!petition)
      return res.status(404).json({ success: false, message: "Petition not found" });

    const alreadySigned = petition.signatures.some(
      (sig) => sig.user.toString() === req.user.id
    );
    if (alreadySigned)
      return res.status(400).json({ success: false, message: "You already signed this petition" });

    petition.signatures.push({ user: req.user.id });
    await petition.save();

    res.json({ success: true, message: "Petition signed successfully", petition });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
