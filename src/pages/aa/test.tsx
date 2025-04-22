import LoadingIcon from "@/components/Base/LoadingIcon";
import { API_URL } from "@/constants";
import configApi from "@/services/api";
import { authentification } from "@/services/auth";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { useState } from "react";

export default function Test() {

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8000/api/auth/google/redirect";
  };

  return (
    <div>
      <button onClick={handleGoogleLogin}>Se connecter avec Google</button>
    </div>
  );
}
