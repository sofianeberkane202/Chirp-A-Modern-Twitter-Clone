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

export const formatDate = (date) => {
  // format date to "MMM yyyy" like this: "May 2023"
  return format(date, "MMM yyyy");
};
