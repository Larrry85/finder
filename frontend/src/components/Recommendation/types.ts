import { ReactNode } from 'react';

export interface Recommendation {
  id: string;
  userId: number;
  name: string;
  birthDate: string;
  age: number;
  gender: string;
  biography: string;
  locationCity: string;
  interests: string[];
  ageRangeMin: number;
  ageRangeMax: number;
  profilePicture: string;
  golangProjects: string[]; 
  javascriptProjects: string[]; 
}

export interface RecommendationProject {
  golangProjects: string[];
  javascriptProjects: string[];
}

export interface RecomAvatarProps {
  icon: ReactNode;
  label: string;
  value: string | number;
}