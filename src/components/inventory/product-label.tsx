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
      className="flex flex-col items-center justify-center border border-black p-1 bg-white text-black break-inside-avoid"
      style={{
        width: "50mm",
        height: "30mm",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <div className="w-full text-center truncate text-[10px] font-bold leading-tight mb-0.5 px-1">
        {label}
      </div>

      <div className="flex-1 flex items-center justify-center overflow-hidden w-full">
        {type === "qr" ? (
          <div style={{ height: "18mm", width: "18mm" }}>
            <QRCode
              value={value}
              size={256}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              viewBox={`0 0 256 256`}
            />
          </div>
        ) : (
          <Barcode
            value={value}
            width={1.2}
            height={30}
            fontSize={9}
            margin={0}
            displayValue={false}
          />
        )}
      </div>

      <div className="w-full flex justify-between items-end px-1 mt-0.5">
        <span className="text-[9px] font-mono truncate max-w-[70%]">
          {humanReadable || value}
        </span>
        {price !== undefined && (
          <span className="text-[10px] font-bold">${price.toFixed(2)}</span>
        )}
      </div>
    </div>
  );
};
