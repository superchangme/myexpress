/**
 * Created by tom.chang on 2014/4/29.
 */
var mongoose=require("mongoose");
mongoose.connect("mongodb://localhost/nodetest");
exports.mongoose=mongoose;