#!/bin/bash
CONFFILE=/tmp/conf.sh

download_file() {
    if [ -n "$2" ]; then
        wget "$1" --user="$2" --password="$3" -O $4
    else
        wget "$1" -O $2
    fi
    if [ $? -ne 0 ]; then
        echo "Warning: environment configuration file failed to download; ignoring"
        return 1
    fi
    return 0
}

function run_conf(){
    echo "Sourcing configuration file $CONFFILE"
    if [ -f $CONFFILE ]; then
        chmod +x $CONFFILE
        source $CONFFILE
        rm -f $CONFFILE
    else
        echo "Warning: environment configuration file: $CONFFILE not found; ignoring"
    fi
}

if [ -n "$ENVCONFURL" ]; then
    # If the docker invocation provided $ENVCONFURL then the user wants to use the configuration
    # hosted in the repository and hence overwrite current configuration with that
    echo "Trying to download environment config from '$ENVCONFURL'"
    if [[ -n "$REPOUSR" && -n "$REPOPWRD" ]]; then
        download_file $ENVCONFURL $REPOUSR $REPOPWRD $CONFFILE
        if [ $? -eq 0 ]; then
            run_conf
        fi
    else
        echo "Warning: Cannot download environment config from repository due to missing credentials; ignoring"
    fi
fi

echo "Configuring Wildfly"
python ./config-wildfly.py
cat $JBOSS_HOME/standalone/configuration/standalone.xml
echo

echo "Processing Olympus configuration"
python ./process-config.py
cat $JBOSS_HOME/standalone/deployments/olympus.war/resources/xml/olympus.xml
echo

# echo 'Adding Admin User to JBoss'
# $JBOSS_HOME/bin/add-user.sh $ADMIN_USER $ADMIN_PWD --silent

echo 'Starting JBoss'
#-Djdk.tls.ephemeralDHKeySize=2048 don't use that for now as not all clients upgraded to Java 8 yet and support this size
$JBOSS_HOME/bin/standalone.sh -b 0.0.0.0 -bmanagement 0.0.0.0 -Djboss.http.port=8080 # -Djboss.https.port=443