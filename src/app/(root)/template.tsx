import React from "react";

const RootTemplate = ({ children }: { children: React.ReactNode }) => {
  return <div className="route-transition">{children}</div>;
};

export default RootTemplate;
