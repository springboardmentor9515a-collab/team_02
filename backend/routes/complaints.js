const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter: (req, file, cb) => {
    if (["image/jpeg", "image/png"].includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only jpeg/png images allowed"));
  },
});

router.post(
  "/",
  protect,
  authorize("citizen"),
  upload.single("photo"), // 'photo' is the name in your form-data
  [
    body("title").isString().notEmpty(),
    body("description").isString().notEmpty(),
    body("category").isString().notEmpty(),
    body("location").isString().notEmpty(),
  ],
  complaintController.createComplaint
);

module.exports = router;
