PI_NAME=pi
PI_IP=10.78.46.82
rsync -avzh ../sbsunit/ $PI_NAME@$PI_IP:~/SBSv4/
read -p "Do you want to install SBS?" -n 1 -r
echo    # (optional) move to a new line
if [[ $REPLY =~ ^[Yy]$ ]]
then
  ssh $PI_NAME@$PI_IP 'sudo ~/SBSv4/install.sh'
fi
read -p "Do you want to run SBS?" -n 1 -r
echo    # (optional) move to a new line
if [[ $REPLY =~ ^[Yy]$ ]]
then
  ssh $PI_NAME@$PI_IP 'cd SBSv4 ; sudo python SBS.py'
fi
