import api from "./api";

export const commentService = {
  async getComments(postId) {
    const response = await api.get(
      `/posts/${postId}/comments`
    );

    return response.data.comments;
  },

  async createComment(
    postId,
    content,
    parentComment = null,
    mentionedUsername = ""
  ) {
    const payload = {
      content,
    };

    if (parentComment) {
      payload.parentComment =
        parentComment;
    }

    if (mentionedUsername?.trim()) {
      payload.mentionedUsername =
        mentionedUsername
          .trim()
          .replace(/^@+/, "");
    }

    const response = await api.post(
      `/posts/${postId}/comments`,
      payload
    );

    return response.data.comment;
  },

  async deleteComment(commentId) {
    const response = await api.delete(
      `/comments/${commentId}`
    );

    return response.data;
  },
};