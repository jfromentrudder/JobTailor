"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ExtensionConnectPage() {
  const [status, setStatus] = useState<"loading" | "done" | "error">("loading");

  useEffect(() => {
    async function connect() {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setStatus("error");
        return;
      }
      window.postMessage(
        {
          type: "JOBTAILOR_AUTH",
          accessToken: session.access_token,
          refreshToken: session.refresh_token,
        },
        "*"
      );
      setStatus("done");
    }
    connect();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-gray-200 max-w-sm">
        {status === "loading" && (
          <>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Connecting extension...</p>
          </>
        )}
        {status === "done" && (
          <>
            <div className="text-green-600 text-4xl mb-4">&#10003;</div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Extension Connected</h2>
            <p className="text-gray-500">You can close this tab and start using JobTailor.</p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="text-red-600 text-4xl mb-4">&#10007;</div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Connection Failed</h2>
            <p className="text-gray-500">Please log in first, then try connecting again.</p>
            <a
              href="/login?extension=true"
              className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Go to Login
            </a>
          </>
        )}
      </div>
    </div>
  );
}
