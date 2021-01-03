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
  access:      {type:Number, default: 0},
  roles:       {type:Number, default: 0},
  sponsor:     {type:String},
  planet_id:   {type:String},
  last_access: {type:Date},
  site_theme:  {type:String, default:'default'},
  timezone:    {type:String}
});

module.exports = mongoose.model('Member', memberSchema, 'Members');

