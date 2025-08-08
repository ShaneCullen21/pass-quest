import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthForm } from "@/components/auth/AuthForm";
import { PasswordChangeForm } from "@/components/auth/PasswordChangeForm";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/");
      }
    };

    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Check if this is a password reset flow
  const isPasswordReset = searchParams.get('type') === 'recovery';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-auth-background to-primary/20">
      <div className="w-full max-w-md">
        {isPasswordReset ? <PasswordChangeForm /> : <AuthForm />}
      </div>
    </div>
  );
};

export default Auth;