#!/bin/bash

echo "Processing Olympus configuration"
python ./process-config.py
cat $JBOSS_HOME/standalone/deployments/olympus.war/resources/xml/olympus.xml
echo

# echo 'Adding Admin User to JBoss'
# $JBOSS_HOME/bin/add-user.sh $ADMIN_USER $ADMIN_PWD --silent

echo 'Starting JBoss'
#-Djdk.tls.ephemeralDHKeySize=2048 don't use that for now as not all clients upgraded to Java 8 yet and support this size
$JBOSS_HOME/bin/standalone.sh -b 0.0.0.0 -bmanagement 0.0.0.0 -Djboss.http.port=8080 # -Djboss.https.port=443