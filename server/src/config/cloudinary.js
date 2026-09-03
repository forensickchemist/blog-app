import { v2 as cloudinary } from "cloudinary";
import multer from "multer";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ---- APP-SPECIFIC KNOB ----
const UPLOAD_FOLDER = "blog-app/post";
// ----------------------------

class CloudinaryStorage {
  constructor({ folder }) {
    this.folder = folder;
  }

  _handleFile(req, file, cb) {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: this.folder,
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        transformation: [{ width: 1600, crop: "limit", quality: "auto" }],
      },
      (error, result) => {
        if (error) return cb(error);
        // Mirror the shape multer-storage-cloudinary used to produce, so
        // controllers can keep reading req.file.path / req.file.filename.
        cb(null, {
          path: result.secure_url,
          filename: result.public_id,
          size: result.bytes,
        });
      }
    );
    file.stream.pipe(uploadStream);
  }

  _removeFile(req, file, cb) {
    cloudinary.uploader
      .destroy(file.filename)
      .then(() => cb(null))
      .catch(cb);
  }
}

export const upload = multer({
  storage: new CloudinaryStorage({ folder: UPLOAD_FOLDER }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});

export default cloudinary;
