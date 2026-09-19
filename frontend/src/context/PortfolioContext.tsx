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
  updatedAt?: string;
}

interface PortfolioContextType {
  data: PortfolioData;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  updateDataLocally: (newData: Partial<PortfolioData>) => void;
  importData: (importedData: PortfolioData) => Promise<boolean>;
  resetToDefaults: () => void;
}

const defaultData: PortfolioData = {
  personalInfo: defaultPersonalInfo,
  skills: defaultSkills,
  projects: defaultProjects,
  certifications: defaultCertifications,
  experience: defaultExperience,
  updatedAt: '2024-01-01T00:00:00.000Z'
};

const STORAGE_KEY = 'kavindu_portfolio_data_v2';

function getInitialData(): PortfolioData {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') {
        return {
          personalInfo: parsed.personalInfo || defaultPersonalInfo,
          skills: parsed.skills || defaultSkills,
          projects: parsed.projects || defaultProjects,
          certifications: parsed.certifications || defaultCertifications,
          experience: parsed.experience || defaultExperience,
          updatedAt: parsed.updatedAt || defaultData.updatedAt
        };
      }
    }
  } catch (e) {
    console.warn('Could not read saved portfolio from localStorage', e);
  }
  return defaultData;
}

const PortfolioContext = createContext<PortfolioContextType>({
  data: defaultData,
  loading: false,
  error: null,
  refreshData: async () => {},
  updateDataLocally: () => {},
  importData: async () => false,
  resetToDefaults: () => {}
});

export const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? 'http://localhost:5000' : 'https://kavindu-portfolio-backend.onrender.com');

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<PortfolioData>(getInitialData);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const saveToStorage = (newData: PortfolioData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    } catch (e) {
      console.warn('Could not cache portfolio to localStorage', e);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/portfolio`);
      if (res.ok) {
        const json = await res.json();
        
        const serverUpdatedAt = json.updatedAt ? new Date(json.updatedAt).getTime() : 0;
        let localUpdatedAt = 0;
        try {
          const localSaved = localStorage.getItem(STORAGE_KEY);
          if (localSaved) {
            const parsedLocal = JSON.parse(localSaved);
            if (parsedLocal.updatedAt) {
              localUpdatedAt = new Date(parsedLocal.updatedAt).getTime();
            }
          }
        } catch (_) {}

        const serverData: PortfolioData = {
          personalInfo: json.personalInfo || defaultPersonalInfo,
          skills: json.skills || defaultSkills,
          projects: json.projects || defaultProjects,
          certifications: json.certifications || defaultCertifications,
          experience: json.experience || defaultExperience,
          updatedAt: json.updatedAt || new Date().toISOString()
        };

        // Don't overwrite if local data is clearly newer than server reset
        if (!localUpdatedAt || serverUpdatedAt >= localUpdatedAt || serverUpdatedAt > 0) {
          setData(serverData);
          saveToStorage(serverData);
        } else {
          console.info('Local edits retained because server returned older snapshot.');
        }
        setError(null);
      }
    } catch (err) {
      console.warn('Backend portfolio API unreachable, using cached/static data.', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateDataLocally = (newData: Partial<PortfolioData>) => {
    setData((prev) => {
      const updated = { ...prev, ...newData, updatedAt: new Date().toISOString() };
      saveToStorage(updated);
      return updated;
    });
  };

  const importData = async (importedData: PortfolioData): Promise<boolean> => {
    const prepared: PortfolioData = {
      personalInfo: importedData.personalInfo || defaultPersonalInfo,
      skills: importedData.skills || defaultSkills,
      projects: importedData.projects || defaultProjects,
      certifications: importedData.certifications || defaultCertifications,
      experience: importedData.experience || defaultExperience,
      updatedAt: new Date().toISOString()
    };

    setData(prepared);
    saveToStorage(prepared);

    try {
      const token = localStorage.getItem('adminToken');
      if (token) {
        await fetch(`${API_BASE}/api/admin/portfolio/import`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(prepared)
        });
      }
      return true;
    } catch (e) {
      console.warn('Could not sync imported backup to server:', e);
      return true; // Still saved locally
    }
  };

  const resetToDefaults = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (_) {}
    setData(defaultData);
  };

  return (
    <PortfolioContext.Provider
      value={{
        data,
        loading,
        error,
        refreshData: fetchData,
        updateDataLocally,
        importData,
        resetToDefaults
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => useContext(PortfolioContext);
