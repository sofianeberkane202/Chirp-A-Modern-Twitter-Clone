import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteNotifications, fetchNotifications } from "../api/notification";
import { toast } from "react-hot-toast";

export function useNotification() {
  const queryClient = useQueryClient();
  const notificationsQuery = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    staleTime: 10 * 60 * 1000,
  });

  const deleteNotificationsMutation = useMutation({
    mutationFn: deleteNotifications,

    onMutate: () => {
      queryClient.cancelQueries({ queryKey: ["notifications"] });
      const previousNotifications = queryClient.getQueryData(["notifications"]);
      queryClient.setQueryData(["notifications"], []);
      return { previousNotifications };
    },
    onSuccess: () => {
      toast.success("All notifications deleted");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error, _, context) => {
      if (!context) return;
      if (context?.previousNotifications) {
        queryClient.setQueryData(
          ["notifications"],
          context.previousNotifications
        );
      }
      toast.error(error.message);
    },
  });

  return { notificationsQuery, deleteNotificationsMutation };
}
