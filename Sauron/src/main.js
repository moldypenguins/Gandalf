"use strict";
/**
 * Gandalf
 * Copyright (c) 2020 Gandalf Planetarion Tools
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
 * @version 2023-02-18
 * @summary
 **/


// Import custom CSS
import "./assets/scss/affleck.scss";
// import "./assets/scss/murphy.scss";
// import "./assets/scss/maplesyrup.scss";
// import "./assets/scss/shamrock.scss";
// import "./assets/scss/telegram.scss";
// import "./assets/scss/thematrix.scss";
// import "./assets/scss/ultimate.scss";

// import * as bootstrap from 'bootstrap'
const bootstrap = typeof window !== "undefined" && import("bootstrap");

import { library } from "@fortawesome/fontawesome-svg-core";
import { faClock, faCrosshairs, faGlobeAmericas } from "@fortawesome/free-solid-svg-icons";
library.add(faClock, faCrosshairs, faGlobeAmericas);
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

import { createPinia } from "pinia";
import { createSSRApp } from "vue";
import App from "./App.vue";
import { createRouter } from "./router";

export function createApp() {
    const app = createSSRApp(App);
    const pinia = createPinia();
    app.use(pinia);
    const router = createRouter();
    app.use(router);
    app.component("fa-icon", FontAwesomeIcon);
    return { app, router };
}
