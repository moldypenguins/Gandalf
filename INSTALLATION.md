# Ubuntu 22.04.1

## Parameters
* [HOSTNAME] = domain.com
* [ROOTUSER] = root
* [USERNAME] = administrator
* [USEREMAIL] = administrator@domain.com
* [BOTNAME] = Somebot
* [DATABASENAME] = Mordor
* [DATABASEUSER] = administrator
* [DATABASEPASS] = abcd1234


## Server Setup
* Login [ROOTUSER]
```bash
sudo apt-get update
sudo apt-get upgrade
#sudo apt install apt-transport-https
```


### Linus
```bash 
# https://github.com/CISOfy/lynis/

sudo apt-get install lynis
lynis show version
```

### CrowdSec
```bash
# https://github.com/crowdsecurity/crowdsec

sudo wget -O - https://packages.cisofy.com/keys/cisofy-software-public.key | sudo apt-key add -



curl -s https://packagecloud.io/install/repositories/crowdsec/crowdsec/script.deb.sh | sudo bash
sudo apt-get update
sudo apt-get install crowdsec

sudo apt install crowdsec-firewall-bouncer-iptables

sudo npm install @crowdsec/express-bouncer

# https://docs.crowdsec.net/docs/bouncers/cloudflare/
sudo apt-get install crowdsec-cloudflare-bouncer
# auto-generate cloudflare src for provided space separated tokens 
sudo crowdsec-cloudflare-bouncer -g <CLOUDFLARE_TOKEN1>,<CLOUDFLARE_TOKEN2> -o /etc/crowdsec/bouncers/crowdsec-cloudflare-bouncer.yaml
# this sets up IP lists and firewall rules at cloudflare for the provided src. 
sudo crowdsec-cloudflare-bouncer -s
# the bouncer now syncs the crowdsec decisions with cloudflare components.
sudo systemctl start crowdsec-cloudflare-bouncer
```


### install ntupdate
```bash
sudo apt-get install ntpdate
sudo ntpdate time.windows.com
```





### set hostname
```bash 
hostname  
hostnamectl set-hostname [HOSTNAME]  
hostnamectl 
vi /etc/hostname 
  [HOSTNAME] 
vi /etc/hosts 
  [IPADDRESS] [HOSTNAME] [NAME] 
```
```bash
#create user, add ssh key, lock root password, update sshd_config  
adduser [USERNAME]
usermod -aG sudo [USERNAME]
su - [USERNAME]
sudo whoami
mkdir ~/.ssh
chmod 700 ~/.ssh
vi ~/.ssh/authorized_keys
  [AUTH_KEY]
chmod 600 ~/.ssh/authorized_keys
exit
passwd -l root
sudo vi /etc/ssh/sshd_config
    Port 22
    PermitRootLogin no
    PubkeyAuthentication yes
    AuthorizedKeysFile .ssh/authorized_keys .ssh/authorized_keys2
    PasswordAuthentication no
    PermitEmptyPasswords no
    ChallengeResponseAuthentication no
sudo systemctl restart sshd
#/etc/init.d/ssh restart
exit
```
* Login [USERNAME]
```bash
#install fail2ban/sendmail
sudo apt-get update
sudo apt-get upgrade
sudo apt-get install fail2ban
sudo apt-get install sendmail
#sudo vi /etc/mail/sendmail.conf
sudo sendmailconfig
-put sendmail src instructions here
```
```bash
#configure fail2ban/sendmail
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
cd /etc/fail2ban
sudo cp jail.conf jail.local
sudo vi jail.local
  ignoreip = 127.0.0.1
  bantime  = 3600
  maxretry = 3 
  destemail = [USEREMAIL]
  action = %(action_mw)s 
sudo /etc/init.d/fail2ban restart
cd ~
```

```bash
#install mongodb
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
sudo vi /etc/apt/sources.list.d/mongodb-org-5.0.list
  deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse
sudo apt-get update
sudo apt-get install -y mongodb-org
#sudo vi /etc/mongod.conf
#  port: 27017
#start mongod on boot
sudo systemctl enable mongod
#start mongod
sudo systemctl start mongod
sudo systemctl status mongod
#test mongo
mongo
exit
```
```bash
#install node.js/npm/nodemon
#curl -sL https://deb.nodesource.com/setup_14.x -o setup_14.sh
#curl -sL https://deb.nodesource.com/setup_16.x -o setup_16.sh
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
#sudo sh ./setup_16.sh
#sudo apt update
sudo apt-get install -y nodejs
node -v
#sudo apt install npm
npm -v
sudo apt -y install gcc g++ make
sudo npm install -g nodemon
```

