import React from "react";
import QRCode from "react-qr-code";
import Barcode from "react-barcode";

interface ProductLabelProps {
  type: "qr" | "barcode";
  value: string;
  label: string;
  humanReadable?: string;
  price?: number;
}

export const ProductLabel: React.FC<ProductLabelProps> = ({
  type,
  value,
  label,
  humanReadable,
  price,
}) => {
  return (
    <div
      className="flex flex-col items-center justify-between border border-black bg-white text-black break-inside-avoid"
      style={{
        width: "50mm",
        height: "30mm",
        padding: "2mm",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <div className="w-full text-center truncate text-[9px] font-bold leading-none">
        {label}
      </div>

      <div className="flex flex-1 items-center justify-center w-full overflow-hidden my-0.5">
        {type === "qr" ? (
          <div style={{ width: "16mm", height: "16mm" }}>
            <QRCode
              value={value}
              size={256}
              style={{ height: "100%", width: "100%" }}
              viewBox={`0 0 256 256`}
            />
          </div>
        ) : (
          <Barcode
            value={value}
            width={1}
            height={25}
            fontSize={8}
            margin={0}
            displayValue={false}
          />
        )}
      </div>

      <div className="w-full flex justify-between items-end leading-none">
        <span className="text-[8px] font-mono truncate max-w-[70%]">
          {humanReadable || value}
        </span>
        {price !== undefined && (
          <span className="text-[9px] font-bold">${price.toFixed(2)}</span>
        )}
      </div>
    </div>
  );
};
