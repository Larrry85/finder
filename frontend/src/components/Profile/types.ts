export type GenderType = "male" | "female" | "other";
import { ReactNode } from "react";

export interface ProfileFormState {
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: GenderType | "";
  biography: string;
  locationCity: string;
  discord: string;
  myprojects: string;
  interests: string;
  maxDistancePreference: number | null; // Make nullable
  age: string;
  profilePicture?: string | null;
  securityQuestion: string;
  golangProjects: string[];
  javascriptProjects: string[];
  readOnly?: boolean;
  email: string;
  username: string;
}

export const initialFormData: ProfileFormState = {
  firstName: "",
  lastName: "",
  birthDate: "",
  gender: "",
  biography: "",
  locationCity: "",
  discord: "",
  myprojects: "",
  interests: "",
  maxDistancePreference: null, // Set initial value to null
  age: "",
  profilePicture: null,
  securityQuestion: "",
  golangProjects: [],
  javascriptProjects: [],
  readOnly: false, // Default to false
  email: "",
  username: "",
};

export interface MeProfileCard {
  id: number;
  firstName: string;
  lastName: string;
  birthDate: string;
  age: number;
  gender: string;
  biography: string;
  discord: string;
  myprojects: string;
  locationCity: string;
  interests: string[];
  maxDistancePreference: number;
  profilePicture: string;
  golangProjects: string[];
  javascriptProjects: string[];
}

export interface MeInfoRowProps {
  icon: ReactNode;
  label: string;
  value: string | number | ReactNode;
}
