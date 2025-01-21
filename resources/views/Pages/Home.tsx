import type { FunctionComponent } from 'preact';

type HomeProps = {
  name: string;
  list: string[];
};
const Home: FunctionComponent<HomeProps> = ({ name, list }) => {
  return (
    <div>
      <h1>Hello, {name}!</h1>
      <p>This is happening in preact</p>
      <ul>
        {list.map((e) => {
          return <li>{e}</li>;
        })}
      </ul>
    </div>
  );
};

export default Home;
