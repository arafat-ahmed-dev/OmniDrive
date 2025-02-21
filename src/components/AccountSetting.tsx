"use client";

import { useForm } from "react-hook-form";
import Image from "next/image";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { avatarPlaceholderUrl } from "@/constants";
import { useState, useRef } from "react";
import { updateUserDocument } from "@/lib/action/user.action";
import { deleteFile, uploadFile } from "@/lib/action/file.action";

interface FormValues {
  accountId: string;
  fullName: string;
  email: string;
  phoneNumber: number;
  sex: "male" | "female";
  location: string;
  city: string;
}

interface Props {
  $id: string;
  fullName: string;
  avatar: string;
  email: string;
  phoneNumber: number;
  location: string;
  city: string;
  sex: "male" | "female";
  accountId: string;
}

// Holds the persisted avatar details from the database.
interface AvatarData {
  url: string;
  fileId?: string; // Document ID from the file document
  bucketFileId?: string; // File ID in the storage bucket
}

export default function AccountSettings({
  accountId,
  fullName,
  avatar,
  email,
  sex,
  phoneNumber,
  location,
  city,
}: Props) {
  // Whether the form is in edit mode.
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Store the current persisted avatar data.
  const [currentAvatarData, setCurrentAvatarData] = useState<AvatarData>({
    url: avatar || avatarPlaceholderUrl,
  });

  // State to store a pending avatar file and its preview URL.
  const [pendingAvatar, setPendingAvatar] = useState<File | null>(null);
  const [pendingAvatarPreview, setPendingAvatarPreview] = useState<string>("");

  // useRef to trigger the hidden file input.
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    defaultValues: {
      fullName: fullName || "",
      email: email || "",
      phoneNumber: phoneNumber || undefined,
      sex: (sex as "male" | "female") || undefined,
      location: location || "",
      city: city || "",
    },
  });

  // When the user selects a file, set it as pending and generate a temporary preview URL.
  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setPendingAvatar(file);
    setPendingAvatarPreview(previewUrl);
  };

  // Trigger the file selection dialog.
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // When the user clicks Edit/Update, process any pending avatar and update the profile.
  const handleSubmit = async () => {
    // If in edit mode, process updates.
    if (isOpen) {
      setIsLoading(true);
      try {
        let newAvatarUrl = currentAvatarData.url;

        // If a new avatar was selected, upload it.
        if (pendingAvatar) {
          // Optionally delete the old avatar only if it exists and is not the placeholder.
          if (
            currentAvatarData.fileId &&
            currentAvatarData.bucketFileId &&
            currentAvatarData.url !== avatarPlaceholderUrl
          ) {
            await deleteFile({
              fileId: currentAvatarData.fileId,
              bucketFileId: currentAvatarData.bucketFileId,
              path: "avatar",
            });
          }
          // Upload the new avatar.
          const uploadedFile = await uploadFile({
            file: pendingAvatar,
            ownerId: accountId,
            accountId,
            path: "avatar",
          });
          if (uploadedFile) {
            newAvatarUrl = uploadedFile.url;
            console.log(newAvatarUrl);
            // Update the current avatar data with the new file info.
            setCurrentAvatarData({
              url: uploadedFile.url,
              fileId: uploadedFile.$id,
              bucketFileId: uploadedFile.bucketId,
            });
          }
          // Clear the pending avatar since it has been processed.
          setPendingAvatar(null);
          setPendingAvatarPreview("");
        }

        // Get form values and update the user document including the new avatar URL.
        const data = form.getValues();
        await updateUserDocument({ ...data, accountId, avatar: newAvatarUrl });
      } catch (error) {
        console.error("Failed to update user:", error);
      } finally {
        setIsLoading(false);
        setIsOpen(false);
      }
    } else {
      // Toggle into edit mode.
      setIsOpen(true);
    }
  };

  // Optional: Cancel editing and revert the preview to the persisted image.
  const handleCancel = () => {
    setIsOpen(false);
    setPendingAvatar(null);
    setPendingAvatarPreview("");
  };

  return (
    <div>
      <div className="space-y-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Account Settings
        </h1>
        <div className="relative mx-auto w-32 h-32 md:w-48 md:h-48">
          <div className="overflow-hidden rounded-full border-4 border-white shadow-lg">
            {/* Show pending preview if available; otherwise, show the current avatar */}
            <Image
              src={pendingAvatarPreview || currentAvatarData.url}
              alt="Profile picture"
              width={32}
              height={32}
              unoptimized={true}
              className="h-full w-full rounded-full object-cover"
            />
          </div>
          {/* Camera button to trigger file input */}
          {isOpen && (
            <button
              onClick={triggerFileInput}
              className="absolute bottom-0 right-0 rounded-full bg-blue-500 p-2"
            >
              <Image
                src={"/assets/icons/camera.png"}
                alt="Change Profile Picture"
                width={30}
                height={30}
                className="rounded-full cursor-pointer"
              />
            </button>
          )}
          {/* Hidden file input */}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleAvatarSelect}
            style={{ display: "none" }}
          />
        </div>

        <Form {...form}>
          <form
            className="grid gap-6 md:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem className="shad-form-item">
                  <FormLabel className="shad-form-label">Full Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={!isOpen}
                      className="shad-input"
                      {...field}
                      placeholder="Enter your full name"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="shad-form-item">
                  <FormLabel className="shad-form-label">Email</FormLabel>
                  <FormControl>
                    <Input
                      disabled={true}
                      type="email"
                      className="shad-input"
                      {...field}
                      placeholder="Enter your email"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem className="shad-form-item">
                  <FormLabel className="shad-form-label">
                    Phone number
                  </FormLabel>
                  <FormControl>
                    <Input
                      disabled={!isOpen}
                      className="shad-input"
                      {...field}
                      placeholder="Enter your phone number"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sex"
              render={({ field }) => (
                <FormItem className="shad-form-item">
                  <FormLabel className="shad-form-label">Sex</FormLabel>
                  <FormControl>
                    <RadioGroup
                      disabled={!isOpen}
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="male" id="male" />
                        <label htmlFor="male">Male</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="female" id="female" />
                        <label htmlFor="female">Female</label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem className="shad-form-item">
                  <FormLabel className="shad-form-label">Location</FormLabel>
                  <FormControl>
                    <Input
                      disabled={!isOpen}
                      className="shad-input"
                      {...field}
                      placeholder="Enter your location"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem className="shad-form-item">
                  <FormLabel className="shad-form-label">City</FormLabel>
                  <FormControl>
                    <Input
                      disabled={!isOpen}
                      className="shad-input"
                      {...field}
                      placeholder="Enter your city"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="md:col-span-2 flex gap-4">
              <button
                type="button"
                onClick={handleSubmit}
                className="bg-brand hover:bg-red-500 rounded-3xl text-white py-3 px-5 flex items-center gap-1"
              >
                {isOpen ? "Update" : "Edit"}
                {isLoading && (
                  <Image
                    src="/assets/icons/loader.svg"
                    alt="loader"
                    width={24}
                    height={24}
                    className="ml-2 animate-spin"
                  />
                )}
              </button>
              {isOpen && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-red hover:bg-red-500 rounded-3xl text-white py-3 px-5"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
