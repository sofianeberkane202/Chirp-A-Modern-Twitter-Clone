import { useQuery } from "@tanstack/react-query";
import { getMe } from "../api/auth/user";

function useUserProfile() {
  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    staleTime: 30 * 600 * 1000,
  });

  return { meQuery };
}

export default useUserProfile;
