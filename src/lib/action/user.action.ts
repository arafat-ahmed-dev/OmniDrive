"use server";

import { createAdminClient, createSessionClient } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/appwrite/config";
import { Query, Models, ID } from "node-appwrite";
import { parseStringify } from "@/lib/utils";
import { cookies } from "next/headers";
import { avatarPlaceholderUrl } from "@/constants";
import { redirect } from "next/navigation";

const getUserByEmail = async ({
  email,
}: {
  email: string;
}): Promise<Models.Document | null> => {
  try {
    const { databases } = await createAdminClient();
    const result = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      [Query.equal("email", email)],
    );

    if (result.total > 1) {
      console.warn(
        `Multiple users found with email ${email}. Returning the first one.`,
      );
    }

    return result.total > 0 ? result.documents[0] : null;
  } catch (error) {
    console.error("Error fetching user by email:", error);
    return null;
  }
};

const handleError = (error: unknown, message: string) => {
  console.log(error, message);
  throw error;
};

export const sendEmailOTP = async (email: string) => {
  const { account } = await createAdminClient();
  try {
    const session = await account.createEmailToken(ID.unique(), email);
    return session.userId;
  } catch (e) {
    handleError(e, "Error creating email token");
    return null; // Return null to indicate failure. Handle the error in the createAccount function
  }
};

export const createAccount = async ({
  fullName,
  email,
}: {
  fullName: string;
  email: string;
}) => {
  const existingUser = await getUserByEmail({ email });

  const accountId = await sendEmailOTP(email);
  if (!accountId) throw new Error("Failed to send an OTP");

  if (!existingUser) {
    const { databases } = await createAdminClient();

    await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      ID.unique(),
      {
        fullName,
        email,
        avatar: avatarPlaceholderUrl,
        accountId,
      },
    );
  }

  return parseStringify({ accountId });
};

export const verifySecret = async ({
  accountId,
  password,
}: {
  accountId: string;
  password: string;
}) => {
  try {
    const { account } = await createAdminClient();
    const session = await account.createSession(accountId, password);
    (await cookies()).set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });

    return parseStringify(session.$id);
  } catch (e) {
    handleError(e, "Failed to verify OTP");
  }
};
// fetch the current user
export const getCurrentUser = async () => {
  try {
    const { databases, account } = await createSessionClient();
    if (!account || !databases) return null;
    const result = await account.get();

    const user = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      [Query.equal("accountId", result.$id)],
    );

    if (user.total <= 0) return null;

    return parseStringify(user.documents[0]);
  } catch (error) {
    console.log(error);
  }
};
export const signOutUser = async () => {
  const { account } = await createSessionClient();

  try {
    await account.deleteSession("current");
    (await cookies()).delete("appwrite-session");
  } catch (error) {
    handleError(error, "Failed to sign out user");
  } finally {
    redirect("/sign-in");
  }
};

export const signInUser = async ({ email }: { email: string }) => {
  try {
    const existingUser = await getUserByEmail({ email });
    console.log(existingUser);
    // User exists, send OTP
    if (existingUser) {
      await sendEmailOTP(email);
      return parseStringify({ accountId: existingUser.accountId });
    }

    return parseStringify({ accountId: null, error: "User not found" });
  } catch (error) {
    handleError(error, "Failed to sign in user");
  }
};

export const updateUserDocument = async ({
  accountId,
  fullName,
  avatar,
  location,
  city,
  phoneNumber,
  sex,
}: {
  accountId: string;
  fullName?: string;
  avatar?: string;
  location?: string;
  city?: string;
  phoneNumber?: number;
  sex?: "male" | "female";
}) => {
  try {
    if (!accountId) {
      throw new Error("accountId is missing"); // Validate input early
    }
    const { databases } = await createSessionClient(); // Use session client for authenticated updates

    const user = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      [Query.equal("accountId", accountId || "")],
    );

    if (user.total <= 0) {
      throw new Error("User not found");
    }

    const userId = user.documents[0].$id;

    // Create data object for update. Only include fields that are being updated.
    const data: {
      fullName?: string;
      avatar?: string;
      location?: string; // Fixed typo here
      city?: string;
      phoneNumber?: number;
      sex?: "male" | "female";
    } = {};

    if (fullName !== undefined) {
      data.fullName = fullName;
    }
    if (avatar !== undefined) {
      data.avatar = avatar;
    }
    if (location !== undefined) {
      data.location = location;
    }
    if (city !== undefined) {
      data.city = city;
    }
    if (phoneNumber !== undefined) {
      data.phoneNumber = parseInt(String(phoneNumber));
    }
    if (sex !== undefined) {
      data.sex = sex;
    }

    // Update the document
    const updatedUser = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      userId,
      data,
    );

    return parseStringify(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error); // Log the error for debugging
    throw error; // Re-throw the error to be handled by the caller
  }
};
