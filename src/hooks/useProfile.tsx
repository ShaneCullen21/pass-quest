import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface Profile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export const useProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    console.log('useProfile effect triggered', { user: user?.id, initialized, profile: profile?.user_id });
    
    if (!user) {
      console.log('No user, clearing profile');
      setProfile(null);
      setLoading(false);
      setInitialized(true);
      return;
    }

    // Don't refetch if we already have profile data for this user
    if (initialized && profile && profile.user_id === user.id) {
      console.log('Profile already cached, skipping fetch');
      setLoading(false);
      return;
    }

    // Don't fetch if we're already initialized and have no profile (user has no profile record)
    if (initialized && !profile) {
      console.log('Already checked, no profile exists');
      setLoading(false);
      return;
    }

    console.log('Fetching profile data for user:', user.id);

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle(); // Use maybeSingle instead of single to handle missing profiles

        if (error) {
          console.error('Error fetching profile:', error);
          setProfile(null);
        } else {
          setProfile(data);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setProfile(null);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    fetchProfile();
  }, [user?.id]); // FIXED: Only depend on user.id, not the profile state

  return { profile, loading };
};