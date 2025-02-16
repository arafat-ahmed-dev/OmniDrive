"use server";

import { createAdminClient } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/appwrite/config";

import { Query, Models, ID } from "node-appwrite";
import { parseStringify } from "@/lib/utils";

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

const sendEmailOTP = async (email: string) => {
  const { account } = await createAdminClient();
  try {
    const session = await account.createEmailToken(ID.unique(), email);
    return session.userId;
  } catch (e) {
    handleError(e, "Error creating email token");
    return null; // Return null to indicate failure. Handle the error in the createAccount function
  }
};

// export const createAccount = async ({
//   fullName,
//   email,
// }: {
//   fullName: string;
//   email: string;
// }) => {
//   // Check if a user with this email already exists
//   const existingUser = await getUserByEmail({ email });
//
//   // Send an OTP to the user's email and retrieve an account ID
//   const accountId = await sendEmailOTP(email);
//   if (!accountId) {
//     throw new Error("Failed to send email OTP");
//   }
//
//   if (!existingUser) {
//     const { databases } = await createAdminClient();
//     await databases.createDocument(
//       appwriteConfig.databaseId,
//       appwriteConfig.usersCollectionId,
//       ID.unique(),
//       {
//         fullName,
//         email,
//         avatar:
//           "https://e7.pngegg.com/pngimages/799/987/png-clipart-computer-icons-avatar-icon-design-avatar-heroes-computer-wallpaper-thumbnail.png",
//         accountId,
//       },
//     );
//   }
//   return parseStringify({ accountId });
// };
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
        avatar:
          "https://e7.pngegg.com/pngimages/799/987/png-clipart-computer-icons-avatar-icon-design-avatar-heroes-computer-wallpaper-thumbnail.png",
        accountId,
      },
    );
  }

  return parseStringify({ accountId });
};
