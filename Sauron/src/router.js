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
 * @name index.js
 * @version 2022-11-14
 * @summary router
 **/
'use strict';

import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router';


const routes = [
  { path: '/login', name: 'Login', component: () => import('./views/Login.vue') },
  { path: '/', name: 'Dashboard', component: () => import('./views/Dashboard.vue'), meta: { AuthRequired: true } },
  { path: '/mem', name: 'Members', component: () => import('./views/Members.vue'), meta: { AuthRequired: true } },
  { path: '/uni', name: 'Universe', component: () => import('./views/Universe.vue'), meta: { AuthRequired: true } },
  { path: '/about', name: 'About', component: () => import('./views/About.vue'), meta: { AuthRequired: true } },
  { path: '/admin', name: 'Admin', component: () => import('./views/Admin.vue'), meta: { AuthRequired: true } },
  { path: '/:catchAll(.*)*', name: 'NotFound', component: () => import('./views/NotFound.vue') },
];

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

export default router;
