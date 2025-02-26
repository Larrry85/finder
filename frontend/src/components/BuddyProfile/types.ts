import { ReactNode } from "react";

export interface UserProfileCard {
  id: number;
  firstName: string;
  lastName: string;
  birthDate: string;
  age: number;
  gender: string;
  biography: string;
  locationCity: string;
  interests: string[];
  maxDistancePreference: number;
  profilePicture: string;
  golangProjects: string[];
  javascriptProjects: string[];
  discord: string;
  myprojects: string;
}

export interface UserAvatarProps {
  icon: ReactNode;
  label: string;
  value: string | number | ReactNode;
}