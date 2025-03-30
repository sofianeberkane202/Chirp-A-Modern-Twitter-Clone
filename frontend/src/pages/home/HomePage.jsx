import { useEffect, useRef, useState } from "react";
import Posts from "../../components/common/Posts";
import CreatePost from "./CreatePost";
import { usePost } from "../../hooks/usePost";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const HomePage = () => {
  const [feedType, setFeedType] = useState("forYou");
  const observerRef = useRef(null);

  const { getFollowingPostsPerPage, getPostsPerPage } = usePost();

  const isForYouFeed = feedType === "forYou";
  const postsQuery = isForYouFeed ? getPostsPerPage : getFollowingPostsPerPage;

  const postsData =
    postsQuery?.data?.pages?.flatMap((page) => page.data.posts) || [];
  const isLoading = postsQuery?.isLoading;
  const hasNextPage = postsQuery?.hasNextPage;
  const isFetchingNextPage = postsQuery?.isFetchingNextPage;

  // Infinite Scroll Observer
  useEffect(() => {
    if (!observerRef.current || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          postsQuery.fetchNextPage();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(observerRef.current);

    return () => observer.disconnect();
  }, [feedType, hasNextPage, isFetchingNextPage, postsQuery]);

  return (
    <div className="w-full mr-auto border-r border-gray-700 min-h-screen">
      {/* Header */}
      <div className="flex w-full border-b border-gray-700">
        {["forYou", "following"].map((type) => (
          <div
            key={type}
            className={`flex justify-center flex-1 p-3 hover:bg-secondary transition duration-300 cursor-pointer relative ${
              feedType === type ? "font-bold" : ""
            }`}
            onClick={() => setFeedType(type)}
          >
            {type === "forYou" ? "For You" : "Following"}
            {feedType === type && (
              <div className="absolute bottom-0 w-10 h-1 rounded-full bg-primary"></div>
            )}
          </div>
        ))}
      </div>

      {/* Create Post */}
      <CreatePost />

      {/* Posts */}
      <Posts isLoading={isLoading} posts={postsData} />

      {/* Infinite Scroll Loader */}
      <div
        className="flex justify-center items-center py-2 h-8 "
        ref={observerRef}
      >
        {!hasNextPage && <p>No more posts</p>}
        {isFetchingNextPage && <LoadingSpinner />}
      </div>
    </div>
  );
};

export default HomePage;
