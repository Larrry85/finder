//types.ts
export interface Project {
  name: string;
}

export interface SearchSettings {
  interests: string[];
  //locationType: "remote" | "local";
  //maxDistancePreference: number;
  golangProjects: Project[];
  javascriptProjects: Project[];
}

export interface EnhancedBuddySettingsProps {
  settings: SearchSettings;
  onChange: (settings: SearchSettings) => void;
}
