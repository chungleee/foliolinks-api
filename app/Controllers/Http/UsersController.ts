// import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Hash from "@ioc:Adonis/Core/Hash";

interface User {
  email: string;
  password: string;
  hashedPassword: string;
}
const users: User[] = [];

export default class UsersController {
  async index() {
    return users;
  }

  async store({ request, response }) {
    const { email, password } = request.body();

    const hashedPassword = await Hash.make(password);

    users.push({ email, password, hashedPassword });

    response.send({
      email,
      password,
      hashedPassword,
      users: users,
    });
  }

  async login({ request }) {
    const { email, password } = request.body();

    const foundUser = users.find((user) => {
      return user.email === email;
    });

    if (!foundUser) {
      return {
        msg: "wrong credentials",
      };
    }

    if (await Hash.verify(foundUser?.hashedPassword, password)) {
      return { foundUser };
    }

    return { msg: "wrong credentials" };
  }
}
