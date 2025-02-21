import React from "react";
import AccountSettings from "@/components/AccountSetting";
import { getCurrentUser } from "@/lib/action/user.action";

const Page = async () => {
  const currentUser = await getCurrentUser();
  return (
    <div className="">
      <AccountSettings {...currentUser} />
    </div>
  );
};

export default Page;
