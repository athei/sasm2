#!/usr/bin/env python3
import sys
import os
from itertools import chain
from pathlib import Path

project_dir = Path(os.path.realpath(os.path.join(os.path.dirname(sys.argv[0]), '..')))
dist_dir = project_dir.joinpath('dist')
