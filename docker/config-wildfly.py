import sys, os
from xml.etree import ElementTree

if not 'JBOSS_HOME' in os.environ:
    print "JBOSS_HOME env not specified! Aborting..."
    sys.exit(1)

config_filename = os.environ['JBOSS_HOME'] + "/standalone/configuration/standalone.xml"

tree = ElementTree.parse(config_filename)
root = tree.getroot()

undertow_subsystem = root.find('{urn:jboss:domain:4.2}profile/{urn:jboss:domain:undertow:3.1}subsystem')

undertow_filters = undertow_subsystem.find('{urn:jboss:domain:undertow:3.1}filters')

# <response-header name="cache-control" header-name="Cache-Control" header-value="no-cache"/>
cache_control_filter = ElementTree.SubElement(undertow_filters, '{urn:jboss:domain:undertow:3.1}response-header')
cache_control_filter.set('name', 'cache-control')
cache_control_filter.set('header-name', 'Cache-Control')
cache_control_filter.set('header-value', 'no-cache')

undertow_server_host = undertow_subsystem.find('{urn:jboss:domain:undertow:3.1}server/{urn:jboss:domain:undertow:3.1}host')

# <filter-ref name="cache-control" predicate="path-suffix['.html'] or path['/olympus']"/>
cache_control_filter_ref = ElementTree.SubElement(undertow_server_host, '{urn:jboss:domain:undertow:3.1}filter-ref')
cache_control_filter_ref.set('name', 'cache-control')
cache_control_filter_ref.set('predicate', 'path-suffix[\'.html\'] or path[\'/olympus\']')

tree.write(config_filename)