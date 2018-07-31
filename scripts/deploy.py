#!/usr/bin/env python3
import gather
import subprocess

files = list(gather.dist_dir.glob('*'))

# Compress files for webserver
for f in files:
    subprocess.run(['gzip', '--keep', '--best', f])
    subprocess.run(['brotli', '--keep', '--best', f])

# Copy to webserver
subprocess.run(['rsync', '-r', '--delete', '--compress',  str(gather.dist_dir.absolute()) + '/', 'alexander@home.theissen.io:/var/www/sasm/'])
