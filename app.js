//jshint esversion:6

const express = require("express");
const mongoose=require("mongoose");
const bodyParser = require("body-parser");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB",{ useFindAndModify: false,useNewUrlParser: true,useUnifiedTopology: true});
const itemSchema={
  name:String
}
const Item =new mongoose.model("Item",itemSchema);
const i1=new Item({
  name:"Welcome to your to do list"
})
const i2=new Item({
  name:"Hit the plus button to add new items"
})
const i3=new Item({
  name:"<--Hit this checkbox to delete an item"
})
const defaultItems=[i1,i2,i3];
const listschema={
  name:String,
  items:[itemSchema]
}
const List=new mongoose.model("List",listschema);
app.get("/", function(req, res) {
  Item.find(function(err,result){
    if(result.length==0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }else{
          console.log("Items inserted succesfully");
        }
      })
      res.redirect("/");
    }else{
    res.render("list", {listTitle: "Today", newListItems: result});
    }
  })
});

app.post("/", function(req, res){

  const item = req.body.newItem;
  const listname = req.body.list;
  const newitem=new Item({
    name:item
  })
  if(listname=="Today"){
      newitem.save();
      res.redirect("/");
  }else{
      List.findOne({name: listname},function(err,foundlist){
        foundlist.items.push(newitem);
        foundlist.save();
        res.redirect("/"+ listname);
      })
  }
});

app.post("/delete", function(req,res){
  const deletedid=req.body.deleteitem;
  const dellist=req.body.Listname;
  if(dellist=="Today"){
    Item.findByIdAndRemove(deletedid,function(err){
      if(err){
        console.log("Error in deletion");
      }else{
        console.log("Succesfully deleted");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name:dellist},{$pull:{items: {_id:deletedid}}},function(err,foundlist){
        if(!err){
          res.redirect("/"+ dellist);
        }
    });
  }
});
app.get("/:customListName", function(req, res){
   const customListName=req.params.customListName;
   List.findOne({name:customListName},function(err,foundlist){
     if(!err){
        if(foundlist){
            res.render("list", {listTitle: customListName , newListItems: foundlist.items});
        }else{
            const customlist=new List({
              name:customListName,
              items:defaultItems
            })
            customlist.save();
            res.redirect("/"+customListName);
        }
     }
   })
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
