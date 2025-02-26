import React, { useState } from "react";
import { SearchSettings } from "./types";
import { GOLANG_PROJECTS, JAVASCRIPT_PROJECTS } from "./constants";

interface ProjectsSectionProps {
  settings: SearchSettings;
  onChange: (settings: SearchSettings) => void;
}

const ProjectWithSubProjects: React.FC<{
  project: any;
  settings: SearchSettings;
  projectType: "javascript" | "golang";
  onChange: (newSettings: SearchSettings) => void;
}> = ({ project, settings, projectType, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const projectsList =
    projectType === "javascript"
      ? settings.javascriptProjects || []
      : settings.golangProjects || [];
  const projectKey =
    projectType === "javascript" ? "javascriptProjects" : "golangProjects";

  return (
    <div>
      <div
        className="flex items-center space-x-2 p-3 hover:bg-[#222233] cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-white flex-1">{project.name}</span>
        {project.subProjects && (
          <button
            onClick={(e) => {
              e.preventDefault();
              setIsOpen(!isOpen);
            }}
            className="text-gray-400 hover:text-white"
          >
            {isOpen ? "▼" : "▶"}
          </button>
        )}
      </div>

      {isOpen && project.subProjects && (
        <div className="ml-8 border-l border-[#383850]">
          {project.subProjects.map((sub: any) => (
            <label
              key={sub.id}
              className="flex items-center space-x-2 p-2 hover:bg-[#222233] cursor-pointer"
            >
              <input
                type="checkbox"
                checked={projectsList.some((p) => p.name === sub.name)}
                onChange={(e) => {
                  const newProjects = e.target.checked
                    ? [...projectsList, { name: sub.name, completed: true }]
                    : projectsList.filter((p) => p.name !== sub.name);
                  onChange({ ...settings, [projectKey]: newProjects });
                }}
                className="rounded border-[#383850] text-[#b085f5] focus:ring-[#b085f5]"
              />
              <span className="text-gray-300">{sub.name}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  settings,
  onChange,
}) => {
  const [isGolangOpen, setIsGolangOpen] = useState(false);
  const [isJavaScriptOpen, setIsJavaScriptOpen] = useState(false);

  // Add default empty arrays if the projects are null or undefined
  const golangProjects = settings.golangProjects || [];
  const javascriptProjects = settings.javascriptProjects || [];

  return (
    <div className="space-y-4">
      <label className="block text-[#b085f5] text-sm font-medium">
        Projects
      </label>

      {/* Golang Section */}
      <div className="border border-[#383850] rounded-lg overflow-hidden">
        <button
          onClick={() => setIsGolangOpen(!isGolangOpen)}
          className="w-full p-4 bg-[#1a1b26] text-left flex items-center justify-between hover:bg-[#222233]"
        >
          <span className="font-bold text-white">Golang Tasks</span>
          <span className="text-gray-400">
            {golangProjects.length} selected
          </span>
        </button>

        {isGolangOpen && (
          <div className="border-t border-[#383850]">
            {GOLANG_PROJECTS.map((project) => (
              <ProjectWithSubProjects
                key={project.id}
                project={project}
                settings={{
                  ...settings,
                  golangProjects: golangProjects,
                  javascriptProjects: javascriptProjects,
                }}
                projectType="golang"
                onChange={onChange}
              />
            ))}
          </div>
        )}
      </div>

      {/* JavaScript Section */}
      <div className="border border-[#383850] rounded-lg overflow-hidden">
        <button
          onClick={() => setIsJavaScriptOpen(!isJavaScriptOpen)}
          className="w-full p-4 bg-[#1a1b26] text-left flex items-center justify-between hover:bg-[#222233]"
        >
          <span className="font-bold text-white">JavaScript Tasks</span>
          <span className="text-gray-400">
            {javascriptProjects.length} selected
          </span>
        </button>

        {isJavaScriptOpen && (
          <div className="border-t border-[#383850]">
            {JAVASCRIPT_PROJECTS.map((project) => (
              <ProjectWithSubProjects
                key={project.id}
                project={project}
                settings={{
                  ...settings,
                  golangProjects: golangProjects,
                  javascriptProjects: javascriptProjects,
                }}
                projectType="javascript"
                onChange={onChange}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
