import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { h } from 'preact';
import render from 'preact-render-to-string';
import Home from '../../../resources/views/Pages/Home';

export default class UsersController {
  public async testpreact(context: HttpContextContract) {
    const list = ['a', 'b', 'c'];
    const preact = render(h(Home, { name: 'leon', list }));
    return context.view.render('app', { greeting: preact });
  }
}
