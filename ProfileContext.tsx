import React, { createContext, useState } from 'react';

type Profile = {
  name: string;
  username: string;
  email: string;
  phone: string;
  profileImage: string;
};

type ProfileContextType = {
  profile: Profile;
  updateProfile: (updatedProfile: Partial<Profile>) => void;
};

export const ProfileContext = createContext<ProfileContextType>({
  profile: {
    name: '',
    username: '',
    email: '',
    phone: '',
    profileImage: '',
  },
  updateProfile: () => {},
});

export const ProfileProvider: React.FC = ({ children }) => {
  const [profile, setProfile] = useState<Profile>({
    name: '',
    username: '',
    email: '',
    phone: '',
    profileImage: '',
  });

  const updateProfile = (updatedProfile: Partial<Profile>) => {
    setProfile((prev) => ({ ...prev, ...updatedProfile }));
  };

  return (
    <ProfileContext.Provider value={{ profile, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

export default ProfileContext;
