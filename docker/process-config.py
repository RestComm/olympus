###
# This script will parse olympus.xml configuration and update its content
# according to the following env variable(s):
#
# SERVER_SECURE
# SERVER_ADDRESS
# SERVER_PORT
# SERVER_SECURE_PORT
# SERVER_PATH
# CLIENT_REGISTER
# CLIENT_DOMAIN
# CLIENT_USER_AGENT
# STUN_ENABLED
# STUN_ADDRESS
# STUN_PORT
# TURN_ENABLED
# TURN_ADDRESS
# TURN_DOMAIN
# TURN_LOGIN
# TURN_PASSWORD
# CANDIDATE_TIMEOUT
#

import sys, os
from xml.etree import ElementTree

if not 'JBOSS_HOME' in os.environ:
    print "JBOSS_HOME env not specified! Aborting..."
    sys.exit(1)

config_filename = os.environ['JBOSS_HOME'] + "/standalone/deployments/olympus.war/resources/xml/olympus.xml"
# config_filename = 'target/olympus/resources/xml/olympus.xml.new'
# shutil.copy2('target/olympus/resources/xml/olympus.xml', config_filename)

tree = ElementTree.parse(config_filename)
root = tree.getroot()

if 'SERVER_SECURE' in os.environ:
    root.find('server').set('secure', os.environ['SERVER_SECURE'])
if 'SERVER_ADDRESS' in os.environ:
    root.find('server').find('address').text = os.environ['SERVER_ADDRESS']
if 'SERVER_PORT' in os.environ:
    root.find('server').find('port').text = os.environ['SERVER_PORT']
if 'SERVER_SECURE_PORT' in os.environ:
    root.find('server').find('secure-port').text = os.environ['SERVER_SECURE_PORT']
if 'SERVER_PATH' in os.environ:
    root.find('server').find('path').text = os.environ['SERVER_PATH']

if 'CLIENT_REGISTER' in os.environ:
    root.find('client').set('register', os.environ['CLIENT_REGISTER'])
if 'CLIENT_DOMAIN' in os.environ:
    root.find('client').find('domain').text = os.environ['CLIENT_DOMAIN']
if 'CLIENT_USER_AGENT' in os.environ:
    root.find('client').find('user-agent').text = os.environ['CLIENT_USER_AGENT']

if 'STUN_ENABLED' in os.environ:
    root.find('stun').set('enabled', os.environ['STUN_ENABLED'])
if 'STUN_ADDRESS' in os.environ:
    root.find('stun').find('address').text = os.environ['STUN_ADDRESS']
if 'STUN_PORT' in os.environ:
    root.find('stun').find('port').text = os.environ['STUN_PORT']

if 'TURN_ENABLED' in os.environ:
    root.find('turn').set('enabled', os.environ['TURN_ENABLED'])
if 'TURN_ADDRESS' in os.environ:
    root.find('turn').find('address').text = os.environ['TURN_ADDRESS']
if 'TURN_DOMAIN' in os.environ:
    root.find('turn').find('domain').text = os.environ['TURN_DOMAIN']
if 'TURN_LOGIN' in os.environ:
    root.find('turn').find('login').text = os.environ['TURN_LOGIN']
if 'TURN_PASSWORD' in os.environ:
    root.find('turn').find('password').text = os.environ['TURN_PASSWORD']
if 'CANDIDATE_TIMEOUT' in os.environ:
    root.find('webrtc-configuration').find('candidate-timeout').text = os.environ['CANDIDATE_TIMEOUT']

tree.write(config_filename)