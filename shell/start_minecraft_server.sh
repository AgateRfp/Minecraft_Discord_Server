pid=`pidof java`
if [ -n "$pid"]; then
    cd ~/Minecraft_Server && java -Xms6G -Xms6G -jar server.jar nogui
else
    echo "server already launched."
fi