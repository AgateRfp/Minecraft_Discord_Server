pid=`pidof java`
if [ -n "$pid"]; then
    echo "server is out of service."
else
    killall java
fi