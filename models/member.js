var mongoose = require('mongoose');

var memberSchema = mongoose.Schema({
  id:          {type:Number, unique:true, required:true},
  username:    {type:String},
  first_name:  {type:String},
  last_name:   {type:String},
  photo_url:   {type:String},
  panick:      {type:String, index:true},
  email:       {type:String},
  phone:       {type:String},
  access:      {type:Number},
  roles:       {type:Number},
  sponsor:     {type:String},
  planet_id:   {type:String},
  last_access: {type:Date},
  site_theme:  {type:String, default:'light'},
  timezone:    {type:String}
});


module.exports = mongoose.model('Member', memberSchema, 'Members');

