var mongoose = require('mongoose');

var inactiveSchema = mongoose.Schema({
  id:          {type:Number, unique:true, required:true},
  username:    {type:String},
  first_name:  {type:String},
  last_name:   {type:String},
  photo_url:   {type:String},
  panick:      {type:String, index:true},
  email:       {type:String},
  phone:       {type:String},
  sponsor:     {type:String},
  timezone:    {type:String}
});


module.exports = mongoose.model('Inactive', inactiveSchema, 'Inactives');

