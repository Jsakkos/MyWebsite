import { promises as fs } from 'fs';
import path from 'path';

export interface Profile {
    network: string;
    username: string;
    url: string;
}

export interface Basics {
    name: string;
    label: string;
    image: string;
    email?: string;
    url: string;
    summary: string;
    location: {
        region: string;
        countryCode: string;
    };
    profiles: Profile[];
}

export interface Work {
    name: string;
    position: string;
    startDate: string;
    endDate?: string;
    summary: string;
}

export interface Education {
    institution: string;
    studyType: string;
    area: string;
    startDate: string;
    endDate: string;
}

export interface Publication {
    name: string;
    publisher: string;
    releaseDate: string;
    url?: string;
    summary: string;
}

export interface Skill {
    name: string;
    keywords: string[];
}

export interface Project {
    name: string;
    description: string;
    url?: string;
    startDate: string;
    endDate?: string;
    type: 'personal' | 'academic' | 'professional';
    featured?: boolean;
    blogUrl?: string; // Optional link to a blog post about the project
    keywords: string[];
    image?: string;
}

export interface Resume {
    basics: Basics;
    work: Work[];
    education: Education[];
    publications: Publication[];
    skills: Skill[];
    projects: Project[];
}

export async function getResume(): Promise<Resume> {
    const filePath = path.join(process.cwd(), 'public', 'resume.json');
    const fileContents = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContents);
}
