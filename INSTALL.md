-replace values
[HOSTNAME] = ztpa.ca
[SSHPORT] = 22222
[USERNAME] = cr
[USEREMAIL] = moldypenguins@crdevel.com
[BOTNAME] = Gandalf
[DATABASENAME] = padb
[DATABASEUSER] = pauser
[DATABASEPASS] = G@nda1fr


-login as root
  #set hostname
  hostname
  hostnamectl set-hostname [HOSTNAME]
  hostnamectl
  ls -l /etc/cloud/cloud.cfg
    hostname: [HOSTNAME]
    preserve_hostname: true
  vi /etc/hostname
    [HOSTNAME]
  vi /etc/hosts
    [IPADDRESS] [HOSTNAME] []
  #create user, add ssh key, lock root password, update sshd_config 
  adduser [USERNAME]
  usermod -aG sudo [USERNAME]
  su - [USERNAME]
  sudo whoami
  mkdir ~/.ssh
  chmod 700 ~/.ssh
  vi ~/.ssh/authorized_keys
  chmod 600 ~/.ssh/authorized_keys
  exit
  passwd -l root
  sudo vi /etc/ssh/sshd_config
      Port [SSHPORT]
      PasswordAuthentication no
      PermitRootLogin no
  /etc/init.d/ssh restart
  exit
  
  
-login as [USERNAME]
  #install/configure fail2ban/sendmail
  sudo apt-get update
  sudo apt-get install fail2ban
  sudo apt-get install sendmail
  sudo vi /etc/mail/sendmail.conf
  sudo sendmailconfig
  sudo ufw app list
  sudo ufw allow [SSHPORT]
  sudo ufw enable
  sudo ufw status
  sudo fail2ban-client status
  sudo cd /etc/fail2ban
  sudo cp jail.conf jail.local
  sudo vi jail.local
      ignoreip = 127.0.0.1
      bantime  = 3600
      maxretry = 3 
      destemail = [USEREMAIL]
      action = %(action_mw)s 
  sudo /etc/init.d/fail2ban restart
  
  
  
  sudo apt install ntpdate
  sudo ntpdate time.windows.com
  
  
  #install mongodb
  wget -qO - https://www.mongodb.org/static/pgp/server-4.2.asc | sudo apt-key add -
  sudo vi /etc/apt/sources.list.d/mongodb-org-4.2.list
      deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu bionic/mongodb-org/4.2 multiverse
  sudo apt-get update
  sudo apt-get install -y mongodb-org
  sudo vi /etc/mongod.conf
      port: 27017
  #start mongod on boot
  sudo systemctl enable mongod
  #start mongod
  sudo systemctl start mongod
  sudo systemctl status mongod
  sudo mongo
  exit
  
  
  #install node.js
  sudo apt update
  sudo apt install nodejs
  nodejs -v
  sudo apt install npm
  npm -v
  sudo apt install build-essential
  sudo npm install -g npx
  sudo npm install -g nodemon
  
  
  
  
  
  
  
  #setup
  mkdir ~/[BOTNAME]
  cd ~/[BOTNAME]/
  sudo npm install xml2js
  sudo npm install mongodb
  sudo npm install mongoose
  rm package-lock.json
  
  
  
  #bot
  mkdir ~/[BOTNAME]/bot
  cd ~/[BOTNAME]/bot/
  vi package.json
  sudo npm install mongodb --save
  sudo npm install mongoose --save
  sudo npm install numeral --save
  sudo npm install telegraf --save

  sudo npm install
  vi [BOTNAME].js
  screen -dmS bot
  screen -r bot
  sudo nodejs [BOTNAME]
  Press Ctrl+A+D
  
  
  
  
  #web
  mkdir ~/[BOTNAME]/web
  cd ~/[BOTNAME]/web/
  sudo npm install --save express
  npx express-generator --view=pug
  vi package.json
  sudo npm install express-session --save
  sudo npm install mongodb --save
  sudo npm install mongoose --save
  
  sudo npm install --save @fortawesome/fontawesome-free
    ln -s /home/root/MiddleEarth/Sauron/node_modules/@fortawesome/fontawesome-free/webfonts/ /home/root/MiddleEarth/Sauron/public/
    ln -s /home/root/MiddleEarth/Sauron/node_modules/@fortawesome/fontawesome-free/css/all.min.css /home/root/MiddleEarth/Sauron/public/styles/
    
  sudo npm install --save clipboard
    ln -s /home/root/MiddleEarth/Sauron/node_modules/clipboard/dist/clipboard.min.js /home/root/MiddleEarth/Sauron/public/scripts/
  
  
  sudo npm install
  vi app.js
  vi db.js
  mkdir models
  vi models/user.js
  vi routes/Smaug.js
  vi routes/TheBlackGate.js
  vi public/stylesheets/style.css
  vi views/layout.pug
  vi views/error.pug
  vi views/home.pug
  vi views/register.pug
  
  mkdir ssl
  cd ssl
  openssl genrsa -out key.pem 2048
  openssl req -new -key key.pem -out client.csr
  openssl x509 -req -in client.csr -signkey key.pem -out cert.pem
  rm client.csr
  cd ..
  
  screen -dmS web
  screen -r web
  sudo npm start
  Press Ctrl+A+D
  
  
  






-check apps listening
  sudo netstat -tulpn | grep LISTEN
  
  
  
  

  









