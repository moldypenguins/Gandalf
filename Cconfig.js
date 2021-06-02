module.exports = {
  admin:{
    id:230437821
  },
  alliance:{
    name:'Zero Tolerance',
    attack:{
      default_waves:3,
      after_land_ticks:2,
      max_claims:0  //0 for unlimited
    }
  },
  bot:{
    token:"659859082:AAEsAhslMPJpSatAzbgZiPNabn0l44nprnA",
    username:"GandalfrBot",
    private_cmd:".",
    public_cmd:"!",
    modules:['scans','ships','calcs','comms','intel','attacks'],
    message_interval:2, //seconds
    tick_alert:true
  },
  twilio:{
    url:"https://demo.twilio.com/welcome/voice/",
    sid:"AC83a89587725757444879fb3156a6738c",
    secret:"05b47244d936373c6e62c9d797b352ee",
    number:+15817037861,
    ring_timeout:20 //seconds
  },
  groups:{
    admin:-1001080883288,
    scans:-1001280558727,
    private:-1001212181637,
    public:0,
    galaxy:0
  },
  web:{
    uri:'https://ztpa.ca',
    session:'8as7%98r3y9f!ds9hcb_shihe#sf-h9ieufhiwe@ufgw',
    temp_folder:'/home/cr/MiddleEarth/temp',
    default_profile_pic:'/images/member.jpg',
    default_theme:'telegram',
    default_navigation:'iconstext',
    themes:{
      affleck:{name:'Affleck', navbar:'light'},
      matrix:{name: 'The Matrix', navbar: 'dark'},
      shamrock:{name: 'Shamrock', navbar: 'light'},
      telegram:{name: 'Telegram', navbar: 'light'},
      ultimate:{name: 'Ultimate', navbar: 'dark'}
    }
  },
  db:{
    uri:"mongodb://localhost:27017",
    name:"Gandalfr"
  },
  access:{
    0:"Recruit",        //gives access to: 
                          //basic dashboard page
                          //basic universe pages (no intel)
                          //attacks (cannot see claimant names)
    1:"Member",         //gives access to: 
                          //extended dashboard page
                          //strategy pages
                          //extended universe pages (with intel)
                          //attacks (can see claimant names)
                          //scanner role
    3:"Commander",      //gives access to: 
                          //commander roles
    5:"Administrator"   //gives access to: 
                          //everything
  },
  roles:{
    1:"OOT",               //marks OOT members (must be at least member)
    2:"Scanner",           //gives access to: Scan shit (must be at least member)
    4:"Battle Commander",  //gives access to: BC shit (must be at least commander)
    8:"Defence Commander", //gives access to: DC shit (must be at least commander)
    16:"High Commander"    //gives access to: HC shit (must be at least commander)
  },
}