## Bot Setup
```bash
#git clone https://github.com/moldypenguins/Gandalf MiddleEarth
-put instructions for using github (preferred method)

#download specific version
wget https://github.com/moldypenguins/Gandalf/archive/refs/tags/v0.4.5-beta.tar.gz
mkdir MiddleEarth
tar -xf v0.4.5-beta.tar.gz -C MiddleEarth
#mv MiddleEarth/Gandalf-0.4.5-beta/* MiddleEarth/
#mv MiddleEarth/Gandalf-0.4.5-beta/.idea/ MiddleEarth/
#mv MiddleEarth/Gandalf-0.4.5-beta/.gitignore MiddleEarth/
#mv MiddleEarth/Gandalf-0.4.5-beta/.github/ MiddleEarth/
rm -R MiddleEarth/Gandalf-0.4.5-beta/

cd MiddleEarth
ll
sudo npm install
sudo npm audit fix
#create src.js
cp Config.example.js Config.js
vi Config.js
#create page content
cp views/content/dashboard.example.html views/content/dashboard.html
vi views/content/dashboard.html
#do the same for the remaining content files...if required

#Symbolic Links (if not created automatically after install)
cd ~/MiddleEarth/
ln -sf ../../node_modules/jquery/dist/jquery.min.js ./public/scripts/jquery.min.js
ln -sf ../../node_modules/@popperjs/core/dist/umd/popper.min.js ./public/scripts/popper.min.js
ln -sf ../../node_modules/@popperjs/core/dist/umd/popper.min.js.map ./public/scripts/popper.min.js.map
ln -sf ../../node_modules/@popperjs/core/dist/umd/popper.min.js.flow ./public/scripts/popper.min.js.flow
ln -sf ../../node_modules/bootstrap/dist/js/bootstrap.min.js ./public/scripts/bootstrap.min.js
ln -sf ../../node_modules/bootstrap/dist/js/bootstrap.min.js.map ./public/scripts/bootstrap.min.js.map
ln -sf ../../node_modules/bootstrap/dist/css/bootstrap.min.css ./public/styles/bootstrap.min.css
ln -sf ../../node_modules/bootstrap/dist/css/bootstrap.min.css.map ./public/styles/bootstrap.min.css.map
ln -sf ../../node_modules/bootstrap-table/dist/bootstrap-table.min.js ./public/scripts/bootstrap-table.min.js
ln -sf ../../node_modules/bootstrap-table/dist/bootstrap-table.min.css ./public/styles/bootstrap-table.min.css
ln -sf ../node_modules/@fortawesome/fontawesome-free/webfonts/ ./public/
ln -sf ../../node_modules/@fortawesome/fontawesome-free/css/all.min.css ./public/styles/fontawesome.min.css
ln -sf ../../node_modules/clipboard/dist/clipboard.min.js ./public/scripts/clipboard.min.js
ln -sf ../../node_modules/intl-tel-input/build/css/intlTelInput.min.css ./public/styles/intlTelInput.min.css
ln -sf ../../node_modules/intl-tel-input/build/js/intlTelInput-jquery.min.js ./public/scripts/intlTelInput-jquery.min.js
ln -sf ../../node_modules/intl-tel-input/build/js/utils.js ./public/scripts/intlTelInput-utils.js
ln -sf ../node_modules/intl-tel-input/build/img/ ./public/flags

#ssl certificate
-suggest using cloudflare
cd ~/MiddleEarth/ssl/
openssl req -new -newkey rsa:2048 -nodes -keyout yourdomain.key -out yourdomain.csr

cd ~/MiddleEarth/
```

### Bilbo
```bash
node Bilbo.js [-s|--start YYYYMMDDThhZ]
#Wait for the script to finish
#Press Ctrl+C
```

### Frodo
```bash
screen -dmS Frodo
screen -r Frodo
nodemon Frodo.js [-c|--havoc] [-o|--overwrite]
Press Ctrl+A, D
```

### Gandalf
```bash
screen -dmS Gandalf
screen -r Gandalf
nodemon Gandalf.js
Press Ctrl+A, D
```

### Sauron
```bash
#ln -s node_modules/@fortawesome/fontawesome-free/webfonts/ public/
screen -dmS Sauron
screen -r Sauron
sudo nodemon Sauron.js
#Press Ctrl+A, D
```

## Other Helpful Commands
```bash
#check apps listening
sudo netstat -tulpn | grep LISTEN
```