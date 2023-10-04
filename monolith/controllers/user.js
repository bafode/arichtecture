const Datastore = require("nedb")
const db = new Datastore({filename: __dirname + "/../.db/user", autoload: true})

class User {
    /** 
     *  @url=/user/auth
     *  @method=POST
     */
    static auth(req, res) {
        db.findOne({
            login:    req.body.login,
            password: req.body.password
        },(err, doc) =>{
            if (!doc){
                res.redirect("/login") 
                
                return 
            }
            
           const  session=req.session;
            session.user=doc;

          
            res.redirect("/")
        })
     
    }

     /** 
     *  @url=/user
     *  @method=GET
     */
    static user(req,res){
        if(req.session && req.session.username){
          res.send(req.session.username);
        }
        else{
          res.send('noUser');
        }
      }

    /** 
     *  @url=/user
     *  @method=POST
     */
    static register(req, res) {
        // Securise les données
        db.findOne({
            login:    req.body.login,
            password: req.body.password
        },(err, doc) =>{
            if (!doc){
                db.insert(req.body,(err) =>{
                    res.redirect(err ? "/register" : "/login") 
                })
                return 
            }


            res.redirect("/login")
        })
        
    }

    /** 
     *  @url=/logout
     *  @method=GET
     */
    static logout(req,res){
        req.session.destroy();
        res.redirect('/');
    };
}

module.exports = User