import {
  inferAdditionalFields,
  customSessionClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  fetchOptions: { credentials: "include" },
  plugins: [
    inferAdditionalFields({
      user: {
        firstName: { type: "string" },
        lastName: { type: "string" },
        isAgreedToTerms: { type: "boolean" },
        isAgreedToPrivacyPolicy: { type: "boolean" },
      },
    }),
    customSessionClient(),
  ],
});
