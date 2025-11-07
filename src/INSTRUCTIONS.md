# Step-by-Step Guide to Add Your API Key

This guide will walk you through adding the `GEMINI_API_KEY` to your project's secret manager in the Firebase Console. This is the final step to make the AI assistant fully functional.

## Step 1: Get Your API Key

1.  Open this link in a new tab: [**makersuite.google.com/app/apikey**](https://makersuite.google.com/app/apikey)
2.  Click **"Create API key"**.
3.  **Copy** the generated key to your clipboard.

---

## Step 2: Add the Secret in Firebase

This process tells your application where to find the secret API key when it's deployed.

1.  **Open the Firebase Console** and select your project: **`studio-6760528828`**.
2.  In the left-hand navigation menu, find the **"Build"** section and click on **"App Hosting"**.
3.  Find and click on your backend, which is named **`studio--studio-6760528828-de739`**.
4.  Click on the **"Settings"** tab.
5.  You should see a section titled **"Secret environment variables"**. Click the **"Add secret"** button.
    *   **Name:** `GEMINI_API_KEY`
    *   **Secret:** Paste the API key you copied in Step 1.
6.  Click **"Create"** and then **"Save changes"**.

---

## Step 3: Final Publish

After you have successfully added the secret and saved the changes in the Firebase Console, return to Firebase Studio.

Click the **"Publish now"** button one last time. This makes the secret available to your live application.
