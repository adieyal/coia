#!/usr/bin/env python


import glob
import json
output = []
for i in glob.glob('*.json'):
    with open(i, 'r') as f:
        data = json.loads(f.read())
        index = int(i.replace('.json', ''))
        name = data['country_name']
        output.append({'index': index, 'name': name})


print json.dumps(output)