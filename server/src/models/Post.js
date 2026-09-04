import mongoose from "mongoose";
import slugify from "slugify";

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [150, "Title cannot exceed 150 characters"],
    },

    slug: {
      type: String,
      unique: true,
      index: true,
    },

    content: {
      type: String,
      required: [true, "Content is required"],
    },

    excerpt: {
      type: String,
      trim: true,
      maxlength: [220, "Excerpt cannot exceed 220 characters"],
      default: "",
    },

    coverImage: {
      url: {
        type: String,
        default: "",
      },
      publicId: {
        type: String,
        default: "",
      },
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],

    status: {
      type: String,
      enum: ["draft", "published"],
      default: "published",
    },
  },
  {
    timestamps: true,
  }
);

// Generate a slug when creating a post or changing its title.
postSchema.pre("validate", function generateSlug(next) {
  if (this.title && (this.isModified("title") || !this.slug)) {
    this.slug = `${slugify(this.title, {
      lower: true,
      strict: true,
    })}-${Date.now().toString().slice(-5)}`;
  }

  next();
});

postSchema.index({
  title: "text",
  content: "text",
  tags: "text",
});

export default mongoose.model("Post", postSchema);
