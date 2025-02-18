import ProjectLink from '../Components/ProjectLink/ProjectLink';
import { Project, UserProfile } from '@prisma/client';

interface UsernameProps {
  userProfile: UserProfile;
  projects: Project[];
}

const Username = ({ userProfile, projects }: UsernameProps) => {
  const { email, firstName, lastName } = userProfile;

  return (
    <div className="preview">
      <div className="preview__nav-container">
        <main className="preview__main">
          <section className="preview__user-bio">
            <div className="preview__user-bio-avatar">
              <img alt="avatar" />
            </div>
            <div className="preview__user-bio-description">
              <h4>{`${email}`}</h4>
              <h1>{`${firstName} ${lastName}`}</h1>
            </div>
          </section>

          <section className="preview__user-projects">
            <ul>
              {projects?.map((project) => {
                return <ProjectLink key={project.id} project={project} />;
              })}
            </ul>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Username;
