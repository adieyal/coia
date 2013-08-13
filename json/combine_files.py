#!/usr/bin/env python
import os
import json
import glob

regions = {}

for region in xrange(1, 8):
    if region == 7:
        region = 'all'
    else:
        region = '%d' % region

    print 'region %s' % region

    for i in xrange(8):
        absolute = {}
        target = {}
        target['indicators'] = []
        absolute['indicators'] = []
        regions[region] = target

        indicator = '%d' % (i + 1)
        print 'indicator %s' % indicator
        for ind_dir in glob.glob('indicators/%s*' % indicator):
            if ind_dir.count('.') > 1:
                continue

            achieve_dir = os.path.join(ind_dir, 'achieved', '%s.json' % region)

            obj = {}
            with open(achieve_dir, 'r') as f:
                try:
                    data = json.loads(f.read())
                except Exception:
                    print  'Error:', achieve_dir
                    continue

                if len(data) > 1:
                    print data
                    exit()
                data = data[0]

                obj['indicator'] = data['indicator']
                obj['target'] = data['target']
                obj['countries'] = data['countries']
                obj['sources'] = data['sources']

                target['indicators'].append(obj)

            summary_dir = os.path.join(ind_dir, 'summary', '%s.json' % region)
            with open(summary_dir, 'r') as f:
                data = json.loads(f.read())

                data = data[0]

                obj['scores'] = data['scores']
                target['region'] = data['region']

        if indicator == '1':
            absolute['region'] = target['region']

            box_dir = os.path.join('indicators/1.1/box/%s.json' % region)
            with open(box_dir, 'r') as f:
                data = json.loads(f.read())
                data = data[0]
                if region == 'all':

                    absolute['sources'] = data['sources']
                    absolute['indicators'].append(data['regions'])
                else:
                    for key in data['regions']:
                        if key['name'] == target['region']:
                            key['name'] = 'Indicator 1.1'
                            key['target'] = data['target']
                            absolute['sources'] = data['sources']
                            key['sources'] = data['sources']
                            absolute['indicators'].append(key)

            box_dir = os.path.join('indicators/1.2/box/%s.json' % region)
            with open(box_dir, 'r') as f:
                data = json.loads(f.read())
                data = data[0]

                if region == 'all':
                    absolute['sources'].extend(data['sources'])
                    absolute['indicators'].append(data['regions'])
                else:
                    for key in data['regions']:
                        if key['name'] == target['region']:
                            key['name'] = 'Indicator 1.2'
                            key['target'] = data['target']
                            absolute['sources'].extend(data['sources'])
                            key['sources'] = data['sources']
                            absolute['indicators'].append(key)

            out_dir = 'absolute/%s/' % indicator
            if not os.path.isdir(out_dir):
                os.makedirs(out_dir)

            out_file = os.path.join(out_dir, '%s.json' % region)
            with open(out_file, 'w') as f:
                f.write(json.dumps(absolute))

        out_dir = 'target/%s/' % indicator
        if not os.path.isdir(out_dir):
            os.makedirs(out_dir)

        out_file = os.path.join(out_dir, '%s.json' % region)
        with open(out_file, 'w') as f:
            f.write(json.dumps(target))

