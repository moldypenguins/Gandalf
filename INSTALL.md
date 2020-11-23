# Installation

```shell script
[HOSTNAME] = domain.com
[USERNAME] = pauser
[USEREMAIL] = pauser@domain.com
[BOTNAME] = Gandalf
[DATABASENAME] = padb
[DATABASEUSER] = pauser
[DATABASEPASS] = G@nda1fr
```

## Server Setup
```shell script
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
      Port 22
      PermitRootLogin no
      PubkeyAuthentication yes
      AuthorizedKeysFile .ssh/authorized_keys .ssh/authorized_keys2
      PasswordAuthentication no
      ChallengeResponseAuthentication no
  /etc/init.d/ssh restart
  exit
```
```shell script
-login as [USERNAME]
  #install/configure fail2ban/sendmail
  sudo apt-get update
  sudo apt-get install fail2ban
  sudo apt-get install sendmail
  sudo vi /etc/mail/sendmail.conf
  sudo sendmailconfig
    #update some settings
  sudo vi /etc/default/ufw
      IPV6=yes
  sudo ufw default deny incoming
  sudo ufw default allow outgoing
  sudo ufw allow http
  sudo ufw allow https
  sudo ufw allow ssh
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
```
```shell script
  #install ntupdate
  sudo apt install ntpdate
  sudo ntpdate time.windows.com
```
```shell script
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
```
```shell script
  #install node.js
  sudo apt update
  sudo apt install nodejs
  nodejs -v
  sudo apt install npm
  npm -v
  sudo apt install build-essential
  sudo npm install -g npx
  sudo npm install -g nodemon
```


## Bot Setup
```shell script
  git https://github.com/moldypenguins/Gandalf MiddleEarth
  cd MiddleEarth
  sudo npm install
  #create config.js
  cp config.example.js config.js
  vi config.js
  #create page content
  cp views/content/dashboard.example.html views/content/dashboard.html
  vi views/content/dashboard.html
  #do the same for the remaining content files...
```

### Bilbo
```shell script
  sudo nodejs bilbo.js
  #Wait for the script to finish
  #Press Ctrl+C
```

### Frodo
```shell script
  screen -dmS Frodo
  screen -r Frodo
  sudo nodejs Frodo.js
  #if using nodemon
  sudo nodemon Frodo.js
  #Press Ctrl+A+D
```

### Gandalf
```shell script
  screen -dmS Gandalf
  screen -r Gandalf
  sudo nodejs Gandalf.js
  #if using nodemon
  sudo nodemon Gandalf.js
  #Press Ctrl+A+D
```

### Sauron
```shell script
  #@fortawesome/fontawesome-free
  ln -s node_modules/@fortawesome/fontawesome-free/webfonts/ public/
  ln -s node_modules/@fortawesome/fontawesome-free/css/all.min.css public/styles/
    
  #clipboard
  ln -s node_modules/clipboard/dist/clipboard.min.js public/scripts/

  screen -dmS Sauron
  screen -r Sauron
  sudo npm start
  #if using nodemon
  sudo nodemon --exec npm start
  #Press Ctrl+A+D
```


## Other Helpful Commands
```shell script
  #check apps listening
  sudo netstat -tulpn | grep LISTEN
```
