/* src/components/ImageUploadOCR.jsx */
import React, { useState } from "react";
import { parseProductFromImage } from "../services/aiService";

const ImageUploadOCR = ({ onDataExtracted }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);

  // Handle image selection
  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("❌ Please select an image file (PNG, JPG, WebP, etc.)");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("❌ Image is too large. Please select an image under 5MB.");
      return;
    }

    setSelectedImage(file);

    // Show preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Extract product data from image using Gemini Vision
  const handleExtractFromImage = async () => {
    if (!selectedImage) {
      alert("Please select an image first.");
      return;
    }

    setIsExtracting(true);
    console.log("🔍 Starting image OCR...");

    try {
      const extractedData = await parseProductFromImage(selectedImage);

      if (extractedData) {
        console.log("✅ Successfully extracted:", extractedData);
        
        // Show what was extracted
        const summary = `
          📦 Product: ${extractedData.identity?.name || "N/A"}
          💰 Price: ${extractedData.pricing?.selling_price ?? extractedData.pricing?.discount_price ?? "N/A"} tk
          📊 Qty: ${extractedData.inventory?.quantity ?? "N/A"}
          🎨 Color: ${extractedData.variant?.color || "N/A"}
          📂 Category: ${extractedData.classification?.category || "N/A"}
        `;
        console.log(summary);

        // Pass data to parent component
        if (onDataExtracted) {
          onDataExtracted(extractedData);
        }

        // Reset form
        setSelectedImage(null);
        setImagePreview(null);
        alert("✅ Image processed! Form fields updated.");
      } else {
        alert("❌ Could not extract data from image. Try a clearer photo.");
      }
    } catch (error) {
      console.error("OCR Error:", error);
      alert("❌ Image processing failed: " + error.message);
    } finally {
      setIsExtracting(false);
    }
  };

  // Clear selected image
  const handleClearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl mb-6 border border-blue-100 relative overflow-hidden">
      <div className="absolute top-0 right-0 bg-blue-200 text-blue-800 text-[10px] font-bold px-2 py-1 rounded-bl-lg">
        IMAGE OCR
      </div>

      <label className="block text-sm font-bold text-blue-700 mb-3">
        📷 Extract from Product Image
      </label>

      {/* File Input */}
      <div className="mb-4">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          disabled={isExtracting}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600 disabled:opacity-50"
        />
        <p className="text-xs text-gray-500 mt-1">📤 Supports PNG, JPG, WebP (max 5MB)</p>
      </div>

      {/* Image Preview */}
      {imagePreview && (
        <div className="mb-4 relative">
          <div className="border-2 border-blue-300 rounded-lg overflow-hidden bg-white p-2">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-40 object-contain rounded"
            />
          </div>
          <div className="text-xs text-gray-600 mt-2">
            ✅ Image selected and ready for OCR
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleExtractFromImage}
          disabled={!selectedImage || isExtracting}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
        >
          {isExtracting ? (
            <>
              <span className="animate-spin">⚙️</span>
              Extracting...
            </>
          ) : (
            <>🔍 Extract with AI</>
          )}
        </button>

        {imagePreview && (
          <button
            onClick={handleClearImage}
            disabled={isExtracting}
            className="bg-gray-400 text-white px-4 py-2 rounded-lg font-bold hover:bg-gray-500 transition shadow-md disabled:opacity-50"
          >
            ✕ Clear
          </button>
        )}
      </div>

      {/* Help Text */}
      <div className="text-xs text-gray-600 mt-3 p-3 bg-white rounded border border-gray-200">
        <strong>💡 Tips for best results:</strong>
        <ul className="list-disc list-inside mt-1 space-y-1">
          <li>Use clear, well-lit photos of product labels or packaging</li>
          <li>Ensure text is readable (not blurry or too small)</li>
          <li>Include price tags, brand names, and quantity information</li>
          <li>Works with product photos, invoices, and supplier messages</li>
        </ul>
      </div>
    </div>
  );
};

export default ImageUploadOCR;
