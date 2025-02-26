import React from "react";

interface DistancePreferenceProps {
  locationType: "remote" | "local";
  maxDistancePreference: number;
  onChange: (locationType: "remote" | "local", maxDistancePreference: number) => void;
}

const DistancePreference: React.FC<DistancePreferenceProps> = ({
  locationType,
  maxDistancePreference,
  onChange,
}) => {
  return (
    <div>
      <h3>Location Preferences</h3>
      <label>
        <input
          type="radio"
          value="remote"
          checked={locationType === "remote"}
          onChange={() => onChange("remote", maxDistancePreference)}
        />
        Remote
      </label>
      <label>
        <input
          type="radio"
          value="local"
          checked={locationType === "local"}
          onChange={() => onChange("local", maxDistancePreference)}
        />
        Local
      </label>
      {locationType === "local" && (
        <div>
          <label>
            Max Distance Preference (km):
            <input
              type="number"
              value={maxDistancePreference}
              onChange={(e) => onChange(locationType, parseInt(e.target.value))}
            />
          </label>
        </div>
      )}
    </div>
  );
};

export default DistancePreference;