import { supabase } from "../supabaseClient";

export const useActiveUsersRoom = () => {
  return (userId: string) => {
    const activeUsersRoom = supabase.channel("active_users_room", {
      config: {
        presence: {
          key: userId,
        },
      },
    });

    return activeUsersRoom;
  };
};
