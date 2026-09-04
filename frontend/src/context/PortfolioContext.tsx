import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  personalInfo as defaultPersonalInfo,
  skills as defaultSkills,
  projects as defaultProjects,
  certifications as defaultCertifications,
  experience as defaultExperience
} from '../data/portfolio';

export interface PersonalInfo {
  name: string;
  title: string;
  subtitle: string;
  email: string;
  phone: string;
  location: string;
  github: string;
  linkedin: string;
  twitter: string;
  bio: string;
  status: string;
  experience: string;
  projects: string;
  certifications: string;
}

export interface Skill {
  name: string;
  level: number;
  category: string;
  color: string;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  tech: string[];
  github: string;
  live: string;
  category: string;
  color: string;
  featured: boolean;
}

export interface Certification {
  id: number;
  title: string;
  issuer: string;
  date: string;
  color: string;
  icon: string;
  credentialId: string;
  image: string;
}

export interface Experience {
  year: string;
  role: string;
  company: string;
  description: string;
  color: string;
}

export interface PortfolioData {
  personalInfo: PersonalInfo;
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
  experience: Experience[];
}

interface PortfolioContextType {
  data: PortfolioData;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  updateDataLocally: (newData: Partial<PortfolioData>) => void;
}

const defaultData: PortfolioData = {
  personalInfo: defaultPersonalInfo,
  skills: defaultSkills,
  projects: defaultProjects,
  certifications: defaultCertifications,
  experience: defaultExperience
};

const PortfolioContext = createContext<PortfolioContextType>({
  data: defaultData,
  loading: false,
  error: null,
  refreshData: async () => {},
  updateDataLocally: () => {}
});

export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<PortfolioData>(defaultData);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/portfolio`);
      if (res.ok) {
        const json = await res.json();
        setData({
          personalInfo: json.personalInfo || defaultPersonalInfo,
          skills: json.skills || defaultSkills,
          projects: json.projects || defaultProjects,
          certifications: json.certifications || defaultCertifications,
          experience: json.experience || defaultExperience,
        });
        setError(null);
      }
    } catch (err) {
      console.warn('Backend portfolio API unreachable, using static fallback.', err);
      // Fallback remains defaultData
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateDataLocally = (newData: Partial<PortfolioData>) => {
    setData((prev) => ({ ...prev, ...newData }));
  };

  return (
    <PortfolioContext.Provider
      value={{
        data,
        loading,
        error,
        refreshData: fetchData,
        updateDataLocally
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => useContext(PortfolioContext);
