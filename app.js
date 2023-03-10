//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
//const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');
const _ = require("lodash")

const password = encodeURIComponent("TestPass123")
const uri = `mongodb+srv://svolcov1:${password}@test-cluster.8uswzhe.mongodb.net/todolistDB?retryWrites=true&w=majority`;

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static("public"));

main().catch(err => console.log(err));

async function main() {
  try {
    mongoose.set("strictQuery", false);

    await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      },
      () => console.log(" Mongoose is connected")
    );
  } catch (e) {
    console.log("could not connect");
  }

  const itemsSchema = new mongoose.Schema({
    name: {
      type: String,
      required: [true, 'Why no name?']
    }
  })

  const Item = mongoose.model("Item", itemsSchema);

  const item1 = new Item({
    name: "Finish Homework"
  });

  const item2 = new Item({
    name: "Buy Turkey Lunchables"
  });

  const item3 = new Item({
    name: "Buy Apple Juice"
  });

  const item4 = new Item({
    name: "Finish Web Development Lessons"
  });

  const item5 = new Item({
    name: "Finish Project"
  });

  const defaultItems = [item1, item2, item3, item4, item5];


  const listSchema = new mongoose.Schema({
    name: {
      type: String,
      required: [true, 'Why no name?']
    },
    items: [itemsSchema]
  })

  const List = mongoose.model("List", listSchema)

  app.get("/", function (req, res) {

    //const day = date.getDate();

    Item.find({}, function (err, results) {
      if (results.length === 0) {
        Item.insertMany(defaultItems, function (err) {
          if (err) {
            console.log(err)
          } else {
            console.log("Default items successfully inserted.")
          }
        })
        res.redirect("/")
      } else {
        console.log(results)
        res.render("list", {
          listTitle: "Today",
          newListItems: results
        });
      }
    })
  });

  app.post("/", function (req, res) {

    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
      name: itemName
    });

    if (listName === "Today") {
      item.save()
      res.redirect("/")
    } else {
      List.findOne({name: listName}, function(err, foundList) {
        foundList.items.push(item);
        foundList.save();
        res.redirect(`/${listName}`)
      })
    }



    /*  if (req.body.list === "Work") {
       workItems.push(item);
       res.redirect("/work");
     } else {
       items.push(item);
       res.redirect("/");
     } */
  });

  app.post("/delete", function (req, res) {

    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today") {
      Item.findByIdAndRemove(checkedItemId, function (err) {
        if (err) {
          console.log(err)
  
        } else {
          console.log("Item successfully removed.")
          res.redirect("/")
        }
      });
    } else {
      List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, results) {
        if (err) {
          console.log(err)
  
        } else {
          console.log("Item successfully removed.")
          res.redirect(`/${listName}`)
        }

      })
    }

    
  });

  app.get("/:customListName", function (req, res) {
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({
      name: customListName
    }, function (err, foundList) {
      if (!err) {
        if (!foundList) {
          //Create a new list
          const list = new List({
            name: customListName,
            items: defaultItems
          })

          list.save()
          res.redirect(`/${customListName}`)
        } else {
          //Show an existing list
          res.render("list", {
            listTitle: foundList.name,
            newListItems: foundList.items
          })
        }
      }
    })


    //res.render("about");
  });

  /* Item.insertMany(defaultItems, function(err) {
    if (err) {
      console.log(err)
    } else {
      console.log("Default items successfully inserted.")
    }
   })
 */
}


/* const items = ["Buy Food", "Cook Food", "Eat Food"];
const workItems = []; */

/* app.get("/", function (req, res) {

  //const day = date.getDate();

  res.render("list", {
    listTitle: "Today",
    newListItems: items
  });

}); */

/* app.post("/", function (req, res) {

  const itemName = req.body.newItem;

 /*  if (req.body.list === "Work") {
    workItems.push(item);
    res.redirect("/work");
  } else {
    items.push(item);
    res.redirect("/");
  } 
}); */

/* app.get("/work", function (req, res) {
  res.render("list", {
    listTitle: "Work List",
    newListItems: workItems
  });
});

app.get("/about", function (req, res) {
  res.render("about");
}); */

let port = process.env.PORT;
if (port == null || port == "") {
  port = 4000;
}

app.listen(port, function () {
  console.log("Server has started successfully.");
});
