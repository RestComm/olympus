import sys, os
from xml.etree import ElementTree

if not 'JBOSS_HOME' in os.environ:
    print "JBOSS_HOME env not specified! Aborting..."
    sys.exit(1)

config_filename = os.environ['JBOSS_HOME'] + "/standalone/configuration/standalone.xml"

tree = ElementTree.parse(config_filename)
root = tree.getroot()

# configure logging
logging_subsystem = root.find('{urn:jboss:domain:4.2}profile/{urn:jboss:domain:logging:3.0}subsystem')

rolling_file_handler = logging_subsystem.find('{urn:jboss:domain:logging:3.0}periodic-rotating-file-handler')

# remove rolling file handler if present
if rolling_file_handler is not None:
    logging_subsystem.remove(rolling_file_handler)

# add size rotating file handler if not present
if logging_subsystem.find('{urn:jboss:domain:logging:3.0}size-rotating-file-handler') is None:
    size_rot_file_handler = ElementTree.SubElement(logging_subsystem, '{urn:jboss:domain:logging:3.0}size-rotating-file-handler')
    size_rot_file_handler.set('name', 'FILE')
    size_rot_file_handler.set('autoflush', 'true')
    size_rot_file_handler__formatter = ElementTree.SubElement(size_rot_file_handler, '{urn:jboss:domain:logging:3.0}formatter')
    size_rot_file_handler__formatter__named_formatter = ElementTree.SubElement(size_rot_file_handler__formatter, '{urn:jboss:domain:logging:3.0}named-formatter')
    size_rot_file_handler__formatter__named_formatter.set('name', 'PATTERN')
    size_rot_file_handler__file = ElementTree.SubElement(size_rot_file_handler, '{urn:jboss:domain:logging:3.0}file')
    size_rot_file_handler__file.set('relative-to', 'jboss.server.log.dir')
    size_rot_file_handler__file.set('path', 'server.log')
    size_rot_file_handler__rotate_size = ElementTree.SubElement(size_rot_file_handler, '{urn:jboss:domain:logging:3.0}rotate-size')
    size_rot_file_handler__rotate_size.set('value', '2m')
    size_rot_file_handler__max_backup_index = ElementTree.SubElement(size_rot_file_handler, '{urn:jboss:domain:logging:3.0}max-backup-index')
    size_rot_file_handler__max_backup_index.set('value', '5')
    size_rot_file_handler__append = ElementTree.SubElement(size_rot_file_handler, '{urn:jboss:domain:logging:3.0}append')
    size_rot_file_handler__append.set('value', 'true')

# configure undertow
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