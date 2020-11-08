# Gandalf ![GitHub License](https://img.shields.io/github/license/moldypenguins/Gandalf?style=flat-square&logo=GNU) ![GitHub Release](https://img.shields.io/github/v/release/moldypenguins/Gandalf?style=flat-square&include_prereleases&logo=GitHub)
![GitHub Last Commit](https://img.shields.io/github/last-commit/moldypenguins/Gandalf?style=for-the-badge&logo=GitHub)
![GitHub Issues](https://img.shields.io/github/issues-raw/moldypenguins/Gandalf?style=for-the-badge&logo=GitHub)
![GitHub Pull Requests](https://img.shields.io/github/issues-pr-raw/moldypenguins/Gandalf?style=for-the-badge&logo=GitHub)

## Table of Contents
* [Requirements](#requirements)
* [Installation](#installation)
* [Contributing](#contributing)
* [Support](#support)
* [Credits](#credits)
* [Licenses](#licenses)

## Requirements
[![Ubuntu](https://img.shields.io/static/v1?style=for-the-badge&logo=Ubuntu&label=Ubuntu&message=v20.04&color=E95420)](https://ubuntu.com/)  
[![Fail2ban](https://img.shields.io/static/v1?style=for-the-badge&logo=Linux&label=Fail2ban&message=v0.11.1&color=FCC624)](https://www.fail2ban.org/)  
[![Node.js](https://img.shields.io/static/v1?style=for-the-badge&logo=Node.js&label=Node.js&message=v10.19.0&color=339933)](https://nodejs.org/)  
[![MongoDB](https://img.shields.io/static/v1?style=for-the-badge&logo=MongoDB&label=MongoDB&message=v4.2&color=47A248)](https://www.mongodb.com/)  
[![Mongoose](https://img.shields.io/github/package-json/dependency-version/moldypenguins/Gandalf/mongoose?style=for-the-badge&logo=NPM&color=800800)](https://mongoosejs.com/) [![npm version](https://img.shields.io/npm/v/mongoose?style=for-the-badge&color=800800)](https://www.npmjs.com/package/mongoose)  
[![telegraf.js](https://img.shields.io/github/package-json/dependency-version/moldypenguins/Gandalf/telegraf?style=for-the-badge&logo=NPM&color=E74625&filename=Gandalf%2Fpackage.json)](https://telegraf.js.org/) [![npm version](https://img.shields.io/npm/v/telegraf?style=for-the-badge&color=E74625)](https://www.npmjs.com/package/telegraf)  
[![twilio](https://img.shields.io/github/package-json/dependency-version/moldypenguins/Gandalf/twilio?style=for-the-badge&logo=NPM&color=f22f46)](https://github.com/twilio/twilio-node) [![npm version](https://img.shields.io/npm/v/twilio?style=for-the-badge&color=f22f46)](https://www.npmjs.com/package/twilio)  
[![Font Awesome](https://img.shields.io/github/package-json/dependency-version/moldypenguins/Gandalf/@fortawesome/fontawesome-free?style=for-the-badge&logo=NPM&color=339af0&filename=Sauron%2Fpackage.json)](https://fontawesome.com/) [![npm version](https://img.shields.io/npm/v/%40fortawesome/fontawesome-free?style=for-the-badge&color=339af0)](https://www.npmjs.com/package/%40fortawesome/fontawesome-free)  
[![Moment.js](https://img.shields.io/github/package-json/dependency-version/moldypenguins/Gandalf/moment?style=for-the-badge&logo=NPM&color=222222)](https://momentjs.com/) [![npm version](https://img.shields.io/npm/v/moment?style=for-the-badge&color=222222)](https://www.npmjs.com/package/moment)  
[![Moment Timezone](https://img.shields.io/static/v1?style=for-the-badge&logo=NPM&label=Moment%20Timezone&message=0.5.28&color=4e7cad)](https://momentjs.com/timezone) [![npm version](https://img.shields.io/npm/v/moment-timezone?style=for-the-badge&color=4e7cad)](https://www.npmjs.com/package/moment-timezone)  
[![Numeral.js](https://img.shields.io/github/package-json/dependency-version/moldypenguins/Gandalf/numeral?style=for-the-badge&logo=NPM&color=ff6a00)](https://numeraljs.com/) [![npm version](https://img.shields.io/npm/v/numeral?style=for-the-badge&color=ff6a00)](https://www.npmjs.com/package/numeral)  
[![Node Schedule](https://img.shields.io/github/package-json/dependency-version/moldypenguins/Gandalf/node-schedule?style=for-the-badge&logo=NPM&color=CB3837)](https://github.com/node-schedule/node-schedule) [![npm version](https://img.shields.io/npm/v/node-schedule?style=for-the-badge&color=CB3837)](https://www.npmjs.com/package/node-schedule)  
[![bent](https://img.shields.io/github/package-json/dependency-version/moldypenguins/Gandalf/bent?style=for-the-badge&logo=NPM&color=CB3837)](https://github.com/mikeal/bent) [![npm version](https://img.shields.io/npm/v/bent?style=for-the-badge&color=CB3837)](https://www.npmjs.com/package/bent)  
[![xml2js](https://img.shields.io/github/package-json/dependency-version/moldypenguins/Gandalf/xml2js?style=for-the-badge&logo=NPM&color=CB3837)](https://github.com/Leonidas-from-XIV/node-xml2js) [![npm version](https://img.shields.io/npm/v/xml2js?style=for-the-badge&color=CB3837)](https://www.npmjs.com/package/xml2js)  
[![debug](https://img.shields.io/static/v1?style=for-the-badge&logo=NPM&label=debug&message=v2.6.9&color=CB3837)](https://github.com/visionmedia/debug) [![npm version](https://img.shields.io/npm/v/debug?style=for-the-badge&color=CB3837)](https://www.npmjs.com/package/debug)  
[![express](https://img.shields.io/static/v1?style=for-the-badge&logo=NPM&label=express&message=v4.16.1&color=CB3837)](https://expressjs.com/) [![npm version](https://img.shields.io/npm/v/express?style=for-the-badge&color=CB3837)](https://www.npmjs.com/package/express)  
[![express-session](https://img.shields.io/static/v1?style=for-the-badge&logo=NPM&label=express-session&message=v1.17.0&color=CB3837)](https://github.com/expressjs/session) [![npm version](https://img.shields.io/npm/v/express-session?style=for-the-badge&color=CB3837)](https://www.npmjs.com/package/express-session)  
[![morgan](https://img.shields.io/static/v1?style=for-the-badge&logo=NPM&label=morgan&message=v1.9.1&color=CB3837)](https://github.com/expressjs/morgan) [![npm version](https://img.shields.io/npm/v/morgan?style=for-the-badge&color=CB3837)](https://www.npmjs.com/package/morgan)  
[![cookie-parser](https://img.shields.io/static/v1?style=for-the-badge&logo=NPM&label=cookie-parser&message=v1.4.4&color=CB3837)](https://github.com/expressjs/cookie-parser) [![npm version](https://img.shields.io/npm/v/cookie-parser?style=for-the-badge&color=CB3837)](https://www.npmjs.com/package/cookie-parser)  
[![cors](https://img.shields.io/static/v1?style=for-the-badge&logo=NPM&label=cors&message=v2.8.5&color=CB3837)](https://github.com/expressjs/cors) [![npm version](https://img.shields.io/npm/v/cors?style=for-the-badge&color=CB3837)](https://www.npmjs.com/package/cors)  
[![awaitjs](https://img.shields.io/static/v1?style=for-the-badge&logo=NPM&label=awaitjs&message=v0.5.0&color=CB3837)](https://github.com/vkarpov15/awaitjs-express) [![npm version](https://img.shields.io/npm/v/%40awaitjs/express?style=for-the-badge&color=CB3837)](https://www.npmjs.com/package/%40awaitjs/express)  
[![html-entities](https://img.shields.io/static/v1?style=for-the-badge&logo=NPM&label=html-entities&message=v1.2.1&color=CB3837)](https://github.com/mdevils/html-entities) [![npm version](https://img.shields.io/npm/v/html-entities?style=for-the-badge&color=CB3837)](https://www.npmjs.com/package/html-entities)  
[![http-errors](https://img.shields.io/static/v1?style=for-the-badge&logo=NPM&label=http-errors&message=v1.9.1&color=CB3837)](https://github.com/jshttp/http-errors) [![npm version](https://img.shields.io/npm/v/http-errors?style=for-the-badge&color=CB3837)](https://www.npmjs.com/package/http-errors)  
[![url](https://img.shields.io/static/v1?style=for-the-badge&logo=NPM&label=url&message=v0.11.0&color=CB3837)](https://github.com/defunctzombie/node-url) [![npm version](https://img.shields.io/npm/v/url?style=for-the-badge&color=CB3837)](https://www.npmjs.com/package/url)  
[![ejs](https://img.shields.io/static/v1?style=for-the-badge&logo=NPM&label=EJS&message=v3.1.5&color=CB3837)](https://github.com/mde/ejs) [![npm version](https://img.shields.io/npm/v/ejs?style=for-the-badge&color=CB3837)](https://www.npmjs.com/package/ejs)  



## Installation
See [INSTALL.md](INSTALL.md) for setup guide. (needs to be updated)


## Contributing
Please read the contribution guidelines [CONTRIBUTING.md](CONTRIBUTING.md) (needs to be updated)


## Support
Please use [GitHub Issues](https://github.com/moldypenguins/Gandalf/issues) for bug reports and feature requests.


## Related Projects
[Merlin](https://github.com/ellonweb/merlin) - Robin K. Hansen, Elliot Rosemarine, Andreas Jacobsen


## Credits
* **Craig Roberts** - *Developer* - [@moldypenguins](https://t.me/moldypenguins)
* **Braden Edmunds** - *Developer* - [@blanq4](https://t.me/blanq4)
* **Alex High** - *Stylist* - [@UltimateNewbie](https://t.me/UltimateNewbie)


## Licenses
Copyright © 2020 Craig Roberts, Braden Edmunds, Alex High  
Licensed under the GNU General Public License Version 3  
See [LICENSE.md](LICENSE.md) or [https://www.gnu.org/licenses/gpl-3.0.html](https://www.gnu.org/licenses/gpl-3.0.html) for more details

