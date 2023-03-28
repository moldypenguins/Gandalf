# Ubuntu 22.04.1

## Parameters
* [HOSTNAME] = domain.com
* [DEFAULTUSER] = ubuntu
* [USERNAME] = administrator
* [USERPASS] = P@ssw0rd
* [USEREMAIL] = administrator@domain.com
* [BOTNAME] = Somebot
* [DATABASENAME] = Mordor
* [DATABASEUSER] = Gandalf
* [DATABASEPASS] = abcd1234



## Login as [DEFAULTUSER]

### set hostname
```bash 
hostname  
sudo hostnamectl set-hostname [HOSTNAME]  
sudo hostnamectl 
sudo vi /etc/hostname 
  [HOSTNAME] 
sudo vi /etc/hosts 
  [IPADDRESS] [HOSTNAME] [NAME] 
```
### create user / add ssh key
```bash
sudo adduser [USERNAME]
sudo usermod -aG sudo [USERNAME]
su - [USERNAME]
sudo whoami
mkdir ~/.ssh
chmod 700 ~/.ssh
vi ~/.ssh/authorized_keys
  [AUTH_KEY]
chmod 600 ~/.ssh/authorized_keys
exit
```
### edit ssh daemon
```bash
sudo vi /etc/ssh/sshd_config
    Port 22
    PermitRootLogin no
    PubkeyAuthentication yes
    AuthorizedKeysFile .ssh/authorized_keys
    PasswordAuthentication no
    PermitEmptyPasswords no
sudo systemctl restart sshd
exit
S
## Login as [USERNAME]

```bash
#repeat until no more updates
sudo apt update
sudo apt upgrade
sudo apt-get update
sudo apt-get upgrade
sudo reboot
```

## Login as [USERNAME]

### install Linus
```bash 
# https://github.com/CISOfy/lynis/

sudo apt-get install lynis
lynis show version
```

### install CrowdSec
```bash
# https://github.com/crowdsecurity/crowdsec

sudo wget -O - https://packages.cisofy.com/keys/cisofy-software-public.key | sudo apt-key add -
# Warning: apt-key is deprecated. Manage keyring files in trusted.gpg.d instead (see apt-key(8)).
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


### install sendmail
```bash
sudo apt-get install sendmail
#sudo vi /etc/mail/sendmail.conf
sudo sendmailconfig
- put sendmail src instructions here
```

### configure ufw
```bash
sudo vi /etc/default/ufw
  IPV6=yes
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow http
sudo ufw allow https
sudo ufw allow ssh
sudo ufw enable
sudo ufw status
```

### install mongodb
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
sudo vi /etc/apt/sources.list.d/mongodb-org-5.0.list
  deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse
sudo apt-get update

wget http://archive.ubuntu.com/ubuntu/pool/main/o/openssl/libssl1.1_1.1.1f-1ubuntu2_amd64.deb
sudo dpkg -i libssl1.1_1.1.1f-1ubuntu2_amd64.deb

sudo apt-get install -y mongodb-org
#start mongod on boot
sudo systemctl enable mongod
#start mongod
sudo systemctl start mongod
sudo systemctl status mongod
#test mongo
mongo
#use admin
#db.createUser({user:'[USERNAME]',pwd:'[USERPASS]',roles:[{role:'userAdminAnyDatabase',db:'admin'},{role:'readWriteAnyDatabase',db:'admin'}]})
#use [DATABASENAME]
#db.createUser({user: '[DATABASEUSER]', pwd: '[DATABASEPASS]', roles: ['readWrite']})
exit
#sudo vi /etc/mongod.conf
#    security:
#      authorization: enabled
#sudo systemctl restart mongod
# mongo --username [USERNAME] --password --authenticationDatabase admin
```

### install node.js and pnpm
```bash
sudo apt -y install gcc g++ make
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v
#curl -fsSL https://get.pnpm.io/install.sh | sh -
#sudo pnpm setup
sudo apt install node-typescript
sudo npm install -D typescript@next
```

### download git
```bash
git clone https://github.com/moldypenguins/Gandalf MiddleEarth
cd MiddleEarth/
npm i
```

### Qodana
```bash
sudo curl -fsSL https://jb.gg/qodana-cli/install | bash
#mv: cannot move './qodana' to '/usr/local/bin/qodana': Permission denied
```


### create local config
```bash
cd Galadriel/
vi src/local.ts
  [paste config]
pnpm build
ls -alf
cd ..
```

### install node modules
```bash
#verify the following
#sudo pm2 install pm2-logrotate
#sudo pm2 set pm2-logrotate:max_size 10M
#sudo pm2 set pm2-logrotate:compress true
```

```bash
#ssl certificate
#-suggest using cloudflare (with crowdsec)


#no webby atm
#cd ~/MiddleEarth/Sauron/ssl/
#openssl req -new -newkey rsa:2048 -nodes -keyout yourdomain.key -out yourdomain.csr
#cd ~/MiddleEarth/
```



```bash
cd Bilbo/
node Bilbo.js -s YYYY-MM-DDThh:mmZ
cd ..

#only use this for single unit testing
pm2 start Frodo/frodo.js
pm2 start Gandalf/gandalf.js
pnpm watch
```



## Other Helpful Commands
```bash
#pm2
pm2 list
pm2 monit
pm2 start MiddleEarth.config.js --only "Frodo,Gandalf,Sauron"

#check apps listening
sudo netstat -tulpn | grep LISTEN
```
