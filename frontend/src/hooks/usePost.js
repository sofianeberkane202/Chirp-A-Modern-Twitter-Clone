/* eslint-disable no-unused-vars */
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  commentOnPost,
  deletePost,
  fetchAllPosts,
  getAllUsersFollowingPosts,
  getLikedPosts,
  getUserPosts,
  likeOrUnlikePost,
} from "../api/posts/posts";
import { data, useParams } from "react-router-dom";
import { useUserContext } from "../context/userContext";
import toast from "react-hot-toast";

export function usePost() {
  const { user } = useUserContext();
  const { username } = useParams();

  // Determine which username to use (fallback to logged-in user)
  const effectiveUsername = username || user?.username;

  const postsUserPerPage = useInfiniteQuery({
    queryKey: ["postsPerPage", effectiveUsername],
    queryFn: ({ pageParam }) => getUserPosts(effectiveUsername, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.hasMore ? lastPage.page * 1 + 1 : undefined,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const getFollowingPostsPerPage = useInfiniteQuery({
    queryKey: ["followingPostsPerPage"],
    queryFn: ({ pageParam }) => getAllUsersFollowingPosts({ page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.hasMore ? lastPage.page * 1 + 1 : undefined,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const getPostsPerPage = useInfiniteQuery({
    queryKey: ["postsPerpage"],
    queryFn: ({ pageParam }) => fetchAllPosts({ page: pageParam }),
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000, // 5 min
    gcTime: 10 * 60 * 1000,
    retry: 2,
    // refetchInterval: 60 * 1000,
    getNextPageParam: (lastPage, allPages) => {
      const nextPage = lastPage.page + 1;
      return lastPage.hasMore ? nextPage : undefined;
    },
  });

  return {
    getPostsPerPage,
    getFollowingPostsPerPage,
    postsUserPerPage,
  };
}

export const usePostMutation = ({
  postOwner,
  modalRef,
  setComment,
  me,
  currentProfile = {},
}) => {
  const queryClient = useQueryClient();

  const invalidatePostQueries = () => {
    queryClient.invalidateQueries(["postsPerpage"]);
    if (postOwner?.username) {
      queryClient.invalidateQueries(["postsPerPage", postOwner.username]);
      queryClient.invalidateQueries(["likedPostsPerPage", postOwner.username]);
    }
  };

  const onSuccessHandler = (message) => (data) => {
    if (data) console.log(`${message}:`, data);
    invalidatePostQueries();
    toast.success(message);
  };

  const onErrorHandler = (error) => {
    console.error("Error:", error);
    toast.error(error?.message || "Something went wrong");
  };

  // Delete Post Mutation
  const deletePostMutation = useMutation({
    mutationFn: deletePost,
    onSuccess: onSuccessHandler("Post deleted successfully"),
    onError: onErrorHandler,
  });

  // Comment on Post Mutation
  const commentPostMutation = useMutation({
    mutationFn: commentOnPost,

    onMutate: (commentData) => {
      const username = currentProfile?.username || me?.username;

      const queryKeys = [
        ["postsPerpage"],
        ["followingPostsPerPage"],
        ["likedPostsPerPage", username],
        ["postsPerPage", username],
      ];

      // cancel queries
      Promise.all(
        queryKeys.map((queryKey) => queryClient.cancelQueries({ queryKey }))
      );

      // Get Privious catch data

      const previousCatch = Object.fromEntries(
        queryKeys.map((queryKey) => [
          queryKey,
          queryClient.getQueryData(queryKey),
        ])
      );

      function updatePosts(posts) {
        return posts.map((post) => {
          if (post._id === commentData.postId) {
            return {
              ...post,
              comments: [
                ...post.comments,
                { user: me, text: commentData.text },
              ],
            };
          }
          return post;
        });
      }

      const updateCatch = (queryKey) => {
        queryClient.setQueryData(queryKey, (oldData) => {
          if (queryKey[0] !== "likedPostsPerPage" && !oldData?.pages?.length)
            return;
          if (queryKey[0] === "likedPostsPerPage" && !oldData?.pages?.length)
            return;
          if (queryKey[0] === "likedPostsPerPage") {
            return {
              ...oldData,
              pages: oldData.pages.map((page) => ({
                ...page,
                data: {
                  ...page.data,
                  likedPosts: updatePosts(page.data.likedPosts || []),
                },
              })),
            };
          }

          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              data: {
                ...page.data,
                posts: updatePosts(page.data.posts || []),
              },
            })),
          };
        });
      };

      queryKeys.forEach(updateCatch);

      if (modalRef?.current) {
        modalRef.current.close();
      }

      return previousCatch;
    },
    onSuccess: (data) => {
      console.log(`Post commented successfully: ${data.message}`);
      // Batch invalidate queries to prevent excessive re-fetching
      queryClient.invalidateQueries(["postsPerpage"]);
      queryClient.invalidateQueries(["followingPostsPerPage"]);

      if (currentProfile?.username) {
        queryClient.invalidateQueries([
          "postsPerPage",
          currentProfile.username,
        ]);
        queryClient.invalidateQueries([
          "likedPostsPerPage",
          currentProfile.username,
        ]);
      }
      if (modalRef?.current) {
        modalRef.current.close();
      }
      setComment("");
      toast.success("Post commented successfully");
    },
    onError: (error, _, context) => {
      onErrorHandler(error);
      if (!context) return;
      Object.entries(context).forEach(([queryKey, previousData]) =>
        queryClient.setQueryData(queryKey, previousData)
      );
    },
  });

  // Like or Unlike Post Mutation
  const likeOrUnlikeMutation = useMutation({
    mutationFn: likeOrUnlikePost,

    onMutate: async (postId) => {
      if (!currentProfile?.username && !me?.username) return;

      const username = currentProfile?.username || me?.username;

      // Define query keys
      const queryKeys = [
        ["postsPerpage"],
        ["postsPerPage", username],
        ["likedPostsPerPage", username],
        ["followingPostsPerPage"],
      ];

      // Cancel relevant queries before mutating
      await Promise.all(
        queryKeys.map((queryKey) => queryClient.cancelQueries({ queryKey }))
      );

      // Store previous cache data
      const previousCache = Object.fromEntries(
        queryKeys.map((queryKey) => [
          queryKey,
          queryClient.getQueryData(queryKey),
        ])
      );

      // Check if there is any existing post data
      if (!previousCache[["postsPerpage"]]?.pages?.length) return;

      // Optimistic UI update function
      const updatePosts = (posts) => {
        return posts.map((post) =>
          post._id === postId
            ? {
                ...post,
                likes: post.likes.includes(me._id)
                  ? post.likes.filter((id) => id !== me._id) // Unlike
                  : [...post.likes, me._id], // Like
              }
            : post
        );
      };

      // Function to update cache safely
      const updateCache = (queryKey) => {
        queryClient.setQueryData(queryKey, (oldData) => {
          if (!oldData?.pages) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              data: {
                ...page.data,
                // Apply the update function to the correct property
                ...(queryKey[0] === "likedPostsPerPage"
                  ? { likedPosts: updatePosts(page.data.likedPosts || []) }
                  : { posts: updatePosts(page.data.posts || []) }),
              },
            })),
          };
        });
      };

      // Apply cache updates
      queryKeys.forEach(updateCache);

      return previousCache; // Pass previous data for rollback on error
    },

    onSuccess: () => {
      toast.success("Post liked/unliked successfully");

      // Invalidate relevant queries
      const queriesToInvalidate = [["postsPerPage"], ["followingPostsPerPage"]];

      if (currentProfile?.username) {
        queriesToInvalidate.push(["postsPerPage", currentProfile.username]);
        queriesToInvalidate.push([
          "likedPostsPerPage",
          currentProfile.username,
        ]);
      }

      queriesToInvalidate.forEach((queryKey) =>
        queryClient.invalidateQueries(queryKey)
      );
    },

    onError: (error, postId, context) => {
      console.error("❌ Error liking/unliking post:", error);
      toast.error("Failed to like/unlike post");

      if (!context) return;

      // Rollback cache to previous state
      Object.entries(context).forEach(([queryKey, previousData]) => {
        if (previousData) queryClient.setQueryData(queryKey, previousData);
      });
    },
  });

  return { deletePostMutation, commentPostMutation, likeOrUnlikeMutation };
};

export const useLikedPosts = ({ username, userPofileQuery }) => {
  // Fallback to logged-in user when `username` is not provided
  const effectiveUsername = username;
  const userId = userPofileQuery?.data?.data?.profile?._id;

  const getAllLikedPostsPerPage = useInfiniteQuery({
    queryKey: ["likedPostsPerPage", effectiveUsername],
    queryFn: ({ pageParam }) => getLikedPosts({ userId, page: pageParam }),
    initialPageParam: 1,
    enabled: !!userId,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.hasMore ? lastPage.page * 1 + 1 : undefined,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  return { getAllLikedPostsPerPage };
};
