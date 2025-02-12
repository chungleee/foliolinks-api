import { ReactNode } from 'react';
import { Project } from '@prisma/client';
import './ProjectLink.css';

interface ProjectLinkProp {
  project: Project;
}

const ProjectLink = ({ project }: ProjectLinkProp) => {
  return (
    <ProjectButton url={project.project_url}>
      {project.project_name}
    </ProjectButton>
  );
};

export default ProjectLink;

interface ButtonProps {
  children: ReactNode;
  variant?: 'default' | 'secondary';
  disabled?: boolean;
  type?: 'submit' | 'button' | 'reset' | undefined;
  onClick?: () => void;
  url?: string;
}

export const ProjectButton = ({ children, url }: ButtonProps) => {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="project-button"
    >
      <span>{children}</span>
      {/* <Icon variant="right-arrow" /> */}
      <span>-&gt;</span>
    </a>
  );
};
