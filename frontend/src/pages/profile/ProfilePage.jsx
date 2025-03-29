import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

import Posts from "../../components/common/Posts";
import ProfileHeaderSkeleton from "../../components/skeletons/ProfileHeaderSkeleton";
import EditProfileModal from "./EditProfileModal";

import { FaArrowLeft } from "react-icons/fa6";
import { IoCalendarOutline } from "react-icons/io5";
import { FaLink } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { useLikedPosts, usePost } from "../../hooks/usePost";
import {
  useCurrentUserProfile,
  useFollowUnfollowUser,
  useUserProfile,
} from "../../hooks/useUserProfile";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { editImgProfile } from "../../api/users/users";
import toast from "react-hot-toast";
import LoadingSpinner from "../../components/common/LoadingSpinner";

import { useInView } from "react-intersection-observer";

const ProfilePage = () => {
  const { username } = useParams();
  const { ref, inView } = useInView({ threshold: 0.5 });

  const [coverImg, setCoverImg] = useState(null);
  const [profileImg, setProfileImg] = useState(null);
  const [feedType, setFeedType] = useState("posts");

  const [selectedImgCoverFile, setSelectedImgCoverFile] = useState(null);
  const [selectedImgProfileFile, setSelectedImgProfileFile] = useState(null);
  const coverImgRef = useRef(null);
  const profileImgRef = useRef(null);

  const { meQuery } = useUserProfile();
  const me = meQuery?.data?.data?.user?.username;

  const { userPofileQuery } = useCurrentUserProfile({ username });
  const profileUsername = userPofileQuery.data?.data?.profile?.username;

  const { getAllLikedPostsPerPage } = useLikedPosts({
    username,
    userPofileQuery,
  });

  const { postsUserPerPage } = usePost();

  const isForYouFeed = feedType === "posts";

  const postsQuery = isForYouFeed ? postsUserPerPage : getAllLikedPostsPerPage;
  const isLoading = postsQuery?.isLoading;
  const hasNextPage = postsQuery?.hasNextPage;
  const fetchNextPage = postsQuery?.fetchNextPage;
  const isFetchingNextPage = postsQuery?.isFetchingNextPage;
  const allLikedPosts =
    postsQuery?.data?.pages?.flatMap((page) => page.data.likedPosts) || [];

  const allPosts =
    postsQuery?.data?.pages?.flatMap((page) => page.data.posts) || [];

  const postsData = isForYouFeed ? allPosts : allLikedPosts;

  const { followUnfollowUserMutation } = useFollowUnfollowUser({
    profileUsername: username,
    loginUsername: me,
  });

  const queryClient = useQueryClient();
  const editProfileImgMutation = useMutation({
    mutationFn: editImgProfile,
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

  const profile =
    profileUsername === me
      ? meQuery?.data?.data?.user
      : userPofileQuery?.data?.data?.profile;

  const isMyProfile = meQuery?.data?.data?.user?.username === profile?.username;

  function handleFollowUnfollowUser(userId) {
    followUnfollowUserMutation.mutate(userId);
  }

  function handleEditProfile() {
    const formData = new FormData();

    if (selectedImgCoverFile) formData.append("coverImg", selectedImgCoverFile);
    if (selectedImgProfileFile)
      formData.append("profileImg", selectedImgProfileFile);

    console.log(formData.get("coverImg")); // Debugging (remove in production)

    editProfileImgMutation.mutate(formData);
  }

  const handleImgChange = (e, state) => {
    const file = e.target.files?.[0]; // Safe access

    if (!file) return;

    const isCover = state === "coverImg";
    const isProfile = state === "profileImg";

    if (isCover) setSelectedImgCoverFile(file);
    if (isProfile) setSelectedImgProfileFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      if (isCover) setCoverImg(reader.result);
      if (isProfile) setProfileImg(reader.result);
    };

    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage]);

  return (
    <>
      <div className="flex-[4_4_0]  border-r border-gray-700 min-h-screen ">
        {/* HEADER */}
        {isLoading && <ProfileHeaderSkeleton />}
        {!isLoading && !profile && (
          <p className="text-center text-lg mt-4">User not found</p>
        )}
        <div className="flex flex-col">
          {!isLoading && profile && (
            <>
              <div className="flex gap-10 px-4 py-2 items-center">
                <Link to="/">
                  <FaArrowLeft className="w-4 h-4" />
                </Link>
                <div className="flex flex-col">
                  <p className="font-bold text-lg">{profile.fullName}</p>
                  <span className="text-sm text-slate-500">
                    {postsData?.data?.posts?.length} posts
                  </span>
                </div>
              </div>
              {/* COVER IMG */}
              <div className="relative group/cover">
                <img
                  src={coverImg || profile.coverImg || "/cover.png"}
                  className="h-52 w-full object-cover"
                  alt="cover image"
                />
                {isMyProfile && (
                  <div
                    className="absolute top-2 right-2 rounded-full p-2 bg-gray-800 bg-opacity-75 cursor-pointer opacity-0 group-hover/cover:opacity-100 transition duration-200"
                    onClick={() => coverImgRef.current.click()}
                  >
                    <MdEdit className="w-5 h-5 text-white" />
                  </div>
                )}

                <input
                  type="file"
                  hidden
                  ref={coverImgRef}
                  onChange={(e) => handleImgChange(e, "coverImg")}
                />
                <input
                  type="file"
                  hidden
                  ref={profileImgRef}
                  onChange={(e) => handleImgChange(e, "profileImg")}
                />
                {/* USER AVATAR */}
                <div className="avatar absolute -bottom-16 left-4">
                  <div className="w-32 rounded-full relative group/avatar">
                    <img
                      src={
                        profileImg ||
                        profile.profileImg ||
                        "/avatar-placeholder.png"
                      }
                    />
                    <div className="absolute top-5 right-3 p-1 bg-primary rounded-full group-hover/avatar:opacity-100 opacity-0 cursor-pointer">
                      {isMyProfile && (
                        <MdEdit
                          className="w-4 h-4 text-white"
                          onClick={() => profileImgRef.current.click()}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end px-4 mt-5">
                {isMyProfile && <EditProfileModal />}
                {!isMyProfile && (
                  <button
                    className="btn btn-outline rounded-full btn-sm"
                    onClick={() => handleFollowUnfollowUser(profile._id)}
                  >
                    {meQuery?.data?.data?.user?.following.includes(profile._id)
                      ? "Following"
                      : "Follow"}
                  </button>
                )}
                {(coverImg || profileImg) && (
                  <button
                    className="btn btn-primary rounded-full btn-sm text-white px-4 ml-2"
                    onClick={handleEditProfile}
                  >
                    {editProfileImgMutation.isPending ? (
                      <LoadingSpinner />
                    ) : (
                      "Update"
                    )}
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-4 mt-14 px-4">
                <div className="flex flex-col">
                  <span className="font-bold text-lg">
                    {userPofileQuery?.data?.data?.profile?.fullName}
                  </span>
                  <span className="text-sm text-slate-500">
                    @{meQuery?.data?.data?.user?.username}
                  </span>
                  <span className="text-sm my-1">{profile?.bio}</span>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {profile?.link && (
                    <div className="flex gap-1 items-center ">
                      <>
                        <FaLink className="w-3 h-3 text-slate-500" />
                        <a
                          href="https://youtube.com/@asaprogrammer_"
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-blue-500 hover:underline"
                        >
                          youtube.com/@asaprogrammer_
                        </a>
                      </>
                    </div>
                  )}
                  <div className="flex gap-2 items-center">
                    <IoCalendarOutline className="w-4 h-4 text-slate-500" />
                    <span className="text-sm text-slate-500">
                      Joined July 2021
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex gap-1 items-center">
                    <span className="font-bold text-xs">
                      {profile?.following.length}
                    </span>
                    <span className="text-slate-500 text-xs">Following</span>
                  </div>
                  <div className="flex gap-1 items-center">
                    <span className="font-bold text-xs">
                      {profile?.followers.length}
                    </span>
                    <span className="text-slate-500 text-xs">Followers</span>
                  </div>
                </div>
              </div>
              <div className="flex w-full border-b border-gray-700 mt-4">
                <div
                  className="flex justify-center flex-1 p-3 hover:bg-secondary transition duration-300 relative cursor-pointer"
                  onClick={() => setFeedType("posts")}
                >
                  Posts
                  {feedType === "posts" && (
                    <div className="absolute bottom-0 w-10 h-1 rounded-full bg-primary" />
                  )}
                </div>
                <div
                  className="flex justify-center flex-1 p-3 text-slate-500 hover:bg-secondary transition duration-300 relative cursor-pointer"
                  onClick={() => setFeedType("likes")}
                >
                  Likes
                  {feedType === "likes" && (
                    <div className="absolute bottom-0 w-10  h-1 rounded-full bg-primary" />
                  )}
                </div>
              </div>
            </>
          )}

          <Posts isLoading={isLoading} posts={postsData} />
        </div>

        <div className="flex justify-center items-center h-8" ref={ref}>
          {isFetchingNextPage && <LoadingSpinner />}
          {!hasNextPage && <p>No more posts</p>}
        </div>
      </div>
    </>
  );
};
export default ProfilePage;
