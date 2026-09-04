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
      maxlength: 220,
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

// Generate slug and excerpt before validation.
postSchema.pre("validate", function generateSlugAndExcerpt(next) {
  // Generate a new slug when creating a post
  // or when the title has been changed.
  if (this.title && (this.isModified("title") || !this.slug)) {
    this.slug = `${slugify(this.title, {
      lower: true,
      strict: true,
    })}-${Date.now().toString().slice(-5)}`;
  }

  // Regenerate the excerpt whenever the content changes.
  // This keeps the excerpt synchronized with the latest content
  // whether the post is a draft or published.
  if (this.isModified("content") || !this.excerpt) {
    if (this.content) {
      this.excerpt = this.content
        .replace(/<[^>]*>/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 200);
    } else {
      this.excerpt = "";
    }
  }

  next();
});

// Text search index.
postSchema.index({
  title: "text",
  content: "text",
  tags: "text",
});

export default mongoose.model("Post", postSchema);