const loginWithProvider = async (provider) => {
    setLoading(true);
    setError("");
    
    // Define options specifically for Google to force account selection
    const authOptions = {
      redirectTo: window.location.origin,
    };

    if (provider === 'google') {
      authOptions.queryParams = {
        prompt: 'select_account',
      };
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: authOptions,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };
