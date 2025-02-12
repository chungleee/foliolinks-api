import { Project } from '@prisma/client';
import type { FunctionComponent } from 'preact';

type UserProfileProps = {
  username: string;
  projects: Project[];
};
const UserProfile: FunctionComponent<UserProfileProps> = ({
  username,
  projects,
}) => {
  return (
    <div>
      <h1>Hello, {username}!</h1>
      <p>This is happening in preact</p>
      <ul>
        {projects.map((project) => {
          return <li>{project.project_name}</li>;
        })}
      </ul>
    </div>
  );
};

export default UserProfile;
