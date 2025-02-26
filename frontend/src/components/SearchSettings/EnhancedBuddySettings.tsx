import React, { useState } from "react";
import { X } from "lucide-react";
import { ProjectsSection } from "./ProjectsSection";
import type { EnhancedBuddySettingsProps } from "./types";
import {
  COMMON_INTERESTS,
  //ROLES,
  //COLLABORATION_TYPES,
} from "./constants";

const EnhancedBuddySettings: React.FC<EnhancedBuddySettingsProps> = ({
  settings,
  onChange,
}) => {
  const [techInput, setTechInput] = useState("");

  const handleTechAdd = (tech: string) => {
    if (!settings.interests.includes(tech)) {
      onChange({
        ...settings,
        interests: [...settings.interests, tech],
      });
    }
    setTechInput("");
  };

  const handleTechRemove = (tech: string) => {
    onChange({
      ...settings,
      interests: settings.interests.filter((t) => t !== tech),
    });
  };

  return (
    <div className="space-y-8">
      {/* Interests */}
      <div className="space-y-4">
        <label className="block text-[#b085f5] text-sm font-medium">
          Technologies & Languages
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {settings.interests.map((tech) => (
            <div
              key={tech}
              className="bg-[#383850] text-white px-3 py-1 rounded-full flex items-center gap-2"
            >
              {tech}
              <button
                onClick={() => handleTechRemove(tech)}
                className="hover:text-red-400"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={techInput}
            onChange={(e) => setTechInput(e.target.value)}
            className="flex-1 p-3 bg-[#1a1b26] text-white border border-[#383850] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b085f5]"
            placeholder="Type to add custom technology..."
          />
          <button
            onClick={() => techInput && handleTechAdd(techInput)}
            className="px-4 py-2 bg-[#b085f5] text-white rounded-lg hover:bg-[#9065d8]"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {COMMON_INTERESTS.map((tech) => (
            <button
              key={tech}
              onClick={() => handleTechAdd(tech)}
              className="px-3 py-1 bg-[#1a1b26] text-[#b085f5] border border-[#383850] rounded-full hover:bg-[#383850]"
            >
              {tech}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Section */}
      <ProjectsSection settings={settings} onChange={onChange} />

    </div>
  );
};

export default EnhancedBuddySettings;