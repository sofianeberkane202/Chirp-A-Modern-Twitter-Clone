import { format, formatDistanceToNow } from "date-fns";

export const formatPostTime = (createdAt) => {
  if (!createdAt) return "Unkown time";

  const postDate = new Date(createdAt);
  const now = new Date();
  const diffInDays = Math.floor((now - postDate) / (1000 * 60 * 60 * 24));

  if (diffInDays < 30)
    return formatDistanceToNow(postDate, { addSuffix: true });

  return format(postDate, "MMM dd, yyyy");
};
