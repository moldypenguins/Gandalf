
const adminRequired = (mem) => {
  if(mem.access == 5) {
    return true;
  } else {
    return false;
  }
}

const highCommandRequired = (mem) => {
  if(mem.access == 5 || (mem.access >= 3 && (mem.roles & 16) != 0)) {
    return true;
  } else {
    return false;
  }
}

const defenceCommandRequired = (mem) => {
  if(mem.access == 5 || mem.access >= 3 && (mem.roles & 8) != 0) {
    return true;
  } else {
    return false;
  }
}

const battleCommandRequired = (mem) => {
  if(mem.access == 5 || mem.access >= 3 && (mem.roles & 4) != 0) {
    return true;
  } else {
    return false;
  }
}

const commandRequired = (mem) => {
  if(mem.access >= 3) {
    return true;
  } else {
    return false;
  }
}

const scannerRequired = (mem) => {
  if(mem.access == 5 || mem.access >= 1 && (mem.roles & 2) != 0) {
    return true;
  } else {
    return false;
  }
}

const memberRequired = (mem) => {
  if(mem.access >= 1) {
    return true;
  } else {
    return false;
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

