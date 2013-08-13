#!/usr/bin/env python

import requests
import os

indicators = ['1.1', '1.2', '1.3',
        '1.3.1', '1.3.2', '1.3.3', '1.3.4', '1.3.5',
    '1.5', '1.6',
        '1.7', '1.7.1',
    '2.1', '2.2',
        '2.2.1', '2.2.2', '2.2.3', '2.2.4', '2.2.5', '2.2.6', '2.2.7', '2.2.8',
    '2.3',
    '3.1', '3.1.1', '3.2',
    '4.1',
    '5.1',
    '6.1',
    '7.1',
    '8.1']


dirs = ['graph', 'aggregate', 'summary', 'box', 'achieved']
regions = ['%d' % x for x in xrange(1, 7)]
regions.append('all')

url = 'http://coia.webfactional.com/indicators/%s/%s/json/?region=%s'
for i in indicators:
    if not os.path.isdir(i):
        os.makedirs(i)

    for d in dirs:
        path = os.path.join(i, d)
        if not os.path.isdir(path):
            os.makedirs(path)
        for r in regions:

            filename = os.path.join(path, '%s.json' % r)

            if os.path.isfile(filename):
                print 'skipping %s' % filename
                continue

            fetch = url % (i, d, r)
            req = requests.get(fetch)
            print req.status_code, fetch
            with open(filename, 'w') as f:
                f.write(req.text)
