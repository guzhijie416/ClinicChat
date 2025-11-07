# Step-by-Step Guide to Add Your API Key

This guide will walk you through adding the `GEMINI_API_KEY` to your project's secret manager in the Firebase Console. This is the final step to make the AI assistant fully functional.

## Step 1: Get Your API Key

1.  Open this link in a new tab: [**makersuite.google.com/app/apikey**](https://makersuite.google.com/app/apikey)
2.  Click **"Create API key"**.
3.  **Copy** the generated key to your clipboard.

---

## Step 2: Find the Secret Manager in Firebase

The Firebase Console may have changed, so let's try a more direct route.

1.  **Open the Firebase Console** and make sure you are in the correct project: **`studio-6760528828`**.

2.  In the left-hand navigation menu, find the **"Build"** section.

3.  Click on **"App Hosting"**. This will take you to the main App Hosting dashboard.

4.  You will see a table listing your backends. Find and click on your backend, which is named **`studio--studio-6760528828-de739`**.

5.  This is the critical step. After clicking on your backend, you should see a new page with tabs at the top. The first tab is usually "Dashboard". Look for a tab named **"Settings"**. Click on it.
    *   *If you do not see a "Settings" tab*, please look carefully around the page for any mention of "Secrets", "Environment variables", or "Configuration".

6.  Inside the **"Settings"** tab, scroll down until you find a section titled **"Secret environment variables"**.

7.  Click the **"Add secret"** button.
    *   **Name:** `GEMINI_API_KEY`
    *   **Secret:** Paste the API key you copied in Step 1.

8.  Click **"Create"** and then **"Save changes"**.

---

## Step 3: Final Publish

After you have successfully added the secret and saved the changes in the Firebase Console, return to Firebase Studio.

Click the **"Publish now"** button one last time. This makes the secret available to your live application.

After this, the AI chat should work correctly. If you still see an error, it means the secret was not saved correctly. Please double-check the steps above, paying close attention to the backend ID and secret name.
