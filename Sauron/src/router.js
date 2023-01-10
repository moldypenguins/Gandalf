/**
 * Gandalf
 * Copyright (C) 2020 Craig Roberts, Braden Edmunds, Alex High
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/gpl-3.0.html
 *
 * @name router.js
 * @version 2022-11-14
 * @summary vue router
 **/
'use strict';


import hmacSha256 from "crypto-js/hmac-sha256";
import sha256 from "crypto-js/sha256.js";
import { createRouter as _createRouter, createMemoryHistory, createWebHistory } from 'vue-router'

// Auto generates routes from vue files under ./views
// https://vitejs.dev/guide/features.html#glob-import
/*
const views = import.meta.glob('./views/*.vue')
const routes = Object.keys(views).map((path) => {
  const name = path.match(/\.\/views(.*)\.vue$/)[1].toLowerCase()
  return {
    path: name === '/dashboard' ? '/' : name,
    component: views[path] // () => import('./views/*.vue')
  }
});
 */

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('./views/Login.vue')
  },
  {
    path: '/auth',
    name: 'Authentication',
    redirect: async(to) => {
      if(checkTelegramAuthorization(to.query)) {
        console.log(`SUCCESS`);
        //successful login
        let params = JSON.parse(JSON.stringify(to.query));
        //load member



        return {name: 'Dashboard'}
      }
      else {
        return {name: 'Login'}
      }
    }
  },
  { path: '/', name: 'Dashboard', component: () => import('./views/Dashboard.vue'), meta: { AuthRequired: true } },
  { path: '/mem', name: 'Members', component: () => import('./views/Members.vue'), meta: { AuthRequired: true } },
  { path: '/uni', name: 'Universe', component: () => import('./views/Universe.vue'), meta: { AuthRequired: true } },
  { path: '/about', name: 'About', component: () => import('./views/About.vue'), meta: { AuthRequired: true } },
  { path: '/admin', name: 'Admin', component: () => import('./views/Admin.vue'), meta: { AuthRequired: true } },
  { path: '/:catchAll(.*)*', name: 'NotFound', component: () => import('./views/NotFound.vue') },
];



export function createRouter() {
  return _createRouter({
    // use appropriate history implementation for server/client
    // import.meta.env.SSR is injected by Vite.
    history: import.meta.env.SSR
      ? createMemoryHistory('/')
      : createWebHistory('/'),
    routes
  });
}









/*



const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) { return savedPosition || { top: 0 } },
  linkActiveClass: 'active'
});

router.beforeEach((to, from) => {
  if(to.meta.AuthRequired && !window.user) {
    return { name: 'Login' }
  }
});

*/




// ###################
// Telegram
// ###################






export const checkTelegramAuthorization = (authData) => {
  const _authData = { ...authData };
  const { hash: checkHash } = authData;

  delete _authData.hash;

  const dataCheckArr = Object.keys(_authData)
    .map((key) => `${key}=${_authData[key]}`)
    .sort()
    .join("\n");

  return String(hmacSha256(dataCheckArr, sha256(tgToken))) === checkHash; // returns true if hash is valid
};

/*
  if(checkSignature(req.query)) {
    //successful login
    let params = JSON.parse(JSON.stringify(req.query));
    //console.log('PARAMS: ' + util.inspect(params, false, null, true));
    let telegramUser = await TelegramUser.findOneAndUpdate({telegram_id: params.id},{
      telegram_first_name:params.first_name,
      telegram_last_name:params.last_name,
      telegram_username:params.username,
      telegram_photo_url:params.photo_url,
    },{upsert:true, new:true});
    //console.log('TGUSER: ' + util.inspect(telegramUser, false, null, true));
    let member = await Member.findOne({telegram_user:telegramUser});//.populate('telegram_user').populate('planet');
    //console.log('MEMBER: ' + util.inspect(member, false, null, true));
    if (member) {
      //console.log('Is Member');
      req.session.member = member;
      res.redirect("/");
    } else {
      let applicant = await Applicant.findOne({telegram_user:telegramUser});
      if (applicant) {
        //console.log('Is Applicant');
        req.session.applicant = applicant;
      } else {
        //console.log('Is Visitor');
        req.session.visitor = params;
      }
      res.redirect("/reg");
    }
  } else {
    //failed login
    next(401);
  }
 */

