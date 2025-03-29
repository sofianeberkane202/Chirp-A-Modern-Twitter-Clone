import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMe } from "../api/auth/user";
import {
  editProfile,
  followUnfollowUser,
  getUserProfile,
} from "../api/users/users";
import toast from "react-hot-toast";

export function useUserProfile() {
  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    staleTime: 30 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  return { meQuery };
}

export function useCurrentUserProfile({ username }) {
  const userPofileQuery = useQuery({
    queryKey: ["profile", username],
    queryFn: () => getUserProfile(username),
    staleTime: 10 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  return { userPofileQuery };
}

export function useFollowUnfollowUser({ profileUsername, loginUsername }) {
  const queryClient = useQueryClient();

  const followUnfollowUserMutation = useMutation({
    mutationFn: followUnfollowUser,

    onMutate: async (userId) => {
      const queryKeys = [
        ["me"],
        ["profile", profileUsername],
        ["profile", loginUsername],
      ];

      await Promise.all(
        queryKeys.map((key) => queryClient.cancelQueries({ queryKey: key }))
      );

      const previousData = {
        me: queryClient.getQueryData(["me"]),
        profile: queryClient.getQueryData(["profile", profileUsername]),
        loginProfile: queryClient.getQueryData(["profile", loginUsername]),
      };

      // Helper function to update query cache
      const updateQueryCache = (key, field) => {
        queryClient.setQueryData(key, (oldData) => {
          if (!oldData?.data?.[field]) return oldData;
          const fieldData = oldData.data[field];
          return {
            ...oldData,
            data: {
              ...oldData.data,
              [field]: {
                ...fieldData,
                following: fieldData.following.includes(userId)
                  ? fieldData.following.filter((id) => id !== userId)
                  : [...fieldData.following, userId],
              },
            },
          };
        });
      };

      updateQueryCache(["me"], "user");
      updateQueryCache(["profile", loginUsername], "profile");

      queryClient.setQueryData(["profile", profileUsername], (oldData) => {
        if (!oldData?.data?.profile) return oldData;
        const followers = oldData.data.profile.followers || [];
        return {
          ...oldData,
          data: {
            ...oldData.data,
            profile: {
              ...oldData.data.profile,
              followers: followers.includes(userId)
                ? followers.filter((id) => id !== userId)
                : [...followers, userId],
            },
          },
        };
      });

      return previousData;
    },

    onSuccess: (data) => {
      toast.success(data?.message);
      ["me", "profile", "suggested-users", "followingPostsPerPage"].forEach(
        (key) => queryClient.invalidateQueries({ queryKey: [key] })
      );
      // queryClient.invalidateQueries({ queryKey: ["followingPostes"] });
      queryClient.invalidateQueries({ queryKey: ["profile", profileUsername] });
      queryClient.invalidateQueries({ queryKey: ["profile", loginUsername] });
    },

    onError: (error, userId, context) => {
      toast.error(error.message);
      if (!context) return;
      Object.entries(context).forEach(([key, data]) => {
        if (data) queryClient.setQueryData([key], data);
      });
    },
  });

  return { followUnfollowUserMutation };
}

export function useEditProfile() {
  const queryClient = useQueryClient();
  const editProfileMutation = useMutation({
    mutationFn: editProfile,
    onSuccess: (data) => {
      toast.success("Profile updated successfully", data);
      queryClient.invalidateQueries({ queryKey: ["me"] });
      queryClient.invalidateQueries({
        queryKey: ["profile", data.data.user.username],
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  return { editProfileMutation };
}
