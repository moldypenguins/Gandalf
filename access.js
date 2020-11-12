const createError = require('http-errors');

const webAdminRequired = (req, res, next) => {
  if(res.locals.member.access === 5) {
    next();
  } else {
    next(createError(403));
  }
}

const webHighCommandRequired = (req, res, next) => {
  if(res.locals.member.access === 5 || (res.locals.member.access >= 3 && (res.locals.member.roles & 16) !== 0)) {
    next();
  } else {
    next(createError(403));
  }
}

const webDefenceCommandRequired = (req, res, next) => {
  if(res.locals.member.access === 5 || res.locals.member.access >= 3 && (res.locals.member.roles & 8) !== 0) {
    next();
  } else {
    next(createError(403));
  }
}

const webBattleCommandRequired = (req, res, next) => {
  if(res.locals.member.access === 5 || res.locals.member.access >= 3 && (res.locals.member.roles & 4) !== 0) {
    next();
  } else {
    next(createError(403));
  }
}

const webCommandRequired = (req, res, next) => {
  if(res.locals.member.access >= 3) {
    next();
  } else {
    next(createError(403));
  }
}

const webScannerRequired = (req, res, next) => {
  if(res.locals.member.access === 5 || res.locals.member.access >= 1 && (res.locals.member.roles & 2) !== 0) {
    next();
  } else {
    next(createError(403));
  }
}

const webMemberRequired = (req, res, next) => {
  if(res.locals.member.access >= 1) {
    next();
  } else {
    next(createError(403));
  }
}



const botAdminRequired = (mem) => {
  return mem.access === 5;
}

const botHighCommandRequired = (mem) => {
  return mem.access === 5 || (mem.access >= 3 && (mem.roles & 16) !== 0);
}

const botDefenceCommandRequired = (mem) => {
  return mem.access === 5 || mem.access >= 3 && (mem.roles & 8) !== 0;
}

const botBattleCommandRequired = (mem) => {
  return mem.access === 5 || mem.access >= 3 && (mem.roles & 4) !== 0;
}

const botCommandRequired = (mem) => {
  return mem.access >= 3;
}

const botScannerRequired = (mem) => {
  return mem.access === 5 || mem.access >= 1 && (mem.roles & 2) !== 0;
}

const botMemberRequired = (mem) => {
  return mem.access >= 1;
}


module.exports = {
  "webAdminRequired": webAdminRequired,
  "webHighCommandRequired": webHighCommandRequired,
  "webDefenceCommandRequired": webDefenceCommandRequired,
  "webBattleCommandRequired": webBattleCommandRequired,
  "webCommandRequired": webCommandRequired,
  "webScannerRequired": webScannerRequired,
  "webMemberRequired": webMemberRequired,
  "botAdminRequired": botAdminRequired,
  "botHighCommandRequired": botHighCommandRequired,
  "botDefenceCommandRequired": botDefenceCommandRequired,
  "botBattleCommandRequired": botBattleCommandRequired,
  "botCommandRequired": botCommandRequired,
  "botScannerRequired": botScannerRequired,
  "botMemberRequired": botMemberRequired,
};

