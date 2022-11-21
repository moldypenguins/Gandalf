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
 * @name main.js
 * @version 2022-11-14
 * @summary
 **/
'use strict';

// Import custom CSS
import './assets/scss/affleck.scss';
// import './assets/scss/murphy.scss';

import * as bootstrap from 'bootstrap'

import { createApp } from 'vue';
import router from "./router.js";
import { createPinia } from 'pinia';
import App from './App.vue';


/* import the fontawesome core */
import { library } from '@fortawesome/fontawesome-svg-core'
/* import font awesome icon component */
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
/* import specific icons */
import { faClock, faCrosshairs, faGlobeAmericas } from '@fortawesome/free-solid-svg-icons'
/* add icons to the library */
library.add(faClock, faCrosshairs, faGlobeAmericas)


const pinia = createPinia();

const app = createApp(App);
app.use(router);
app.use(pinia);
app.component('font-awesome-icon', FontAwesomeIcon);

window.vm = app.mount('#app');
