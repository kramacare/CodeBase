import React from "react";

const NoHeaderLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen">
      {/* Page Content */}
      {children}
    </div>
  );
};

export default NoHeaderLayout;
