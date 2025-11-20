import React from "react";

interface PreviewAreaProps {
  background: "white" | "black";
  children: React.ReactNode;
}

const PreviewArea: React.FC<PreviewAreaProps> = ({ background, children }) => {
  // Larger preview: 1100px max, 95vw/vh for more space
  return (
    <div
      style={{
        background: background,
        width: "min(95vw, 95vh, 1100px)",
        height: "min(95vw, 95vh, 1100px)",
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "2px solid #000",
        transition: "background 0.3s",
        paddingLeft: 16,
        paddingRight: 16
      }}
      className="rounded-lg shadow-lg mb-6"
    >
      {children}
    </div>
  );
};

export default PreviewArea;
