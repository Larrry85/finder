import React, { useState } from "react";
import {
  GOLANG_PROJECTS,
  JAVASCRIPT_PROJECTS,
} from "../../components/SearchSettings/constants";
import { ChevronDown, ChevronRight } from "lucide-react";

interface ProjectSelectionProps {
  selectedProjects: {
    golangProjects: string[];
    javascriptProjects: string[];
  };
  onChange: (newProjects: {
    golangProjects: string[];
    javascriptProjects: string[];
  }) => void;
}

const ProjectSelection: React.FC<ProjectSelectionProps> = ({
  selectedProjects = { golangProjects: [], javascriptProjects: [] },
  onChange,
}) => {
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<
    "golang" | "javascript" | null
  >(null);
  const [expandedProjects, setExpandedProjects] = useState<string[]>([]);

  const safeSelectedProjects = {
    golangProjects: selectedProjects?.golangProjects ?? [],
    javascriptProjects: selectedProjects?.javascriptProjects ?? [],
  };

  const toggleProjectExpansion = (projectId: string) => {
    setExpandedProjects((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId]
    );
  };

  const getSelectedProjectNames = () => {
    const names: string[] = [];

    // Get Golang project names
    safeSelectedProjects.golangProjects.forEach((projectPath) => {
      const [projectId, subProjectId] = projectPath.split("/");
      const project = GOLANG_PROJECTS.find((p) => p.id === projectId);
      if (project) {
        const subProject = project.subProjects.find(
          (sp) => sp.id === subProjectId
        );
        if (subProject) {
          names.push(`${project.name}/${subProject.name}`);
        }
      }
    });

    // Get JavaScript project names
    safeSelectedProjects.javascriptProjects.forEach((projectPath) => {
      const [projectId, subProjectId] = projectPath.split("/");
      const project = JAVASCRIPT_PROJECTS.find((p) => p.id === projectId);
      if (project) {
        const subProject = project.subProjects.find(
          (sp) => sp.id === subProjectId
        );
        if (subProject) {
          names.push(`${project.name}/${subProject.name}`);
        }
      }
    });

    return names;
  };

  const handleProjectChange = (
    projectType: "golang" | "javascript",
    projectId: string,
    selectedSubProjectIds: string[]
  ) => {
    const newSelection = {
      golangProjects: [...safeSelectedProjects.golangProjects],
      javascriptProjects: [...safeSelectedProjects.javascriptProjects],
    };

    if (projectType === "golang") {
      newSelection.golangProjects = newSelection.golangProjects.filter(
        (id) => !id.startsWith(`${projectId}/`)
      );
      selectedSubProjectIds.forEach((subProjectId) => {
        newSelection.golangProjects.push(`${projectId}/${subProjectId}`);
      });
    } else if (projectType === "javascript") {
      newSelection.javascriptProjects = newSelection.javascriptProjects.filter(
        (id) => !id.startsWith(`${projectId}/`)
      );
      selectedSubProjectIds.forEach((subProjectId) => {
        newSelection.javascriptProjects.push(`${projectId}/${subProjectId}`);
      });
    }

    onChange(newSelection);
  };

  const getSelectedSubProjects = (
    projectId: string,
    projectType: "golang" | "javascript"
  ): string[] => {
    const projects =
      projectType === "golang"
        ? safeSelectedProjects.golangProjects
        : safeSelectedProjects.javascriptProjects;

    return projects
      .filter((p) => p.startsWith(`${projectId}/`))
      .map((p) => p.split("/")[1]);
  };

  const totalSelected =
    safeSelectedProjects.golangProjects.length +
    safeSelectedProjects.javascriptProjects.length;

  const selectedNames = getSelectedProjectNames();
  const displayNames =
    selectedNames.length > 0
      ? selectedNames.slice(0, 3).join(", ") +
        (selectedNames.length > 3 ? ` +${selectedNames.length - 3} more` : "")
      : "Select tasks";

  const ProjectCategory = ({
    type,
    projects,
    title,
  }: {
    type: "golang" | "javascript";
    projects: typeof GOLANG_PROJECTS | typeof JAVASCRIPT_PROJECTS;
    title: string;
  }) => (
    <div
      className={`transition-all duration-300 ${
        activeCategory === type ? "opacity-100" : "opacity-80"
      }`}
    >
      <button
        onClick={() => setActiveCategory(activeCategory === type ? null : type)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#2a2a3a] rounded-md transition-colors"
      >
        <span className="text-[#b085f5] font-medium">{title}</span>
        <div className="flex items-center space-x-2">
          <span className="text-gray-400 text-sm">
            {type === "golang"
              ? safeSelectedProjects.golangProjects.length
              : safeSelectedProjects.javascriptProjects.length}{" "}
            selected
          </span>
          {activeCategory === type ? (
            <ChevronDown size={18} className="text-gray-400" />
          ) : (
            <ChevronRight size={18} className="text-gray-400" />
          )}
        </div>
      </button>

      {activeCategory === type && (
        <div className="mt-2 space-y-2 pl-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="space-y-2 transition-all duration-200"
            >
              <button
                onClick={() => toggleProjectExpansion(project.id)}
                className="w-full flex items-center justify-between py-2 text-left hover:bg-[#2a2a3a] rounded-md px-2 transition-colors"
              >
                <span className="font-medium text-gray-300 text-sm">
                  {project.name}
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400 text-xs">
                    {getSelectedSubProjects(project.id, type).length} selected
                  </span>
                  {expandedProjects.includes(project.id) ? (
                    <ChevronDown size={16} className="text-gray-400" />
                  ) : (
                    <ChevronRight size={16} className="text-gray-400" />
                  )}
                </div>
              </button>

              {expandedProjects.includes(project.id) && (
                <div className="pl-4 space-y-2">
                  {project.subProjects.map((subProject) => (
                    <label
                      key={subProject.id}
                      className="flex items-center space-x-2 text-sm text-gray-300 cursor-pointer hover:text-white py-1"
                    >
                      <input
                        type="checkbox"
                        checked={getSelectedSubProjects(
                          project.id,
                          type
                        ).includes(subProject.id)}
                        onChange={(e) => {
                          const currentSelected = getSelectedSubProjects(
                            project.id,
                            type
                          );
                          let newSelected;
                          if (e.target.checked) {
                            newSelected = [...currentSelected, subProject.id];
                          } else {
                            newSelected = currentSelected.filter(
                              (id) => id !== subProject.id
                            );
                          }
                          handleProjectChange(type, project.id, newSelected);
                        }}
                        className="rounded border-gray-500 text-[#b085f5] focus:ring-[#b085f5]"
                      />
                      <span>{subProject.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="border border-[#383850] rounded-lg overflow-hidden bg-[#1a1b26] shadow-lg">
        <button
          onClick={() => setIsProjectsOpen(!isProjectsOpen)}
          className="w-full p-3 md:p-4 text-left flex items-center justify-between hover:bg-[#222233] transition-colors duration-200"
        >
          <div className="flex items-center space-x-2 md:space-x-3 overflow-hidden">
            <span className="font-bold text-white flex-shrink-0 text-sm md:text-base">
              Tasks:
            </span>
            <span className="text-gray-400 truncate text-sm md:text-base">
              {displayNames}
            </span>
            {totalSelected > 0 && (
              <span className="bg-[#b085f5] text-white text-xs px-2 py-1 rounded-full flex-shrink-0">
                {totalSelected}
              </span>
            )}
          </div>
          {isProjectsOpen ? (
            <ChevronDown size={20} className="text-gray-400 flex-shrink-0" />
          ) : (
            <ChevronRight size={20} className="text-gray-400 flex-shrink-0" />
          )}
        </button>

        {isProjectsOpen && (
          <div className="border-t border-[#383850] p-3 md:p-4 space-y-4">
            <ProjectCategory
              type="golang"
              projects={GOLANG_PROJECTS}
              title="Golang Tasks"
            />
            <ProjectCategory
              type="javascript"
              projects={JAVASCRIPT_PROJECTS}
              title="JavaScript Tasks"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectSelection;
