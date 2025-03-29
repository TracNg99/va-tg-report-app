import { User } from './user';

export type Experience = {
  id: string;
  title: string;
  description: string;
  location: string;
  imageUrl: string;
};

export type ExperienceDetail = Experience & {
  // attractions: Experience[];
  iconicPhotos: IconicPhoto[];
  userPhotos: CustomUserPhoto[];
};

export type IconicPhoto = {
  id: string;
  title: string;
  content: { icon: React.FC<any>; text: string }[];
  imageUrl: string;
  caption: string;
};

export type UserPhoto = {
  id: string;
  imageUrl: string;
  by: User;
};

export type CustomUserPhoto = {
  id: string;
  imageUrl: string;
  by: {
    email: string;
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string;
    rank: string;
  };
};
