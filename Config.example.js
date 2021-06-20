module.exports = {
  admin:{
    id:123456789, //Telegram ID
    pa_nick:"moldypenguins",
  },
  alliance:{
    name:"Alliance Name", //used somewhere
    attack:{
      default_waves:3, //default number of waves on an attack
      after_land_ticks:2, //how many ticks to keep attack open after landing
      max_claims:0,  //maximum allowed claims per member - 0 for unlimited
    }
  },
  bot:{
    token:"659859082:AAEsAhslMPJpSatAzbgZiPNabn0l44nprnA", //Telegram bot token
    username:"TelegramBot", //Telegram bot name
    private_cmd:".", //character to use for bot to reply in pm
    public_cmd:"!", //character to use for bot to reply in public
    modules:['admin', 'ships', 'calcs', 'comms', 'intel', 'fun', 'attacks', 'scans'], //active modules
    message_interval:5, //how often to check for messages in seconds
    tick_alert:true, //whether the bot should message private channel on every tick
  },
  twilio:{
    url:"https://demo.twilio.com/welcome/voice/", //TwiML instructions url
    sid:"AC83a89587725757444879fb3156a6738c", //Twilio sid
    secret:"05b47244d936373c6e62c9d797b352ee", //Twilio secret
    number:+12345554367, //Twilio phone number
    ring_timeout:20, //seconds
  },
  giphy:{
    key:"",
  },
  groups:{
    admin:0, //[Telegram channel bot output],
    scans:0, //[Telegram channel alliance scans],
    private:0, //[Telegram channel alliance private],
    public:0, //[Telegram channel alliance public],
    galaxy:0, //[Telegram channel galaxy channel]
  },
  web:{
    uri:"[Website URL]",
    session:"[Website session key]", //ex: 'hihehfw98KDJ@E#ohhoiuhEEDouhfgw8r3fhiw'
    temp_folder:"[Website temp folder path]", //ex: '/home/root/MiddleEarth/temp'
    default_profile_pic:'/images/member.jpg',
    default_theme:'affleck',
    default_navigation:'iconstext',
    themes:{
      affleck:{name:'Affleck', navbar:'light'},
      shamrock:{name: 'Shamrock', navbar: 'light'},
      telegram:{name: 'Telegram', navbar: 'light'},
      thematrix:{name: 'The Matrix', navbar: 'dark'},
      ultimate:{name: 'Ultimate', navbar: 'dark'},
    }
  },
  db:{
    uri:"mongodb://localhost:27017",
    name:"Mordor",
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
    5:"Administrator",  //gives access to:
                          //everything
  },
  roles:{
    0x1:"OOT",               //marks OOT members (must be at least member)
    0x2:"Scanner",           //gives access to: Scan shit (must be at least member)
    0x4:"Battle Commander",  //gives access to: BC shit (must be at least commander)
    0x8:"Defence Commander", //gives access to: DC shit (must be at least commander)
    0x16:"High Commander"    //gives access to: HC shit (must be at least commander)
  },
};
