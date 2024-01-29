import http from "http";
import fs from "fs";
import path from "path";
import * as url from "url";
let port = 8080;
let server = http.createServer((req, res) => {
  const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
  let todoPath = path.join(__dirname, "todo.html");
  let dbPath = path.join(__dirname, "db/data.js");
  //   this is for utilites function
  function print(originalData) {
    let str = "";
    originalData.map((item) => {
      str += ` <div class="col-md-3">
                      <div class="card">
                          <div class="card-body">
                              <h6>${item.text}</h6>
                          </div>
                          <div class="footer">
                          <form action="/action" method="POST"> 
                            <input type="hidden" name="action" value="edit" />
                            <input type="hidden" name="id" value="${item.id}"/>
                            <input type="submit" value="edit"/>
                           </form>
                           <form action="/action" method="POST"> 
                            <input type="hidden" name="action" value="delete"/>
                            <input type="hidden" name="id" value="${item.id}"/>
                            <input type="submit" value="delete"/>
                           </form>
                         </div>
                      </div>
                  </div>`;
    });
    fs.readFile(todoPath, "utf-8", (err, data) => {
      if (err) {
        res.end("somthing wrong");
      } else {
        let newtemp = data.replace(" <!-- add data here -->", str);
        res.end(newtemp);
      }
    });
  }

  //this is for first time for template
  if (req.url == "/" && req.method == "GET") {
    fs.readFile(todoPath, "utf-8", (err, datax) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "application/text" });
      } else {
        fs.readFile(dbPath, "utf-8", (err, data) => {
          if (err) {
            res.end("somthing wrong");
          } else {
            let originalData = JSON.parse(data);
            if (originalData.length > 0) {
              print(originalData);
            } else {
              res.end(datax);
            }
          }
        });
      }
    });
  }
  if (req.url == "/" && req.method == "POST") {
    let text = "";
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      let formData = new URLSearchParams(body);
      text = formData.get("text");
      let obj = { id: Math.trunc(Math.random() * 100000), text: text };
      fs.readFile(dbPath, "utf-8", (err, data) => {
        if (err) {
          res.sendDate("somthing wrong");
        } else {
          let originalData = JSON.parse(data);
          originalData.push(obj);
          fs.writeFile(dbPath, JSON.stringify(originalData), (err) => {
            if (err) {
              res.end("somthing wrong while writing");
            } else {
              print(originalData);
            }
          });
        }
      });
    });
  }
  if (req.url == "/action" && req.method == "POST") {
    let body = "";
    let action = "";
    let id = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      let formData = new URLSearchParams(body);
      action = formData.get("action");
      id = formData.get("id");
      if (action == "edit") {
        res.end("working on edit later");
      }
      if (action == "delete") {
        fs.readFile(dbPath, "utf-8", (err, data) => {
          if (err) {
            res.end("somthing wrong");
          } else {
            let originalData = JSON.parse(data);
            console.log("hello i am originaldata", originalData);
            console.log("ehllo i am id", id);
            let filterData = originalData.filter((item) => {
              return item.id != id;
            });
            console.log("hello i am filter data", filterData);
            fs.writeFile(dbPath, JSON.stringify(filterData), (err) => {
              if (err) {
                res.end("somthing wrong");
              } else {
                res.writeHead(302, { Location: "/" });
                res.end();
              }
            });
          }
        });
      }
    });
  }
});
server.listen(port, () => {
  console.log("server is listen at 8080");
});
