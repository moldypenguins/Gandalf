module.exports = {
  dumps:{
    ship_stats:"https://game.planetarion.com/manual.pl?action=statsxml",
    planet:"https://game.planetarion.com/botfiles/planet_listing.txt",
    galaxy:"https://game.planetarion.com/botfiles/galaxy_listing.txt",
    alliance:"https://game.planetarion.com/botfiles/alliance_listing.txt",
    user:"https://game.planetarion.com/botfiles/user_feed.txt",
  },
  links:{
    scans:"https://game.planetarion.com/showscan.pl",
    bcalc:"https://game.planetarion.com/bcalc.pl",
  },
  tick:{
    start:0,
    shuffle:12,
    protection:24,
    end:1177,
  },
  numbers:{
    tag_total:60,
    tag_count:40,
    roid_value:200,
    cons_value:200,
    res_value:150,
    ship_value:100,
    xp_value:60,
  },
  races:{
    ter:1,
    cat:2,
    xan:3,
    zik:4,
    etd:5,
  },
  scantypes:{
    1: "Planet Scan",
    2: "Landing Scan",
    3: "Development Scan",
    4: "Unit Scan",
    5: "News Scan",
    6: "Incoming Scan",
    7: "Jumpgate Probe",
    8: "Advanced Unit Scan",
  },
  scans:{
    P:{bestbefore:3,expiry:5,request:true},
    L:{bestbefore:3,expiry:5,request:false},
    D:{bestbefore:3,expiry:5,request:true},
    U:{bestbefore:3,expiry:5,request:true},
    N:{bestbefore:3,expiry:5,request:true},
    I:{bestbefore:3,expiry:5,request:false},
    J:{bestbefore:1,expiry:2,request:true},
    A:{bestbefore:3,expiry:5,request:true},
  },
  ships:{
    min_uni_eta:8,
    targets:{
      t1:"target1",
      t2:"target2",
      t3:"target3",
    },
    damagetypes:{
      normal:"kill",
      cloak:"kill",
      steal:"steal",
      emp:"hug",
      pod:"capture",
      structure:"destroy",
    },
    targeteffs:{
      "target1":1,
      "target2":0.7,
      "target3":0.5,
    },
    classes:{
      fi:"Fighter",
      co:"Corvette",
      fr:"Frigate",
      de:"Destroyer",
      cr:"Cruiser",
      bs:"Battleship",
    }
  },
  roids: {
    maxcap: 0.2,
    mincap: 0,
    mining: 250,
  },
  bash: {
    value: 0.4,
    score: 0.4,
  },
  governments: {
    corp: {
      name: "Corporatism",
      prodcost: 0,
      mining: 0.24,
      prodtime: 0,
    },
    demo: {
      name: "Democracy",
      prodcost: -0.07,
      mining: 0,
      prodtime: 0,
    },
    nation: {
      name: "Nationalism",
      prodcost: 0,
      mining: 0.16,
      prodtime: -0.10,
    },
    soc: {
      name: "Socialism",
      prodcost: 0,
      mining: 0.1,
      prodtime: 0.1,
    },
    total: {
      name: "Totalitarianism",
      prodcost: -0.08,
      mining: 0,
      prodtime: -0.10,
    }
  },
  construction: {
    baseRefCost: 3000,
    baseFCCost: 4500,
    refIncome: 1100,
    fcBonus: 0.005,
    refCU: 750,
    fcCU: 1000,
  },
};
