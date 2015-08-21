#! /bin/sh
SCRIPT_NAME=dioty


# copy script file as executable into init.d
sudo cp start.sh /etc/init.d/$SCRIPT_NAME
sudo chmod 755 /etc/init.d/$SCRIPT_NAME

# register script to be run at start-up
sudo update-rc.d $SCRIPT_NAME defaults

# start the script
sudo /etc/init.d/$SCRIPT_NAME start

