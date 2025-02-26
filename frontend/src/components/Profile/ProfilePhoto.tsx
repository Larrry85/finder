import React from "react";
import { Camera } from "lucide-react";

interface ProfilePhotoProps {
  previewUrl: string | null;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ProfilePhoto: React.FC<ProfilePhotoProps> = ({
  previewUrl,
  onImageChange,
}) => {
  // Add debugging for previewUrl
  React.useEffect(() => {
    //console.log("PreviewUrl changed:", previewUrl);
  }, [previewUrl]);

  return (
    <div className="mb-8 flex">
      <div className="relative group">
        <div className="w-32 h-32 rounded-full border-4 border-[#b085f5] overflow-hidden bg-[#383850] flex items-center justify-center shadow-lg">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Profile preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error("Image failed to load:", previewUrl);
                console.error("Error event:", e);
                // Optionally show the camera icon if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                const parent = target.parentElement;
                if (parent) {
                  const camera = document.createElement("div");
                  camera.innerHTML =
                    '<svg class="w-12 h-12 text-gray-400">...</svg>';
                  parent.appendChild(camera);
                }
              }}
              onLoad={() => {
                //console.log("Image loaded successfully:", previewUrl);
              }}
            />
          ) : (
            <Camera className="w-12 h-12 text-gray-400" />
          )}
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <label className="cursor-pointer text-white bg-[#b085f5] px-4 py-2 rounded-lg hover:bg-[#c49fff] transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  //console.log("File selected:", e.target.files?.[0]);
                  onImageChange(e);
                }}
                className="hidden"
              />
              Change Photo
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePhoto;
