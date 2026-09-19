#!/usr/bin/env python3
"""Generate three separated nuclei containing 0, 2 and 3 point-like foci.
PGM fixtures need only the Python standard library. These are not biological data.
"""
import argparse,pathlib,csv,math
def generate(output):
    out=pathlib.Path(output);out.mkdir(parents=True,exist_ok=True)
    width=192;height=96;centres=[(32,48),(96,48),(160,48)];counts=[0,2,3]
    nuclear=bytearray(width*height);foci=bytearray(width*height)
    for i,(cx,cy) in enumerate(centres):
        for y in range(height):
            for x in range(width):
                if (x-cx)**2+(y-cy)**2<19**2:nuclear[y*width+x]=180
        offsets=[(-7,-5),(7,5),(0,-9)]
        for dx,dy in offsets[:counts[i]]:
            for y in range(cy+dy-3,cy+dy+4):
                for x in range(cx+dx-3,cx+dx+4):foci[y*width+x]=max(foci[y*width+x],int(240*math.exp(-((x-cx-dx)**2+(y-cy-dy)**2)/2)))
    for name,data in [('nuclei',nuclear),('foci',foci)]: (out/f'{name}.pgm').write_bytes(f'P5\n{width} {height}\n255\n'.encode()+data)
    (out/'metadata.csv').write_text('image_id,replicate_id,condition\nsynthetic,fixture-1,synthetic-only\n')
    (out/'expected-counts.txt').write_text('Sorted per-nucleus counts: 0, 2, 3. Not a scientific validation dataset.\n')
if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('output');a=p.parse_args();generate(a.output)
