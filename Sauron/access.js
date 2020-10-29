var createError = require('http-errors');

const adminRequired = (req, res, next) => {
  if(res.locals.member.access == 5) {
    next();
  } else {
    next(createError(403));
  }
}

const highCommandRequired = (req, res, next) => {
  if(res.locals.member.access == 5 || (res.locals.member.access >= 3 && (res.locals.member.roles & 16) != 0)) {
    next();
  } else {
    next(createError(403));
  }
}

const defenceCommandRequired = (req, res, next) => {
  if(res.locals.member.access == 5 || res.locals.member.access >= 3 && (res.locals.member.roles & 8) != 0) {
    next();
  } else {
    next(createError(403));
  }
}

const battleCommandRequired = (req, res, next) => {
  if(res.locals.member.access == 5 || res.locals.member.access >= 3 && (res.locals.member.roles & 4) != 0) {
    next();
  } else {
    next(createError(403));
  }
}

const commandRequired = (req, res, next) => {
  if(res.locals.member.access >= 3) {
    next();
  } else {
    next(createError(403));
  }
}

const scannerRequired = (req, res, next) => {
  if(res.locals.member.access == 5 || res.locals.member.access >= 1 && (res.locals.member.roles & 2) != 0) {
    next();
  } else {
    next(createError(403));
  }
}

const memberRequired = (req, res, next) => {
  if(res.locals.member.access >= 1) {
    next();
  } else {
    next(createError(403));
  }
}

module.exports = {
  "adminRequired": adminRequired,
  "highCommandRequired": highCommandRequired,
  "defenceCommandRequired": defenceCommandRequired,
  "battleCommandRequired": battleCommandRequired,
  "commandRequired": commandRequired,
  "scannerRequired": scannerRequired,
  "memberRequired": memberRequired,
};

