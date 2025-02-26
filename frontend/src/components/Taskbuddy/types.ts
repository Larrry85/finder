import { ReactNode } from 'react';

export interface TaskbuddyMatch {
  id: number;
  senderId: number;
  receiverId: number;
  firstName: string;
  lastName: string;
  age: number;
  locationCity: string;
  interests: string[];
  biography: string;
  profilePicture: string;
  golangProjects: string[];
  javascriptProjects: string[];
}

export interface MatchProjects {
  golangProjects: string[];
  javascriptProjects: string[];
}

export interface UserAvatarProps {
  icon: ReactNode;
  label: string;
  value: string | number;
}