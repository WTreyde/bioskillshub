#!/usr/bin/env python3
"""Compare recorded paired runs; never run tools or invent missing scientific metrics."""
import argparse,json,math,pathlib

MATCHED=('case','model','runtime_version','tool_versions','input_hashes','checkpoint_sha256','reference_protocol','frozen_rubric','seed','time_limit_seconds')
def compare(baseline,assisted):
    if baseline.get('condition')!='baseline' or assisted.get('condition')!='expert_skill':raise ValueError('Require baseline and expert_skill conditions.')
    for key in MATCHED:
        if baseline.get(key)!=assisted.get(key):raise ValueError('Unmatched comparison setting: '+key)
    for run in (baseline,assisted):
        for key in ('case','model','runtime_version','reference_protocol','frozen_rubric','reviewed_by'):
            if not isinstance(run.get(key),str) or not run[key].strip() or run[key].startswith(('TODO','UNCONFIRMED')):raise ValueError('Missing reviewed run field: '+key)
        if not run.get('input_hashes') or not run.get('tool_versions'):raise ValueError('Input hashes and tool versions are required.')
        for key in ('elapsed_seconds','time_limit_seconds'):
            if type(run.get(key)) not in (int,float) or not math.isfinite(run[key]) or run[key]<0:raise ValueError('Finite nonnegative timing required.')
        if type(run.get('completed')) is not bool or not isinstance(run.get('errors'),list):raise ValueError('Record completion and errors, including failed runs.')
    if not assisted.get('skill_id') or type(assisted.get('skill_version')) is not int or assisted['skill_version']<1 or not assisted.get('skill_sha256'):raise ValueError('Pin the expert skill and hash.')
    a=baseline.get('quality_metrics',{});b=assisted.get('quality_metrics',{})
    if not isinstance(a,dict) or not isinstance(b,dict) or set(a)!=set(b):raise ValueError('Both runs must record the same quality metrics.')
    metrics={}
    for key in a:
        if any(type(v) not in (int,float) or not math.isfinite(v) for v in (a[key],b[key])):raise ValueError('Metrics must be finite numbers.')
        metrics[key]={'baseline':a[key],'expert_skill':b[key],'difference':b[key]-a[key]}
    return {'scope':'exploratory paired run; no generalised improvement claim','both_completed':baseline['completed'] and assisted['completed'],'elapsed_seconds':{'baseline':baseline['elapsed_seconds'],'expert_skill':assisted['elapsed_seconds']},'metrics':metrics,'errors':{'baseline':baseline['errors'],'expert_skill':assisted['errors']},'human_interventions':{'baseline':baseline.get('human_interventions',[]),'expert_skill':assisted.get('human_interventions',[])}}

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('baseline');p.add_argument('assisted');p.add_argument('--output',required=True);args=p.parse_args()
    try:
        result=compare(json.loads(pathlib.Path(args.baseline).read_text()),json.loads(pathlib.Path(args.assisted).read_text()))
        target=pathlib.Path(args.output);target.parent.mkdir(parents=True,exist_ok=True);target.write_text(json.dumps(result,indent=2)+'\n');print('Paired comparison saved; inspect failed runs and frozen metric definitions before interpreting differences.')
    except (ValueError,OSError,KeyError,TypeError) as error:p.exit(1,'Comparison blocked: '+str(error)+'\n')
