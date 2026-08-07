"use client";
import React, { useEffect } from "react";
import { userManager } from "../../../lib/oidc";

export default function AuthCallback() {
  useEffect(() => {
    userManager.signinRedirectCallback()
      .then(() => { window.location.replace("/"); })
      .catch(() => { window.location.replace("/"); });
  }, []);
  return <p style={{ padding: 24 }}>Iniciando sesión…</p>;
}
