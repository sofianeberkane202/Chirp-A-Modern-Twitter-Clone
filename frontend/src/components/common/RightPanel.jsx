import { Link } from "react-router-dom";
import RightPanelSkeleton from "../skeletons/RightPanelSkeleton";
import { USERS_FOR_RIGHT_PANEL } from "../../utils/db/dummy";
import { useQuery } from "@tanstack/react-query";
import { getSuggestedUsers } from "../../api/users/users";
import {
  useFollowUnfollowUser,
  useUserProfile,
} from "../../hooks/useUserProfile";

const RightPanel = () => {
  // const isLoading = false;

  const getSeggestedUserQuery = useQuery({
    queryKey: ["suggested-users"],
    queryFn: getSuggestedUsers,
    staleTime: 20 * 60 * 1000,
  });

  const { meQuery } = useUserProfile();

  return (
    <div className="hidden lg:block my-4 mx-2">
      <div className="bg-[#16181C] p-4 rounded-md sticky top-2">
        <p className="font-bold">Who to follow</p>
        <div className="flex flex-col gap-4">
          {/* item */}
          {getSeggestedUserQuery.isLoading && (
            <>
              <RightPanelSkeleton />
              <RightPanelSkeleton />
              <RightPanelSkeleton />
              <RightPanelSkeleton />
            </>
          )}
          {!getSeggestedUserQuery.isLoading &&
            getSeggestedUserQuery.data.data.suggestedUsers?.map((user) => (
              <User key={user._id} user={user} me={meQuery?.data?.data?.user} />
            ))}
        </div>
      </div>
    </div>
  );
};

function User({ user, me }) {
  const { followUnfollowUserMutation } = useFollowUnfollowUser({
    profileUsername: user.username,
    loginUsername: me?.username,
  });

  function handleFollowUnfollowUser(e, userId) {
    e.preventDefault();
    followUnfollowUserMutation.mutate(userId);
  }

  const isFollowed = me?.following.includes(user._id);
  const isMe = me?.username === user?.username;

  return (
    <Link
      to={`/profile/${user.username}`}
      className="flex items-center justify-between gap-4"
      key={user._id}
    >
      <div className="flex gap-2 items-center">
        <div className="avatar">
          <div className="w-8 rounded-full">
            <img src={user.profileImg || "/avatar-placeholder.png"} />
          </div>
        </div>
        <div className="flex flex-col">
          <span className="font-semibold tracking-tight truncate w-28">
            {user.fullName}
          </span>
          <span className="text-sm text-slate-500">@{user.username}</span>
        </div>
      </div>
      <div>
        {!isMe && (
          <button
            className="btn bg-white text-black hover:bg-white hover:opacity-90 rounded-full btn-sm"
            onClick={(e) => handleFollowUnfollowUser(e, user._id)}
          >
            {isFollowed ? "Following" : "Follow"}
          </button>
        )}
      </div>
    </Link>
  );
}

export default RightPanel;
